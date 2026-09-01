BEGIN;

-- ==============================================================================
-- 00013_global_realtime.sql
-- Description: Enable Supabase Realtime publication for key application tables
-- to allow global reactive UI updates without page reloads.
-- ==============================================================================

-- Drop the publication if it already exists (unlikely in default supabase, 
-- but just to ensure idempotency if running locally/resetting)
-- Instead of dropping, we can just alter it, but first ensure it exists.
-- Supabase creates `supabase_realtime` by default.

-- Use a DO block to safely and idempotently add tables to the publication
-- This prevents the "already member of publication" error if run multiple times
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'public.tenants',
        'public.tenant_settings',
        'public.profiles',
        'public.categories',
        'public.products',
        'public.product_images',
        'public.product_variants',
        'public.collections',
        'public.product_collections',
        'public.orders',
        'public.order_items',
        'public.customers',
        'public.activity_log'
    ];
BEGIN
    FOR t IN SELECT unnest(tables) LOOP
        BEGIN
            EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE ' || t;
        EXCEPTION
            WHEN duplicate_object THEN
                -- Do nothing, table is already in the publication
        END;
    END LOOP;
END $$;

COMMIT;
