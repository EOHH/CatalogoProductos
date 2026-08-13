-- ==========================================
-- MIGRATION 5: DASHBOARD METRICS, ORDERS, CUSTOMERS & ACTIVITY
-- ==========================================

-- ------------------------------------------
-- 1. TABLES
-- ------------------------------------------

-- CUSTOMERS
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    total_spent NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at();

-- ORDERS
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    order_number TEXT NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, order_number)
);

CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at();

-- ORDER ITEMS
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ACTIVITY LOG (For the Dashboard Recent Activity)
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('order', 'product', 'customer', 'coupon', 'system')),
    title TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------
-- 2. INDEXES
-- ------------------------------------------

CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX idx_order_items_tenant_id ON order_items(tenant_id);
CREATE INDEX idx_activity_log_tenant_id ON activity_log(tenant_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);


-- ------------------------------------------
-- 3. AUTOMATION (TRIGGERS FOR ACTIVITY LOG)
-- ------------------------------------------

-- Trigger for New Products
CREATE OR REPLACE FUNCTION log_new_product()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_log (tenant_id, type, title, metadata)
    VALUES (NEW.tenant_id, 'product', 'Producto "' || NEW.name || '" agregado', jsonb_build_object('product_id', NEW.id));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_new_product
AFTER INSERT ON products
FOR EACH ROW EXECUTE FUNCTION log_new_product();

-- Trigger for New Customers
CREATE OR REPLACE FUNCTION log_new_customer()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_log (tenant_id, type, title, metadata)
    VALUES (NEW.tenant_id, 'customer', NEW.full_name || ' se registró como nuevo cliente', jsonb_build_object('customer_id', NEW.id));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_new_customer
AFTER INSERT ON customers
FOR EACH ROW EXECUTE FUNCTION log_new_customer();

-- Trigger for New Orders
CREATE OR REPLACE FUNCTION log_new_order()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_log (tenant_id, type, title, metadata)
    VALUES (NEW.tenant_id, 'order', 'Nuevo pedido #' || NEW.order_number, jsonb_build_object('order_id', NEW.id, 'total', NEW.total_amount));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_new_order
AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION log_new_order();


-- ------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Customers Policies
CREATE POLICY "Customers viewable by tenant users" ON customers FOR SELECT
    USING (auth_user_has_role_in_tenant(tenant_id, ARRAY['admin', 'editor', 'viewer']));
CREATE POLICY "Customers manageable by tenant admins/editors" ON customers FOR ALL
    USING (auth_user_has_role_in_tenant(tenant_id, ARRAY['admin', 'editor']));

-- Orders Policies
CREATE POLICY "Orders viewable by tenant users" ON orders FOR SELECT
    USING (auth_user_has_role_in_tenant(tenant_id, ARRAY['admin', 'editor', 'viewer']));
CREATE POLICY "Orders manageable by tenant admins/editors" ON orders FOR ALL
    USING (auth_user_has_role_in_tenant(tenant_id, ARRAY['admin', 'editor']));

-- Order Items Policies
CREATE POLICY "Order items viewable by tenant users" ON order_items FOR SELECT
    USING (auth_user_has_role_in_tenant(tenant_id, ARRAY['admin', 'editor', 'viewer']));
CREATE POLICY "Order items manageable by tenant admins/editors" ON order_items FOR ALL
    USING (auth_user_has_role_in_tenant(tenant_id, ARRAY['admin', 'editor']));

-- Activity Log Policies
CREATE POLICY "Activity viewable by tenant users" ON activity_log FOR SELECT
    USING (auth_user_has_role_in_tenant(tenant_id, ARRAY['admin', 'editor', 'viewer']));
CREATE POLICY "Activity manageable by tenant admins/editors" ON activity_log FOR ALL
    USING (auth_user_has_role_in_tenant(tenant_id, ARRAY['admin', 'editor']));


-- ------------------------------------------
-- 5. RPC FUNCTION: get_dashboard_stats
-- ------------------------------------------
-- This function aggregates all metrics into a single JSON object for max performance.
-- Structure matching exactly what the frontend expects.

CREATE OR REPLACE FUNCTION get_dashboard_stats(p_tenant_id UUID)
RETURNS JSON AS $$
DECLARE
    v_total_sales NUMERIC;
    v_prev_total_sales NUMERIC;
    
    v_total_products INTEGER;
    v_new_products INTEGER;
    
    v_total_orders INTEGER;
    v_prev_total_orders INTEGER;
    
    v_total_customers INTEGER;
    v_prev_total_customers INTEGER;
    
    v_top_products JSON;
    v_recent_activity JSON;
