-- ==========================================
-- MIGRATION 6: AUTH TRIGGER FOR REGISTRATION
-- ==========================================

-- Trigger to automatically create Tenant and Profile when a user signs up.
-- This works perfectly even if "Confirm Email" is enabled in Supabase.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_tenant_id UUID;
    v_store_name TEXT;
    v_slug TEXT;
BEGIN
    v_store_name := NEW.raw_user_meta_data->>'storeName';
    v_slug := NEW.raw_user_meta_data->>'slug';

    -- Only create tenant if this is a primary sign-up with store data
    IF v_store_name IS NOT NULL AND v_slug IS NOT NULL THEN
        -- Insert Tenant
        INSERT INTO public.tenants (name, slug, status)
        VALUES (v_store_name, v_slug, 'active')
        RETURNING id INTO v_tenant_id;

        -- Insert Tenant Settings
        INSERT INTO public.tenant_settings (tenant_id, store_name, currency, locale)
        VALUES (v_tenant_id, v_store_name, 'USD', 'en-US');

        -- Insert Profile (Admin)
        INSERT INTO public.profiles (user_id, tenant_id, full_name, role)
        VALUES (NEW.id, v_tenant_id, v_store_name, 'admin');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
