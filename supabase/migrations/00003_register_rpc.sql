-- ==========================================
-- MIGRATION 3: REGISTRATION RPC
-- ==========================================

-- This function allows a newly signed up user to create their first Tenant
-- It runs as SECURITY DEFINER so it bypasses RLS to do the initial inserts.

CREATE OR REPLACE FUNCTION register_tenant(
    p_store_name TEXT,
    p_slug TEXT
)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_tenant_id UUID;
BEGIN
    -- 1. Ensure the user is authenticated
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Validate inputs
    IF length(trim(p_store_name)) = 0 OR length(trim(p_slug)) = 0 THEN
        RAISE EXCEPTION 'Store name and slug are required';
    END IF;

    -- 3. Check if user already belongs to a tenant (Optional logic, we'll allow 1 for now)
    IF EXISTS (SELECT 1 FROM profiles WHERE user_id = v_user_id) THEN
        RAISE EXCEPTION 'User already has a profile';
    END IF;

    -- 4. Check if slug exists
    IF EXISTS (SELECT 1 FROM tenants WHERE slug = p_slug) THEN
        RAISE EXCEPTION 'Slug already in use';
    END IF;

    -- 5. Insert the new Tenant
    INSERT INTO tenants (name, slug, status)
    VALUES (p_store_name, p_slug, 'active')
    RETURNING id INTO v_tenant_id;

    -- 6. Insert Tenant Settings
    INSERT INTO tenant_settings (tenant_id, store_name, currency, locale)
    VALUES (v_tenant_id, p_store_name, 'USD', 'en-US');

    -- 7. Insert the User Profile as Admin
    INSERT INTO profiles (user_id, tenant_id, role)
    VALUES (v_user_id, v_tenant_id, 'admin');

    -- Return success
    RETURN json_build_object(
        'success', true,
        'tenant_id', v_tenant_id
    );
EXCEPTION WHEN OTHERS THEN
    -- Propagate error
    RAISE EXCEPTION '%', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
