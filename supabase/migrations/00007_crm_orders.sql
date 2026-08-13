-- 00007_crm_orders.sql

-- 1. Create the update_modified_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Drop existing tables if they exist to apply the new schema cleanly
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;

-- 3. Create customers table
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  first_name text NOT NULL,
  last_name text,
  phone text,
  email text,
  total_spent numeric(10,2) NOT NULL DEFAULT 0,
  orders_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT customers_pkey PRIMARY KEY (id),
  CONSTRAINT customers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- 4. Create orders table
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'in_production'::text, 'packaging'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text])),
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
  CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE
);

-- 5. Create order items table
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_customers_tenant ON public.customers(tenant_id);
CREATE INDEX idx_orders_tenant ON public.orders(tenant_id);
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policies for customers
CREATE POLICY "Users can view customers of their tenant" 
  ON public.customers FOR SELECT 
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert customers for their tenant" 
  ON public.customers FOR INSERT 
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update customers of their tenant" 
  ON public.customers FOR UPDATE 
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete customers of their tenant" 
  ON public.customers FOR DELETE 
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));

-- Policies for orders
CREATE POLICY "Users can view orders of their tenant" 
  ON public.orders FOR SELECT 
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert orders for their tenant" 
  ON public.orders FOR INSERT 
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update orders of their tenant" 
  ON public.orders FOR UPDATE 
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete orders of their tenant" 
  ON public.orders FOR DELETE 
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));

-- Policies for order_items
CREATE POLICY "Users can view order items of their tenant" 
  ON public.order_items FOR SELECT 
  USING (order_id IN (SELECT id FROM public.orders WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users can insert order items for their tenant" 
  ON public.order_items FOR INSERT 
  WITH CHECK (order_id IN (SELECT id FROM public.orders WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users can update order items of their tenant" 
  ON public.order_items FOR UPDATE 
  USING (order_id IN (SELECT id FROM public.orders WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users can delete order items of their tenant" 
  ON public.order_items FOR DELETE 
  USING (order_id IN (SELECT id FROM public.orders WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())));

-- Triggers for updated_at
CREATE TRIGGER update_customers_modtime
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_orders_modtime
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
