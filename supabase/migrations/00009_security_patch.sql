BEGIN;

-- ==============================================================================
-- 00009_security_patch.sql (V5 - NON-DESTRUCTIVE - FINAL)
-- ==============================================================================

-- ==========================================
-- 1. PRE-FLIGHT CHECKS
-- ==========================================
DO $$
DECLARE
    v_inconsistent_count INT;
BEGIN
    -- tenants with duplicate slugs
    SELECT COUNT(*) INTO v_inconsistent_count FROM (SELECT slug FROM public.tenants GROUP BY slug HAVING COUNT(*) > 1) d;
    IF v_inconsistent_count > 0 THEN RAISE EXCEPTION 'Pre-flight failed: % duplicate slugs found in tenants.', v_inconsistent_count; END IF;

    -- tenants with duplicate custom_domains
    SELECT COUNT(*) INTO v_inconsistent_count FROM (SELECT custom_domain FROM public.tenants WHERE custom_domain IS NOT NULL GROUP BY custom_domain HAVING COUNT(*) > 1) d;
    IF v_inconsistent_count > 0 THEN RAISE EXCEPTION 'Pre-flight failed: % duplicate custom_domains found in tenants.', v_inconsistent_count; END IF;

    -- slug vs custom_domain collision
    SELECT COUNT(*) INTO v_inconsistent_count FROM public.tenants t1 JOIN public.tenants t2 ON t1.slug = t2.custom_domain WHERE t1.id != t2.id;
    IF v_inconsistent_count > 0 THEN RAISE EXCEPTION 'Pre-flight failed: % collisions between slug and custom_domain found.', v_inconsistent_count; END IF;

    -- order_items without order
    SELECT COUNT(*) INTO v_inconsistent_count FROM public.order_items oi LEFT JOIN public.orders o ON oi.order_id = o.id WHERE o.id IS NULL;
    IF v_inconsistent_count > 0 THEN RAISE EXCEPTION 'Pre-flight failed: % order_items without a valid order.', v_inconsistent_count; END IF;

    -- order_items without product
    SELECT COUNT(*) INTO v_inconsistent_count FROM public.order_items oi LEFT JOIN public.products p ON oi.product_id = p.id WHERE p.id IS NULL;
    IF v_inconsistent_count > 0 THEN RAISE EXCEPTION 'Pre-flight failed: % order_items without a valid product.', v_inconsistent_count; END IF;

    -- order_items with cross-tenant order or product
    SELECT COUNT(*) INTO v_inconsistent_count FROM public.order_items oi 
    JOIN public.orders o ON oi.order_id = o.id 
    JOIN public.products p ON oi.product_id = p.id 
    WHERE o.tenant_id != p.tenant_id;
    IF v_inconsistent_count > 0 THEN RAISE EXCEPTION 'Pre-flight failed: % order_items reference cross-tenant orders/products.', v_inconsistent_count; END IF;

    -- orders without customer
    SELECT COUNT(*) INTO v_inconsistent_count FROM public.orders o LEFT JOIN public.customers c ON o.customer_id = c.id WHERE c.id IS NULL;
    IF v_inconsistent_count > 0 THEN RAISE EXCEPTION 'Pre-flight failed: % orders without a valid customer.', v_inconsistent_count; END IF;

    -- orders with cross-tenant customer
    SELECT COUNT(*) INTO v_inconsistent_count FROM public.orders o 
    JOIN public.customers c ON o.customer_id = c.id 
    WHERE o.tenant_id != c.tenant_id;
    IF v_inconsistent_count > 0 THEN RAISE EXCEPTION 'Pre-flight failed: % orders reference customers from a different tenant.', v_inconsistent_count; END IF;
    
    -- product_images without product
    SELECT COUNT(*) INTO v_inconsistent_count FROM public.product_images pi LEFT JOIN public.products p ON pi.product_id = p.id WHERE p.id IS NULL;
    IF v_inconsistent_count > 0 THEN RAISE EXCEPTION 'Pre-flight failed: % product_images without a valid product.', v_inconsistent_count; END IF;

    -- product_images with cross-tenant product
    SELECT COUNT(*) INTO v_inconsistent_count FROM public.product_images pi 
    JOIN public.products p ON pi.product_id = p.id 
    WHERE pi.tenant_id != p.tenant_id;
    IF v_inconsistent_count > 0 THEN RAISE EXCEPTION 'Pre-flight failed: % product_images reference products from a different tenant.', v_inconsistent_count; END IF;

    -- product_variants without product
    SELECT COUNT(*) INTO v_inconsistent_count FROM public.product_variants pv LEFT JOIN public.products p ON pv.product_id = p.id WHERE p.id IS NULL;
    IF v_inconsistent_count > 0 THEN RAISE EXCEPTION 'Pre-flight failed: % product_variants without a valid product.', v_inconsistent_count; END IF;

    -- product_variants with cross-tenant product
    SELECT COUNT(*) INTO v_inconsistent_count FROM public.product_variants pv 
    JOIN public.products p ON pv.product_id = p.id 
    WHERE pv.tenant_id != p.tenant_id;
    IF v_inconsistent_count > 0 THEN RAISE EXCEPTION 'Pre-flight failed: % product_variants reference products from a different tenant.', v_inconsistent_count; END IF;

    -- product_collections without product or collection
    SELECT COUNT(*) INTO v_inconsistent_count FROM public.product_collections pc 
    LEFT JOIN public.products p ON pc.product_id = p.id 
    LEFT JOIN public.collections c ON pc.collection_id = c.id
    WHERE p.id IS NULL OR c.id IS NULL;
    IF v_inconsistent_count > 0 THEN RAISE EXCEPTION 'Pre-flight failed: % product_collections without a valid product or collection.', v_inconsistent_count; END IF;

    -- product_collections with cross-tenant product/collection
    SELECT COUNT(*) INTO v_inconsistent_count FROM public.product_collections pc 
    JOIN public.products p ON pc.product_id = p.id 
    JOIN public.collections c ON pc.collection_id = c.id
    WHERE pc.tenant_id != p.tenant_id OR pc.tenant_id != c.tenant_id;
    IF v_inconsistent_count > 0 THEN RAISE EXCEPTION 'Pre-flight failed: % product_collections have tenant mismatches.', v_inconsistent_count; END IF;
