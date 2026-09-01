-- ==============================================================================
-- production_schema_audit.sql
-- 100% READ-ONLY SCRIPT
-- DO NOT EXECUTE ANY MODIFICATIONS, ONLY SELECT STATEMENTS.
-- ==============================================================================

-- 1. TABLAS, COLUMNAS Y TIPOS
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 2. PRIMARY KEYS Y UNIQUE CONSTRAINTS
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    string_agg(kcu.column_name, ', ') as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name 
  AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public' 
  AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
ORDER BY tc.table_name;

-- 3. FOREIGN KEYS (ON DELETE / ON UPDATE)
SELECT
    tc.table_name as source_table,
    tc.constraint_name,
    string_agg(kcu.column_name, ', ') as source_columns,
    ccu.table_name AS target_table,
    string_agg(ccu.column_name, ', ') AS target_columns,
    rc.update_rule AS on_update,
    rc.delete_rule AS on_delete
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc 
  ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.table_schema = 'public' AND tc.constraint_type = 'FOREIGN KEY'
GROUP BY tc.table_name, tc.constraint_name, ccu.table_name, rc.update_rule, rc.delete_rule
ORDER BY source_table;

-- 4. RLS ESTADO (HABILITADO Y FORCE RLS)
SELECT 
    relname AS table_name,
    relrowsecurity AS rls_enabled,
    relforcerowsecurity AS force_rls
FROM pg_class
WHERE relnamespace = 'public'::regnamespace AND relkind = 'r'
ORDER BY relname;

-- 5. POLICIES EXISTENTES (USING / WITH CHECK)
SELECT 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual AS using_expression, 
    with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. FUNCIONES DE SEGURIDAD (OWNER, SEC DEFINER, SEARCH PATH)
SELECT 
    p.proname AS function_name,
    pg_get_userbyid(p.proowner) AS owner,
    p.prosecdef AS is_security_definer,
    p.proconfig AS search_path,
    pg_get_function_arguments(p.oid) AS arguments,
    pg_get_function_result(p.oid) AS return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname IN ('auth_user_has_role_in_tenant', 'get_public_catalog', 'create_tenant');

-- 7. EXECUTE GRANTS EN FUNCIONES
SELECT 
    routine_name, 
    grantee, 
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public' 
  AND routine_name IN ('auth_user_has_role_in_tenant', 'get_public_catalog', 'create_tenant')
ORDER BY routine_name, grantee;

-- 8. CHEQUEOS DE DATA Y DUPLICADOS (PRE-FLIGHT ORPHANS Y CROSS-TENANTS)

-- 8.1 Duplicados que impedirían UNIQUE(id, tenant_id)
SELECT 'customers duplicate (id, tenant_id)' as anomaly, COUNT(*) as amount FROM (SELECT id, tenant_id FROM public.customers GROUP BY id, tenant_id HAVING COUNT(*) > 1) d
UNION ALL
SELECT 'orders duplicate (id, tenant_id)', COUNT(*) FROM (SELECT id, tenant_id FROM public.orders GROUP BY id, tenant_id HAVING COUNT(*) > 1) d
UNION ALL
SELECT 'product_images duplicate (id, tenant_id)', COUNT(*) FROM (SELECT id, tenant_id FROM public.product_images GROUP BY id, tenant_id HAVING COUNT(*) > 1) d
UNION ALL
SELECT 'product_variants duplicate (id, tenant_id)', COUNT(*) FROM (SELECT id, tenant_id FROM public.product_variants GROUP BY id, tenant_id HAVING COUNT(*) > 1) d

-- 8.2 order_items huérfanos o cross-tenant (sin requerir que exista tenant_id en order_items)
UNION ALL
SELECT 'order_items missing order', COUNT(*) FROM public.order_items oi LEFT JOIN public.orders o ON oi.order_id = o.id WHERE o.id IS NULL
UNION ALL
SELECT 'order_items missing product', COUNT(*) FROM public.order_items oi LEFT JOIN public.products p ON oi.product_id = p.id WHERE p.id IS NULL
UNION ALL
SELECT 'order_items cross-tenant (order vs product)', COUNT(*) FROM public.order_items oi JOIN public.orders o ON oi.order_id = o.id JOIN public.products p ON oi.product_id = p.id WHERE o.tenant_id != p.tenant_id

-- 8.3 orders huérfanos o inválidos
UNION ALL
SELECT 'orders missing customer', COUNT(*) FROM public.orders o LEFT JOIN public.customers c ON o.customer_id = c.id WHERE c.id IS NULL
UNION ALL
SELECT 'orders cross-tenant (order vs customer)', COUNT(*) FROM public.orders o JOIN public.customers c ON o.customer_id = c.id WHERE o.tenant_id != c.tenant_id

-- 8.4 Imágenes y variantes huérfanos
UNION ALL
SELECT 'product_images cross-tenant', COUNT(*) FROM public.product_images pi JOIN public.products p ON pi.product_id = p.id WHERE pi.tenant_id != p.tenant_id
UNION ALL
SELECT 'product_variants cross-tenant', COUNT(*) FROM public.product_variants pv JOIN public.products p ON pv.product_id = p.id WHERE pv.tenant_id != p.tenant_id;

-- 8.5 ESTADO REAL DE order_items.tenant_id (CONSULTA SEGURA MEDIANTE JSON PARA EVITAR CRASH DEL PARSER SI NO EXISTE)
SELECT 
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'tenant_id') THEN 'YES' ELSE 'NO' END AS tenant_id_column_exists,
    COALESCE((SELECT is_nullable FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'tenant_id'), 'N/A') AS is_nullable,
    (SELECT COUNT(*) FROM public.order_items WHERE (to_jsonb(order_items)->>'tenant_id') IS NULL) AS null_count,
    (SELECT COUNT(*) FROM public.order_items oi JOIN public.orders o ON oi.order_id = o.id WHERE (to_jsonb(oi)->>'tenant_id') IS NOT NULL AND (to_jsonb(oi)->>'tenant_id') != o.tenant_id::text) AS order_mismatch_count,
    (SELECT COUNT(*) FROM public.order_items oi JOIN public.products p ON oi.product_id = p.id WHERE (to_jsonb(oi)->>'tenant_id') IS NOT NULL AND (to_jsonb(oi)->>'tenant_id') != p.tenant_id::text) AS product_mismatch_count;
