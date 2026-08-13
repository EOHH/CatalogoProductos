-- ==========================================
-- 1. TENANT DOMAINS & BRANDING
-- ==========================================

-- Añadir custom_domain a tenants
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE;

-- ==========================================
-- 2. BUCKET PARA ASSETS DE TENANTS
-- ==========================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tenant-assets', 
  'tenant-assets', 
  true,
  2097152, -- 2MB límite estricto en el backend para logos
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/x-icon', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET 
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas del bucket tenant-assets
CREATE POLICY "Public Read Access Tenant Assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'tenant-assets' );

CREATE POLICY "Tenant Admins can upload assets"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'tenant-assets'
    AND
    auth_user_has_role_in_tenant(
        CAST((string_to_array(name, '/'))[1] AS UUID),
        ARRAY['admin']
    )
);

CREATE POLICY "Tenant Admins can update assets"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'tenant-assets'
    AND
    auth_user_has_role_in_tenant(
        CAST((string_to_array(name, '/'))[1] AS UUID),
        ARRAY['admin']
    )
);

CREATE POLICY "Tenant Admins can delete assets"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'tenant-assets'
    AND
    auth_user_has_role_in_tenant(
        CAST((string_to_array(name, '/'))[1] AS UUID),
        ARRAY['admin']
    )
);

-- ==========================================
-- 3. RLS AJUSTADO PARA PEDIDOS ANÓNIMOS
-- ==========================================

-- Desactivamos momentáneamente las políticas de orders y customers para reemplazarlas
DROP POLICY IF EXISTS "Users can insert orders for their tenant" ON public.orders;
DROP POLICY IF EXISTS "Users can insert customers for their tenant" ON public.customers;
DROP POLICY IF EXISTS "Users can insert order_items for their tenant" ON public.order_items;

-- Customers: Permitir que CUALQUIER usuario (incluyendo anónimos) cree clientes
-- Pero el tenant_id debe ser un tenant válido. 
-- Así permitimos los checkouts anónimos sin comprometer que alguien lea clientes ajenos.
CREATE POLICY "Anyone can insert customers" 
  ON public.customers FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.tenants WHERE id = tenant_id AND status = 'active'));

-- Orders: Igual, cualquiera puede crear un pedido
CREATE POLICY "Anyone can insert orders" 
  ON public.orders FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.tenants WHERE id = tenant_id AND status = 'active'));

-- Order Items: Cualquiera puede crear items de un pedido
CREATE POLICY "Anyone can insert order_items" 
  ON public.order_items FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o 
      JOIN public.tenants t ON o.tenant_id = t.id
      WHERE o.id = order_id AND t.status = 'active'
    )
  );
