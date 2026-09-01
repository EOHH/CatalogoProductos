BEGIN;

-- ==============================================================================
-- 00011_orders_checkout.sql (V1.7 FINAL)
-- Description: Implement checkout schema, friendly IDs, variant support, 
-- atomic public RPC for storefront orders, and robust data integrity (RESTRICT).
-- ==============================================================================

-- ==========================================
-- PRE-DEPLOY DEPENDENCIES (DOCUMENTATION)
-- ==========================================
/*
REACT CODE PATCHES REQUIRED BEFORE EXECUTING 00011:
1. crm.service.ts: 
   Eliminar el incremento manual de `orders_count` y `total_spent` al crear una orden manual.
   El nuevo trigger `trg_orders_confirmation` es la única autoridad y lo hará atómicamente cuando el status cambie a confirmado.
2. Product Delete Flow:
   NO ejecutar delete() de Storage ni de Database sin antes comprobar:
   Si el producto NO tiene order_items -> hard delete (Storage + DB).
   Si el producto TIENE order_items -> NO borrar de Storage, y en DB hacer update status='archived'.
3. Variant Delete Flow:
   Si variante NO tiene order_items -> hard delete.
   Si variante TIENE order_items -> update is_active=false.
4. get_public_catalog:
   Asegurarse de que el frontend o la RPC pública de catálogo solo retorna variantes donde is_active=true.
*/

-- ==========================================
-- 1. PRE-FLIGHT CHECKS
-- ==========================================
DO $$
DECLARE
    v_inconsistent_count INT;
BEGIN
    -- Confirmar no duplicados en product_variants(id, product_id, tenant_id)
    SELECT COUNT(*) INTO v_inconsistent_count FROM (
        SELECT id, product_id, tenant_id FROM public.product_variants
        GROUP BY id, product_id, tenant_id HAVING COUNT(*) > 1
    ) d;
    IF v_inconsistent_count > 0 THEN 
        RAISE EXCEPTION 'Pre-flight failed: % duplicate variants found.', v_inconsistent_count; 
    END IF;

    -- Confirmar no colisiones en normalized_phone
    WITH normalized AS (
        SELECT tenant_id, NULLIF(regexp_replace(phone, '\D', '', 'g'), '') AS norm_phone
        FROM public.customers
    )
    SELECT COUNT(*) INTO v_inconsistent_count FROM (
        SELECT tenant_id, norm_phone FROM normalized
        WHERE norm_phone IS NOT NULL
        GROUP BY tenant_id, norm_phone HAVING COUNT(*) > 1
    ) d;
    IF v_inconsistent_count > 0 THEN 
        RAISE EXCEPTION 'Pre-flight failed: % phone collisions found across tenants.', v_inconsistent_count; 
    END IF;
    
    -- Confirmar integridad de order_items
    SELECT COUNT(*) INTO v_inconsistent_count FROM public.order_items oi
    LEFT JOIN public.orders o ON oi.order_id = o.id
    LEFT JOIN public.products p ON oi.product_id = p.id
    WHERE o.id IS NULL OR p.id IS NULL;
    IF v_inconsistent_count > 0 THEN 
        RAISE EXCEPTION 'Pre-flight failed: % order_items have missing relations.', v_inconsistent_count; 
    END IF;
END $$;

-- ==========================================
-- 2. SCHEMA EVOLUTION (DDL Idempotente Estricto)
-- ==========================================