BEGIN
    -- 1. SALES
    SELECT COALESCE(SUM(total_amount), 0) INTO v_total_sales FROM orders WHERE tenant_id = p_tenant_id AND status = 'completed';
    -- Dummy previous month for trend (assuming 15% lower for demo purposes)
    v_prev_total_sales := v_total_sales * 0.85; 

    -- 2. PRODUCTS
    SELECT COUNT(*) INTO v_total_products FROM products WHERE tenant_id = p_tenant_id;
    -- Dummy new products this month
    SELECT COUNT(*) INTO v_new_products FROM products WHERE tenant_id = p_tenant_id AND created_at > NOW() - INTERVAL '30 days';

    -- 3. ORDERS
    SELECT COUNT(*) INTO v_total_orders FROM orders WHERE tenant_id = p_tenant_id;
    v_prev_total_orders := GREATEST(1, v_total_orders * 0.90);

    -- 4. CUSTOMERS
    SELECT COUNT(*) INTO v_total_customers FROM customers WHERE tenant_id = p_tenant_id;
    v_prev_total_customers := GREATEST(1, v_total_customers * 0.88);

    -- 5. TOP PRODUCTS
    -- Group by product in order_items, order by total qty
    SELECT json_agg(row_to_json(tp)) INTO v_top_products
    FROM (
        SELECT 
            p.id,
            p.name,
            COALESCE(SUM(oi.quantity), 0) || ' ventas' as sales,
            'S/ ' || to_char(COALESCE(SUM(oi.total_price), 0), 'FM999,999,999.00') as price,
            (SELECT public_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as img
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        WHERE p.tenant_id = p_tenant_id
        GROUP BY p.id, p.name
        ORDER BY SUM(oi.quantity) DESC NULLS LAST
        LIMIT 4
    ) tp;
    
    IF v_top_products IS NULL THEN v_top_products := '[]'::json; END IF;

    -- 6. RECENT ACTIVITY
    SELECT json_agg(row_to_json(ra)) INTO v_recent_activity
    FROM (
        SELECT 
            id,
            title,
            CASE type
                WHEN 'order' THEN 'bg-rose-100'
                WHEN 'product' THEN 'bg-purple-100'
                WHEN 'customer' THEN 'bg-orange-100'
                WHEN 'coupon' THEN 'bg-emerald-100'
                ELSE 'bg-zinc-100'
            END as "iconBg",
            type,
            -- Rough time formatting for demo (in a real app we'd just pass ISO date and format in frontend)
            created_at as time
        FROM activity_log
        WHERE tenant_id = p_tenant_id
        ORDER BY created_at DESC
        LIMIT 5
    ) ra;
    
    IF v_recent_activity IS NULL THEN v_recent_activity := '[]'::json; END IF;

    -- Return composed JSON matching the frontend interface
    RETURN json_build_object(
        'kpis', json_build_array(
            json_build_object(
                'id', 'ventas',
                'title', 'Ventas totales',
                'value', 'S/ ' || to_char(v_total_sales, 'FM999,999,999.00'),
                'trend', '+ 18.5%', -- Demo trend
                'iconBg', 'bg-purple-100',
                'trendColor', 'text-emerald-600'
            ),
            json_build_object(
                'id', 'productos',
                'title', 'Productos',
                'value', v_total_products::text,
                'trend', '↑ ' || v_new_products || ' nuevos',
                'iconBg', 'bg-rose-100',
                'trendColor', 'text-zinc-500'
            ),
            json_build_object(
                'id', 'pedidos',
                'title', 'Pedidos',
                'value', v_total_orders::text,
                'trend', '↑ 8.3%',
                'iconBg', 'bg-orange-100',
                'trendColor', 'text-emerald-600'
            ),
            json_build_object(
                'id', 'clientes',
                'title', 'Clientes',
                'value', v_total_customers::text,
                'trend', '↑ 15.2%',
                'iconBg', 'bg-emerald-100',
                'trendColor', 'text-emerald-600'
            )
        ),
        'salesChart', json_build_object(
            'total', 'S/ ' || to_char(v_total_sales, 'FM999,999,999.00'),
            'trend', '18.5%'
        ),
        'topProducts', v_top_products,
        'recentActivity', v_recent_activity
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
