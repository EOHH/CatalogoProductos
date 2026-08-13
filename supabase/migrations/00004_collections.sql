-- ==========================================
-- COLLECTIONS & PRODUCT_COLLECTIONS
-- ==========================================

-- COLLECTIONS
CREATE TABLE collections (
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
    UNIQUE(id, tenant_id) -- Required for Composite Foreign Key in product_collections
);

CREATE TRIGGER set_collections_updated_at
BEFORE UPDATE ON collections
FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at();

-- PRODUCT_COLLECTIONS (Many to Many)
CREATE TABLE product_collections (
    product_id UUID NOT NULL,
    collection_id UUID NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (product_id, collection_id),
    FOREIGN KEY (product_id, tenant_id) REFERENCES products(id, tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (collection_id, tenant_id) REFERENCES collections(id, tenant_id) ON DELETE CASCADE
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_collections_tenant_id ON collections(tenant_id);
CREATE INDEX idx_product_collections_product_id ON product_collections(product_id);
CREATE INDEX idx_product_collections_collection_id ON product_collections(collection_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;

-- COLLECTIONS POLICIES
CREATE POLICY "Collections viewable by everyone if active" ON collections
    FOR SELECT USING (is_active = true);

CREATE POLICY "Collections manage by tenant admins/editors" ON collections
    FOR ALL USING (auth_user_has_role_in_tenant(tenant_id, ARRAY['admin', 'editor']));

-- PRODUCT_COLLECTIONS POLICIES
CREATE POLICY "Product collections viewable by everyone" ON product_collections
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM products WHERE id = product_collections.product_id AND status = 'published')
        AND
        EXISTS (SELECT 1 FROM collections WHERE id = product_collections.collection_id AND is_active = true)
    );

CREATE POLICY "Product collections manage by tenant admins/editors" ON product_collections
    FOR ALL USING (auth_user_has_role_in_tenant(tenant_id, ARRAY['admin', 'editor']));