-- A. product_variants
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_variants_id_product_id_tenant_id_key') THEN
        ALTER TABLE public.product_variants ADD CONSTRAINT product_variants_id_product_id_tenant_id_key UNIQUE (id, product_id, tenant_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_variants' AND column_name = 'is_active') THEN
        ALTER TABLE public.product_variants ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;

-- B. order_items
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'variant_id') THEN
        ALTER TABLE public.order_items ADD COLUMN variant_id UUID NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'variant_name') THEN
        ALTER TABLE public.order_items ADD COLUMN variant_name TEXT NULL;
    END IF;
    
    -- Eliminamos la FK original de producto CASCADE (creada en 00009) y la sustituimos por RESTRICT
    ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_tenant_id_fkey;
    ALTER TABLE public.order_items ADD CONSTRAINT order_items_product_id_tenant_id_fkey 
        FOREIGN KEY (product_id, tenant_id) REFERENCES public.products(id, tenant_id) ON DELETE RESTRICT;

    -- FK nueva para la variante con RESTRICT
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_variant_id_tenant_id_fkey') THEN
        ALTER TABLE public.order_items 
        ADD CONSTRAINT order_items_variant_id_tenant_id_fkey 
        FOREIGN KEY (variant_id, product_id, tenant_id) 
        REFERENCES public.product_variants(id, product_id, tenant_id) 
        ON DELETE RESTRICT;
    END IF;
END $$;

-- C. orders -> customers FK a RESTRICT
DO $$
BEGIN
    -- Eliminamos la FK CASCADE de 00009 y aplicamos RESTRICT
    ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_customer_id_tenant_id_fkey;
    ALTER TABLE public.orders ADD CONSTRAINT orders_customer_id_tenant_id_fkey 
        FOREIGN KEY (customer_id, tenant_id) REFERENCES public.customers(id, tenant_id) ON DELETE RESTRICT;
END $$;

-- D. customers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'normalized_phone') THEN
        ALTER TABLE public.customers ADD COLUMN normalized_phone TEXT NULL;
    END IF;
END $$;

-- Backfill seguro de normalized_phone
UPDATE public.customers 
SET normalized_phone = NULLIF(regexp_replace(phone, '\D', '', 'g'), '')
WHERE normalized_phone IS NULL AND phone IS NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_tenant_id_normalized_phone_key') THEN
        ALTER TABLE public.customers ADD CONSTRAINT customers_tenant_id_normalized_phone_key UNIQUE (tenant_id, normalized_phone);
    END IF;
END $$;

