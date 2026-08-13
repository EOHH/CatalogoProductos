-- ==========================================
-- 0. UTILS & EXTENSIONS
-- ==========================================

-- Function to auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 1. TABLES & CONSTRAINTS
-- ==========================================

-- TENANTS
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    logo_url TEXT,
    favicon_url TEXT,
    primary_color TEXT,
    secondary_color TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_tenants_updated_at
BEFORE UPDATE ON tenants
FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at();

-- TENANT SETTINGS
CREATE TABLE tenant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    description TEXT,
    contact_email TEXT,
    phone TEXT,
    address TEXT,
    currency TEXT NOT NULL DEFAULT 'USD',
    locale TEXT NOT NULL DEFAULT 'en-US',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id)
);

CREATE TRIGGER set_tenant_settings_updated_at
BEFORE UPDATE ON tenant_settings
FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at();

-- PROFILES (Users and their association with tenants)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, tenant_id)
);

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at();

-- CATEGORIES
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, slug),
    UNIQUE(id, tenant_id) -- Required for Composite Foreign Key in products
);

CREATE TRIGGER set_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at();

-- PRODUCTS
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    sku TEXT,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    compare_at_price NUMERIC(12, 2),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
    featured BOOLEAN NOT NULL DEFAULT false,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (category_id, tenant_id) REFERENCES categories(id, tenant_id) ON DELETE RESTRICT,
    UNIQUE(tenant_id, slug),
    UNIQUE(id, tenant_id) -- Required for Composite Foreign Key in child tables
);

CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at();

-- PRODUCT IMAGES
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    alt_text TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (product_id, tenant_id) REFERENCES products(id, tenant_id) ON DELETE CASCADE
);

-- PRODUCT VARIANTS
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    name TEXT NOT NULL,
    sku TEXT,
    price NUMERIC(12, 2),
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (product_id, tenant_id) REFERENCES products(id, tenant_id) ON DELETE CASCADE
);

CREATE TRIGGER set_product_variants_updated_at
BEFORE UPDATE ON product_variants
FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at();

-- ==========================================
-- 2. INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_categories_tenant_id ON categories(tenant_id);
CREATE INDEX idx_products_tenant_id ON products(tenant_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_products_status ON products(status);

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- HELPER FUNCTION FOR RLS
-- ------------------------------------------
-- Security Definer to avoid infinite recursion when querying profiles
CREATE OR REPLACE FUNCTION auth_user_has_role_in_tenant(p_tenant_id UUID, p_roles TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role 
    FROM profiles 
    WHERE user_id = auth.uid() AND tenant_id = p_tenant_id;
    
    RETURN v_role = ANY(p_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------
-- POLICIES
-- ------------------------------------------

-- TENANTS
CREATE POLICY "Tenants are viewable by everyone" ON tenants
    FOR SELECT USING (status = 'active');
    
CREATE POLICY "Tenants can be updated by tenant admins" ON tenants
    FOR UPDATE USING (auth_user_has_role_in_tenant(id, ARRAY['admin']));

-- TENANT SETTINGS
CREATE POLICY "Tenant settings are viewable by everyone" ON tenant_settings
    FOR SELECT USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_settings.tenant_id AND status = 'active'));

CREATE POLICY "Tenant settings can be updated by tenant admins" ON tenant_settings
    FOR UPDATE USING (auth_user_has_role_in_tenant(tenant_id, ARRAY['admin']));

-- PROFILES
CREATE POLICY "Users can view their own profile and tenant members" ON profiles
    FOR SELECT USING (
        user_id = auth.uid() 
        OR auth_user_has_role_in_tenant(tenant_id, ARRAY['admin', 'editor', 'viewer'])
    );

CREATE POLICY "Tenant admins can manage profiles" ON profiles
    FOR ALL USING (auth_user_has_role_in_tenant(tenant_id, ARRAY['admin']));

-- CATEGORIES
CREATE POLICY "Categories viewable by everyone if active" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Categories manage by tenant admins/editors" ON categories
    FOR ALL USING (auth_user_has_role_in_tenant(tenant_id, ARRAY['admin', 'editor']));

-- PRODUCTS
CREATE POLICY "Products viewable by everyone if published" ON products
    FOR SELECT USING (status = 'published');

CREATE POLICY "Products manage by tenant admins/editors" ON products
    FOR ALL USING (auth_user_has_role_in_tenant(tenant_id, ARRAY['admin', 'editor']));

-- PRODUCT IMAGES
CREATE POLICY "Product images viewable by everyone" ON product_images
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM products WHERE id = product_images.product_id AND status = 'published')
    );

CREATE POLICY "Product images manage by tenant admins/editors" ON product_images
    FOR ALL USING (auth_user_has_role_in_tenant(tenant_id, ARRAY['admin', 'editor']));

-- PRODUCT VARIANTS
CREATE POLICY "Product variants viewable by everyone" ON product_variants
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM products WHERE id = product_variants.product_id AND status = 'published')
    );

CREATE POLICY "Product variants manage by tenant admins/editors" ON product_variants
    FOR ALL USING (auth_user_has_role_in_tenant(tenant_id, ARRAY['admin', 'editor']));