END $$;

-- ==========================================
-- 2. CRM RELATIONAL INTEGRITY (Tenant_id & FKs) & SAFE MIGRATION
-- ==========================================

-- A. Prepare target UNIQUE constraints needed for FKs safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_id_tenant_id_key') THEN
        ALTER TABLE public.customers ADD CONSTRAINT customers_id_tenant_id_key UNIQUE (id, tenant_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_id_tenant_id_key') THEN
        ALTER TABLE public.orders ADD CONSTRAINT orders_id_tenant_id_key UNIQUE (id, tenant_id);
    END IF;
    
    -- NOTA: No agregamos UNIQUE(id, tenant_id) a product_images ni product_variants.
    -- Las migraciones locales confirman que sus FKs hacia products(id, tenant_id) ya son compuestas.
END $$;

-- B. Migrate order_items idempotently
DO $$
DECLARE
    v_mismatch_count INT;
    v_null_count INT;
BEGIN
    -- Add column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.order_items ADD COLUMN tenant_id UUID;
    END IF;

    -- Check for existing mismatches before updating
    SELECT COUNT(*) INTO v_mismatch_count 
    FROM public.order_items oi 
    JOIN public.orders o ON oi.order_id = o.id 
    WHERE oi.tenant_id IS NOT NULL AND oi.tenant_id != o.tenant_id;
    
    IF v_mismatch_count > 0 THEN 
        RAISE EXCEPTION 'Migration failed: % order_items have an existing tenant_id that does not match their order.', v_mismatch_count; 
    END IF;

    -- Update only NULLs safely derived from orders
    UPDATE public.order_items oi
    SET tenant_id = o.tenant_id
    FROM public.orders o
    WHERE oi.order_id = o.id AND oi.tenant_id IS NULL;

    -- Final validation
    SELECT COUNT(*) INTO v_null_count FROM public.order_items WHERE tenant_id IS NULL;
    IF v_null_count > 0 THEN 
        RAISE EXCEPTION 'Migration failed: % order_items still have no tenant_id.', v_null_count; 
    END IF;
END $$;

-- Enforce NOT NULL (safe now)
ALTER TABLE public.order_items ALTER COLUMN tenant_id SET NOT NULL;

-- C. Drop existing single FKs explicitly by known names
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- D. Create Composite FKs (Maintaining ON DELETE CASCADE behavior, idempotently)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_customer_id_tenant_id_fkey') THEN
        ALTER TABLE public.orders ADD CONSTRAINT orders_customer_id_tenant_id_fkey FOREIGN KEY (customer_id, tenant_id) REFERENCES public.customers(id, tenant_id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_order_id_tenant_id_fkey') THEN
        ALTER TABLE public.order_items ADD CONSTRAINT order_items_order_id_tenant_id_fkey FOREIGN KEY (order_id, tenant_id) REFERENCES public.orders(id, tenant_id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_product_id_tenant_id_fkey') THEN
        ALTER TABLE public.order_items ADD CONSTRAINT order_items_product_id_tenant_id_fkey FOREIGN KEY (product_id, tenant_id) REFERENCES public.products(id, tenant_id) ON DELETE CASCADE;
    END IF;
END $$;


-- ==========================================
-- 3. REMOVE PUBLIC RLS FROM CATALOG & CRM
-- ==========================================
DROP POLICY IF EXISTS "Products viewable by everyone if published" ON public.products;
DROP POLICY IF EXISTS "Categories viewable by everyone if active" ON public.categories;
DROP POLICY IF EXISTS "Collections viewable by everyone if active" ON public.collections;
DROP POLICY IF EXISTS "Product collections viewable by everyone" ON public.product_collections;
DROP POLICY IF EXISTS "Product images viewable by everyone" ON public.product_images;
DROP POLICY IF EXISTS "Product variants viewable by everyone" ON public.product_variants;

DROP POLICY IF EXISTS "Anyone can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert order_items" ON public.order_items;


-- ==========================================
-- 4. REBUILD STRICT RLS
-- ==========================================
-- A. order_items
DROP POLICY IF EXISTS "Users can view order items of their tenant" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert order items for their tenant" ON public.order_items;
DROP POLICY IF EXISTS "Users can update order items of their tenant" ON public.order_items;
DROP POLICY IF EXISTS "Users can delete order items of their tenant" ON public.order_items;

CREATE POLICY "Users can view order items of their tenant" 
  ON public.order_items FOR SELECT 
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert order items for their tenant" 
  ON public.order_items FOR INSERT 
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update order items of their tenant" 
  ON public.order_items FOR UPDATE 
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete order items of their tenant" 
  ON public.order_items FOR DELETE 
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));


-- ==========================================
-- 5. FIX RPC search_path AND PERMISSIONS
-- ==========================================
CREATE OR REPLACE FUNCTION public.auth_user_has_role_in_tenant(p_tenant_id UUID, p_roles TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role 
    FROM public.profiles 
    WHERE user_id = auth.uid() AND tenant_id = p_tenant_id;
    
    RETURN v_role = ANY(p_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

REVOKE EXECUTE ON FUNCTION public.auth_user_has_role_in_tenant(UUID, TEXT[]) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auth_user_has_role_in_tenant(UUID, TEXT[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.auth_user_has_role_in_tenant(UUID, TEXT[]) TO authenticated;

-- ==========================================
-- 6. CREATE GET_PUBLIC_CATALOG RPC (SECURITY DEFINER)
-- ==========================================
CREATE OR REPLACE FUNCTION public.get_public_catalog(p_slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_count INT;
    v_tenant_id UUID;
    v_tenant_record RECORD;
    v_settings RECORD;
    v_categories JSONB;
    v_products JSONB;
    v_collections JSONB;
BEGIN
    -- Validar input
    IF p_slug IS NULL OR p_slug = '' THEN
        RAISE EXCEPTION 'Slug cannot be null or empty';
    END IF;

    -- 1. Resolver Tenant ID (validar slug o custom_domain) de forma segura y estricta
    SELECT COUNT(*) INTO v_tenant_count
    FROM public.tenants
    WHERE (slug = p_slug OR custom_domain = p_slug) AND status = 'active';

    IF v_tenant_count = 0 THEN
        RAISE EXCEPTION 'Tenant not found or inactive';
    ELSIF v_tenant_count > 1 THEN
        RAISE EXCEPTION 'Ambiguous tenant resolution for slug: %', p_slug;
    END IF;

    SELECT id INTO v_tenant_id
    FROM public.tenants
    WHERE (slug = p_slug OR custom_domain = p_slug) AND status = 'active';
    
    -- 2. Obtener Tenant Details
    SELECT id, name, slug, custom_domain, status, created_at INTO v_tenant_record 
    FROM public.tenants WHERE id = v_tenant_id;
    
    -- Usando SOLO columnas comprobadas del schema real de tenant_settings
    SELECT id, tenant_id, store_name, description, contact_email, phone, address, currency, locale, timezone, created_at, updated_at
    INTO v_settings 
    FROM public.tenant_settings WHERE tenant_id = v_tenant_id;

    -- 3. Obtener Categories asociadas a este tenant
    SELECT COALESCE(jsonb_agg(c), '[]'::jsonb) INTO v_categories
    FROM (
        SELECT id, name, slug, description, image_url, position
        FROM public.categories
        WHERE tenant_id = v_tenant_id AND is_active = true
        ORDER BY position ASC
    ) c;

    -- 4. Obtener Collections asociadas a este tenant
    SELECT COALESCE(jsonb_agg(coll), '[]'::jsonb) INTO v_collections
    FROM (
        SELECT id, name, slug, description, image_url, position,
            (
                SELECT COALESCE(jsonb_agg(pc.product_id), '[]'::jsonb)
                FROM public.product_collections pc
                JOIN public.products p ON pc.product_id = p.id
                WHERE pc.collection_id = collections.id AND pc.tenant_id = v_tenant_id AND p.status = 'published'
            ) as product_ids
        FROM public.collections
        WHERE tenant_id = v_tenant_id AND is_active = true
        ORDER BY position ASC
    ) coll;

    -- 5. Obtener Products, Images y Variants asociadas a este tenant
    SELECT COALESCE(jsonb_agg(prod), '[]'::jsonb) INTO v_products
    FROM (
        SELECT 
            p.id, p.category_id, p.name, p.slug, p.description, p.short_description, 
            p.sku, p.price, p.compare_at_price, p.featured, p.position, p.created_at,
            (
                SELECT COALESCE(jsonb_agg(pi), '[]'::jsonb)
                FROM (
                    SELECT id, public_url, alt_text, position, is_primary
                    FROM public.product_images
                    WHERE product_id = p.id AND tenant_id = v_tenant_id
                    ORDER BY is_primary DESC, position ASC
                ) pi
            ) as images,
            (
                SELECT COALESCE(jsonb_agg(pv), '[]'::jsonb)
                FROM (
                    SELECT id, name, sku, price, stock
                    FROM public.product_variants
                    WHERE product_id = p.id AND tenant_id = v_tenant_id
                ) pv
            ) as variants
        FROM public.products p
        WHERE p.tenant_id = v_tenant_id AND p.status = 'published'
        ORDER BY p.position ASC
    ) prod;

    -- 6. Devolver estructura completa
    RETURN jsonb_build_object(
        'tenant', row_to_json(v_tenant_record),
        'settings', row_to_json(v_settings),
        'categories', v_categories,
        'collections', v_collections,
        'products', v_products
    );
END;
$$;

-- Permisos estrictos
REVOKE EXECUTE ON FUNCTION public.get_public_catalog(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_catalog(TEXT) TO anon, authenticated;

COMMIT;
