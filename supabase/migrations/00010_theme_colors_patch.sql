BEGIN;

-- ==============================================================================
-- 00010_theme_colors_patch.sql
-- Fixes missing theme colors and assets in get_public_catalog RPC
-- ==============================================================================

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
    
    -- 2. Obtener Tenant Details (AGREGADOS COLORES Y ASSETS)
    SELECT id, name, slug, custom_domain, status, logo_url, favicon_url, primary_color, secondary_color, created_at 
    INTO v_tenant_record 
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