-- E. orders
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'friendly_id') THEN
        ALTER TABLE public.orders ADD COLUMN friendly_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'source') THEN
        ALTER TABLE public.orders ADD COLUMN source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('storefront', 'manual'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'is_metrics_counted') THEN
        ALTER TABLE public.orders ADD COLUMN is_metrics_counted BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'is_stock_deducted') THEN
        ALTER TABLE public.orders ADD COLUMN is_stock_deducted BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'idempotency_key') THEN
        ALTER TABLE public.orders ADD COLUMN idempotency_key UUID NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_tenant_id_friendly_id_key') THEN
        ALTER TABLE public.orders ADD CONSTRAINT orders_tenant_id_friendly_id_key UNIQUE (tenant_id, friendly_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_tenant_id_idempotency_key_key') THEN
        ALTER TABLE public.orders ADD CONSTRAINT orders_tenant_id_idempotency_key_key UNIQUE (tenant_id, idempotency_key);
    END IF;
END $$;

-- F. tenant_order_counters
CREATE TABLE IF NOT EXISTS public.tenant_order_counters (
  tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  current_value INT NOT NULL DEFAULT 1000
);
ALTER TABLE public.tenant_order_counters ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. TRIGGERS
-- ==========================================

-- A. Synchronize normalized_phone on Customers
CREATE OR REPLACE FUNCTION public.sync_normalized_phone()
RETURNS TRIGGER AS $$
BEGIN
    NEW.normalized_phone := NULLIF(regexp_replace(NEW.phone, '\D', '', 'g'), '');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trg_sync_normalized_phone ON public.customers;
CREATE TRIGGER trg_sync_normalized_phone
BEFORE INSERT OR UPDATE OF phone ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.sync_normalized_phone();


-- B. Auto-generate friendly_id for manual and storefront orders
CREATE OR REPLACE FUNCTION public.set_order_friendly_id()
RETURNS TRIGGER AS $$
DECLARE
    v_seq_number INT;
BEGIN
    IF NEW.friendly_id IS NULL THEN
        INSERT INTO public.tenant_order_counters (tenant_id, current_value)
        VALUES (NEW.tenant_id, 1001)
        ON CONFLICT (tenant_id) 
        DO UPDATE SET current_value = public.tenant_order_counters.current_value + 1
        RETURNING current_value INTO v_seq_number;
        
        NEW.friendly_id := 'PED-' || v_seq_number::text;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS trg_set_order_friendly_id ON public.orders;
CREATE TRIGGER trg_set_order_friendly_id
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_order_friendly_id();


-- C. Process Confirmation (Metrics & Strict Stock & Protection)
CREATE OR REPLACE FUNCTION public.process_order_confirmation()
RETURNS TRIGGER AS $$
DECLARE
    v_item RECORD;
    v_current_stock INT;
    v_calculated_total NUMERIC;
    v_items_count INT;
BEGIN
    -- 1. Inmutabilidad de campos técnicos
    IF NEW.tenant_id != OLD.tenant_id OR 
       NEW.source != OLD.source OR 
       NEW.friendly_id IS DISTINCT FROM OLD.friendly_id OR 
       NEW.idempotency_key IS DISTINCT FROM OLD.idempotency_key THEN
       
       RAISE EXCEPTION 'Cannot modify technical immutable fields of an order (tenant_id, source, friendly_id, idempotency_key).';
    END IF;

    -- Forzamos banderas a OLD para evitar manipulación manual (la DB es la única autoridad)
    NEW.is_metrics_counted := OLD.is_metrics_counted;
    NEW.is_stock_deducted := OLD.is_stock_deducted;

    -- Inmutabilidad de campos de negocio (customer_id, total_amount)
    IF OLD.status = 'pending' AND NEW.status != 'pending' THEN
        IF NEW.customer_id != OLD.customer_id OR NEW.total_amount != OLD.total_amount THEN
            RAISE EXCEPTION 'Cannot modify business fields (customer_id, total_amount) during status transition out of pending (id: %).', OLD.id;
        END IF;
    ELSIF OLD.status != 'pending' THEN
        IF NEW.customer_id != OLD.customer_id OR NEW.total_amount != OLD.total_amount THEN
            RAISE EXCEPTION 'Cannot modify business fields (customer_id, total_amount) of a non-pending order (id: %).', OLD.id;
        END IF;
    END IF;

    -- 2. State Machine Strict Enforcement
    IF OLD.status != NEW.status THEN
        IF OLD.status = 'pending' AND NEW.status NOT IN ('paid', 'in_production', 'cancelled') THEN
            RAISE EXCEPTION 'Invalid transition from pending to %', NEW.status;
        ELSIF OLD.status = 'paid' AND NEW.status NOT IN ('in_production', 'cancelled') THEN
            RAISE EXCEPTION 'Invalid transition from paid to %', NEW.status;
        ELSIF OLD.status = 'in_production' AND NEW.status NOT IN ('packaging', 'cancelled') THEN
            RAISE EXCEPTION 'Invalid transition from in_production to %', NEW.status;
        ELSIF OLD.status = 'packaging' AND NEW.status NOT IN ('shipped', 'cancelled') THEN
            RAISE EXCEPTION 'Invalid transition from packaging to %', NEW.status;
        ELSIF OLD.status = 'shipped' AND NEW.status NOT IN ('delivered', 'cancelled') THEN
            RAISE EXCEPTION 'Invalid transition from shipped to %', NEW.status;
        ELSIF OLD.status = 'delivered' AND NEW.status NOT IN ('cancelled') THEN
            RAISE EXCEPTION 'Invalid transition from delivered to %', NEW.status;
        ELSIF OLD.status = 'cancelled' THEN
            RAISE EXCEPTION 'Cannot transition an order from cancelled directly.';
        END IF;
    END IF;

    -- 3. Transiciones
    IF OLD.status = 'pending' AND NEW.status IN ('paid', 'in_production') THEN
        
        -- Validación Económica antes de confirmar
        SELECT COALESCE(SUM(total_price), 0), COUNT(*) 
        INTO v_calculated_total, v_items_count
        FROM public.order_items 
        WHERE order_id = NEW.id AND tenant_id = NEW.tenant_id;

        IF v_items_count = 0 THEN
            RAISE EXCEPTION 'Cannot confirm an empty order.';
        END IF;

        IF v_calculated_total != OLD.total_amount THEN
            RAISE EXCEPTION 'Order total_amount (%) does not match order_items sum (%). Integrity error.', OLD.total_amount, v_calculated_total;
        END IF;
        
        -- Handle metrics (sumando el total verificado)
        IF NEW.is_metrics_counted = false THEN
            UPDATE public.customers 
            SET total_spent = total_spent + OLD.total_amount,
                orders_count = orders_count + 1,
                updated_at = NOW()
            WHERE id = OLD.customer_id AND tenant_id = OLD.tenant_id;
            
            NEW.is_metrics_counted := true;
        END IF;

        -- Handle stock deduction
        IF NEW.is_stock_deducted = false THEN
            FOR v_item IN SELECT variant_id, quantity FROM public.order_items WHERE order_id = OLD.id AND tenant_id = OLD.tenant_id AND variant_id IS NOT NULL LOOP
                SELECT stock INTO v_current_stock FROM public.product_variants WHERE id = v_item.variant_id AND tenant_id = OLD.tenant_id FOR UPDATE;
                
                IF v_current_stock < v_item.quantity THEN
                    RAISE EXCEPTION 'Stock insuficiente para la variante %', v_item.variant_id;
                END IF;

                UPDATE public.product_variants 
                SET stock = stock - v_item.quantity,
                    updated_at = NOW()
                WHERE id = v_item.variant_id AND tenant_id = OLD.tenant_id;
            END LOOP;
            
            NEW.is_stock_deducted := true;
        END IF;

    -- Cancelación
    ELSIF OLD.status IN ('paid', 'in_production', 'packaging', 'shipped', 'delivered') AND NEW.status = 'cancelled' THEN
        
        IF NEW.is_metrics_counted = true THEN
            UPDATE public.customers 
            SET total_spent = GREATEST(0, total_spent - OLD.total_amount),
                orders_count = GREATEST(0, orders_count - 1),
                updated_at = NOW()
            WHERE id = OLD.customer_id AND tenant_id = OLD.tenant_id;
            
            NEW.is_metrics_counted := false;
        END IF;

        IF NEW.is_stock_deducted = true THEN
            FOR v_item IN SELECT variant_id, quantity FROM public.order_items WHERE order_id = OLD.id AND tenant_id = OLD.tenant_id AND variant_id IS NOT NULL LOOP
                UPDATE public.product_variants 
                SET stock = stock + v_item.quantity,
                    updated_at = NOW()
                WHERE id = v_item.variant_id AND tenant_id = OLD.tenant_id;
            END LOOP;
            
            NEW.is_stock_deducted := false;
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';


-- D. Inmutabilidad de order_items
CREATE OR REPLACE FUNCTION public.check_order_items_immutability()
RETURNS TRIGGER AS $$
DECLARE
    v_status TEXT;
    v_order_id UUID;
    v_tenant_id UUID;
BEGIN
    -- Determinar el padre y evitar alteraciones de llaves
    IF TG_OP = 'DELETE' THEN
        v_order_id := OLD.order_id;
        v_tenant_id := OLD.tenant_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.order_id != OLD.order_id OR NEW.tenant_id != OLD.tenant_id THEN
            RAISE EXCEPTION 'Cannot change order_id or tenant_id of an existing order_item.';
        END IF;
        v_order_id := OLD.order_id;
        v_tenant_id := OLD.tenant_id;
    ELSE
        v_order_id := NEW.order_id;
        v_tenant_id := NEW.tenant_id;
    END IF;

    SELECT status INTO v_status FROM public.orders WHERE id = v_order_id AND tenant_id = v_tenant_id;
    
    IF v_status IS NULL THEN
        RAISE EXCEPTION 'Parent order not found or tenant mismatch.';
    END IF;
    
    IF v_status != 'pending' THEN
        RAISE EXCEPTION 'Order items are immutable for orders not in pending status.';
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Revocaciones de ejecución específicas
REVOKE EXECUTE ON FUNCTION public.process_order_confirmation() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_order_friendly_id() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_normalized_phone() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_order_items_immutability() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_orders_confirmation ON public.orders;
CREATE TRIGGER trg_orders_confirmation
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.process_order_confirmation();

DROP TRIGGER IF EXISTS trg_order_items_immutability ON public.order_items;
CREATE TRIGGER trg_order_items_immutability
BEFORE INSERT OR UPDATE OR DELETE ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.check_order_items_immutability();


-- ==========================================
-- 4. PUBLIC RPC (CREATE ORDER)
-- ==========================================
CREATE OR REPLACE FUNCTION public.create_public_order(
    p_tenant_slug TEXT,
    p_customer_data JSONB,
    p_items JSONB,
    p_idempotency_key UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_count INT;
    v_tenant_id UUID;
    v_phone TEXT;
    v_normalized_phone TEXT;
    v_customer_id UUID;
    v_order_id UUID;
    v_friendly_id TEXT;
    v_total_amount NUMERIC := 0;
    v_items_length INT;
    
    v_item JSONB;
    v_product_id UUID;
    v_variant_id UUID;
    v_quantity INT;
    
    v_price NUMERIC;
    v_variant_name TEXT;
    v_product_record RECORD;
    v_variant_record RECORD;
    v_item_total NUMERIC;
    v_total_variants_count INT;
    v_active_variants_count INT;
    
    v_existing_order JSONB;
    v_constraint_name TEXT;
BEGIN
    -- 0. Input Validation
    IF p_idempotency_key IS NULL THEN RAISE EXCEPTION 'Idempotency key is required'; END IF;
    IF p_tenant_slug IS NULL OR p_tenant_slug = '' THEN RAISE EXCEPTION 'Missing tenant slug'; END IF;
    
    IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN RAISE EXCEPTION 'p_items must be a JSON array'; END IF;
    IF p_customer_data IS NULL OR jsonb_typeof(p_customer_data) <> 'object' THEN RAISE EXCEPTION 'p_customer_data must be a JSON object'; END IF;
    
    v_items_length := jsonb_array_length(p_items);
    IF v_items_length = 0 THEN RAISE EXCEPTION 'Order must contain items'; END IF;
    IF v_items_length > 50 THEN RAISE EXCEPTION 'Order items limit exceeded'; END IF;
    
    v_phone := p_customer_data->>'phone';
    IF v_phone IS NULL OR trim(v_phone) = '' THEN RAISE EXCEPTION 'Phone is required for public orders'; END IF;

    -- 1. Resolve Tenant Strictly
    SELECT COUNT(*) INTO v_tenant_count
    FROM public.tenants
    WHERE (slug = p_tenant_slug OR custom_domain = p_tenant_slug) AND status = 'active';

    IF v_tenant_count = 0 THEN
        RAISE EXCEPTION 'Tenant not found or inactive';
    ELSIF v_tenant_count > 1 THEN
        RAISE EXCEPTION 'Ambiguous tenant resolution for slug: %', p_tenant_slug;
    END IF;

    SELECT id INTO v_tenant_id
    FROM public.tenants
    WHERE (slug = p_tenant_slug OR custom_domain = p_tenant_slug) AND status = 'active';

    -- Outer Block for True Concurrency-Safe Idempotency
    BEGIN
        
        -- 2. Customer Resolution
        v_normalized_phone := NULLIF(regexp_replace(v_phone, '\D', '', 'g'), '');
        IF v_normalized_phone IS NULL THEN RAISE EXCEPTION 'Invalid phone format'; END IF;
        
        INSERT INTO public.customers (
            tenant_id, first_name, last_name, email, phone, total_spent, orders_count
        )
        VALUES (
            v_tenant_id, 
            COALESCE(p_customer_data->>'first_name', 'Cliente Web'), 
            p_customer_data->>'last_name', 
            p_customer_data->>'email', 
            v_phone, 
            0, 0
        )
        ON CONFLICT (tenant_id, normalized_phone) 
        DO UPDATE SET updated_at = NOW()
        RETURNING id INTO v_customer_id;

        -- 3. Create Order
        INSERT INTO public.orders (
            tenant_id, customer_id, status, total_amount, source, idempotency_key, is_metrics_counted, is_stock_deducted
        ) VALUES (
            v_tenant_id, v_customer_id, 'pending', 0, 'storefront', p_idempotency_key, false, false
        ) RETURNING id, friendly_id INTO v_order_id, v_friendly_id;
        
        -- 4. Process Items
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
        LOOP
            v_product_id := (v_item->>'product_id')::UUID;
            v_variant_id := NULLIF(v_item->>'variant_id', '')::UUID;
            v_quantity := COALESCE((v_item->>'quantity')::INT, 1);
            
            IF v_quantity <= 0 OR v_quantity > 100 THEN RAISE EXCEPTION 'Invalid quantity: %', v_quantity; END IF;
            
            SELECT id, price INTO v_product_record 
            FROM public.products 
            WHERE id = v_product_id AND tenant_id = v_tenant_id AND status = 'published';
            
            IF v_product_record.id IS NULL THEN RAISE EXCEPTION 'Product not found or not published'; END IF;
            
            -- Validation: Variante estricta
            SELECT COUNT(*) INTO v_total_variants_count
            FROM public.product_variants
            WHERE product_id = v_product_id AND tenant_id = v_tenant_id;
            
            SELECT COUNT(*) INTO v_active_variants_count
            FROM public.product_variants
            WHERE product_id = v_product_id AND tenant_id = v_tenant_id AND is_active = true;

            IF v_total_variants_count > 0 AND v_active_variants_count = 0 THEN
                RAISE EXCEPTION 'Product % is not available for purchase (all variants disabled).', v_product_id;
            END IF;

            IF v_active_variants_count > 0 AND v_variant_id IS NULL THEN
                RAISE EXCEPTION 'Variant is required for product %', v_product_id;
            END IF;

            v_price := v_product_record.price;
            v_variant_name := NULL;

            IF v_variant_id IS NOT NULL THEN
                SELECT id, price, name INTO v_variant_record 
                FROM public.product_variants 
                WHERE id = v_variant_id AND product_id = v_product_id AND tenant_id = v_tenant_id AND is_active = true;
                
                IF v_variant_record.id IS NULL THEN RAISE EXCEPTION 'Active variant not found'; END IF;
                
                v_price := COALESCE(v_variant_record.price, v_product_record.price);
                v_variant_name := v_variant_record.name;
            END IF;
            
            v_item_total := v_price * v_quantity;
            v_total_amount := v_total_amount + v_item_total;

            INSERT INTO public.order_items (
                order_id, product_id, variant_id, variant_name, tenant_id, quantity, unit_price, total_price
            ) VALUES (
                v_order_id, v_product_id, v_variant_id, v_variant_name, v_tenant_id, v_quantity, v_price, v_item_total
            );
        END LOOP;

        -- 5. Update order total
        UPDATE public.orders SET total_amount = v_total_amount WHERE id = v_order_id AND tenant_id = v_tenant_id;

    EXCEPTION WHEN unique_violation THEN
        GET STACKED DIAGNOSTICS v_constraint_name = CONSTRAINT_NAME;
        
        IF v_constraint_name = 'orders_tenant_id_idempotency_key_key' THEN
            SELECT jsonb_build_object(
                'order_id', id,
                'friendly_id', friendly_id,
                'total_amount', total_amount
            ) INTO v_existing_order
            FROM public.orders
            WHERE tenant_id = v_tenant_id AND idempotency_key = p_idempotency_key;
            
            IF v_existing_order IS NOT NULL THEN
                RETURN v_existing_order;
            END IF;
        END IF;
        
        RAISE;
    END;

    -- 6. Return standard response
    RETURN jsonb_build_object(
        'order_id', v_order_id,
        'friendly_id', v_friendly_id,
        'total_amount', v_total_amount
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_public_order(TEXT, JSONB, JSONB, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_public_order(TEXT, JSONB, JSONB, UUID) TO anon, authenticated;

COMMIT;
