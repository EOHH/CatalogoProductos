BEGIN;

-- ==============================================================================
-- 00012_update_tenant_slug.sql
-- Description: RPC para actualizar de forma segura el slug del tenant evitando 
-- colisiones tanto con otros slugs como con custom_domains.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.update_tenant_slug(
    p_tenant_id UUID,
    p_new_slug TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_count INT;
    v_normalized_slug TEXT;
BEGIN
    -- 1. Validar permisos (debe ser admin del tenant)
    IF NOT public.auth_user_has_role_in_tenant(p_tenant_id, ARRAY['admin']) THEN
        RAISE EXCEPTION 'Unauthorized: Solo administradores pueden cambiar el dominio';
    END IF;

    -- 2. Normalizar y validar el nuevo slug
    v_normalized_slug := lower(trim(p_new_slug));
    
    IF v_normalized_slug = '' THEN
        RAISE EXCEPTION 'El subdominio no puede estar vacío';
    END IF;

    IF v_normalized_slug !~ '^[a-z0-9-]+$' THEN
        RAISE EXCEPTION 'El subdominio solo puede contener letras, números y guiones';
    END IF;

    IF length(v_normalized_slug) < 3 THEN
        RAISE EXCEPTION 'El subdominio debe tener al menos 3 caracteres';
    END IF;

    -- 3. Check collision across BOTH slug and custom_domain
    SELECT COUNT(*) INTO v_count
    FROM public.tenants
    WHERE (slug = v_normalized_slug OR custom_domain = v_normalized_slug)
      AND id != p_tenant_id;

    IF v_count > 0 THEN
        RAISE EXCEPTION 'Subdomain is already taken';
    END IF;

    -- 4. Update
    UPDATE public.tenants
    SET slug = v_normalized_slug, updated_at = NOW()
    WHERE id = p_tenant_id;

    RETURN jsonb_build_object(
        'success', true, 
        'slug', v_normalized_slug
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_tenant_slug(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_tenant_slug(UUID, TEXT) TO authenticated;

COMMIT;
