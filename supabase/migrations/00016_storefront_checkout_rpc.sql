-- Función segura para registrar pedidos públicos desde el Catálogo Virtual
-- Esta función corre con privilegios de creador (SECURITY DEFINER) para saltarse las restricciones de RLS
-- que impiden a los usuarios anónimos (públicos) escribir en las tablas de clientes y pedidos.

CREATE OR REPLACE FUNCTION public.process_storefront_checkout(
  p_tenant_id uuid,
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_total_amount numeric,
  p_notes text,
  p_items jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer_id uuid;
  v_order_id uuid;
  v_item jsonb;
BEGIN
  -- 1. Buscar si el cliente ya existe por número de teléfono
  SELECT id INTO v_customer_id 
  FROM public.customers 
  WHERE tenant_id = p_tenant_id AND phone = p_phone 
  LIMIT 1;

  -- 2. Si no existe, crear el cliente
  IF v_customer_id IS NULL THEN
    INSERT INTO public.customers (
      tenant_id, 
      first_name, 
      last_name, 
      phone, 
      total_spent, 
      orders_count
    )
    VALUES (
      p_tenant_id, 
      p_first_name, 
      p_last_name, 
      p_phone, 
      0, 
      0
    )
    RETURNING id INTO v_customer_id;
  END IF;

  -- 3. Crear el Pedido (Order)
  INSERT INTO public.orders (
    tenant_id,
    customer_id,
    status,
    total_amount,
    notes
  )
  VALUES (
    p_tenant_id,
    v_customer_id,
    'pending',
    p_total_amount,
    p_notes
  )
  RETURNING id INTO v_order_id;

  -- 4. Crear los Items del Pedido (Order Items)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.order_items (
      tenant_id,
      order_id,
      product_id,
      quantity,
      unit_price,
      total_price
    )
    VALUES (
      p_tenant_id,
      v_order_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price')::numeric,
      ((v_item->>'quantity')::integer * (v_item->>'unit_price')::numeric)
    );
  END LOOP;

  -- Retornar el ID del pedido generado
  RETURN v_order_id;
END;
$$;
