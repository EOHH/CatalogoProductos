-- ==========================================
-- STORAGE BUCKETS SETUP
-- ==========================================

-- Insert the 'catalogs' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('catalogs', 'catalogs', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- STORAGE RLS POLICIES
-- ==========================================

-- (Nota: RLS ya está habilitado por defecto en storage.objects en Supabase Cloud)

-- 1. Public Read Access
-- Anyone can view catalog images since the bucket is public, but we enforce it here as well
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'catalogs' );

-- 2. Insert Access (Admin/Editor only)
-- The object path should be something like: [tenant_id]/products/[product_id]/[file.webp]
-- We check if the user has admin/editor role in the tenant specified by the first folder in the path
CREATE POLICY "Tenant Admins can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'catalogs'
    AND
    auth_user_has_role_in_tenant(
        CAST((string_to_array(name, '/'))[1] AS UUID),
        ARRAY['admin', 'editor']
    )
);

-- 3. Update Access (Admin/Editor only)
CREATE POLICY "Tenant Admins can update images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'catalogs'
    AND
    auth_user_has_role_in_tenant(
        CAST((string_to_array(name, '/'))[1] AS UUID),
        ARRAY['admin', 'editor']
    )
);

-- 4. Delete Access (Admin/Editor only)
CREATE POLICY "Tenant Admins can delete images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'catalogs'
    AND
    auth_user_has_role_in_tenant(
        CAST((string_to_array(name, '/'))[1] AS UUID),
        ARRAY['admin', 'editor']
    )
);
