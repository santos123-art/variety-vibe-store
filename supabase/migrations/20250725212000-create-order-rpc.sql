-- Tipos personalizados para os parâmetros da função
CREATE TYPE public.customer_details AS (
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  notes TEXT
);

CREATE TYPE public.order_item_data AS (
  product_id UUID,
  quantity INTEGER,
  price DECIMAL(10,2)
);

-- Função para criar um novo pedido e seus itens atomicamente
CREATE OR REPLACE FUNCTION public.create_order(
  user_id UUID,
  order_status TEXT,
  total_amount DECIMAL(10,2),
  customer_details public.customer_details,
  order_items_data public.order_item_data[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_order_id UUID;
  item public.order_item_data;
BEGIN
  -- Inserir o pedido na tabela 'orders'
  INSERT INTO public.orders (user_id, status, total_amount, customer_name, customer_phone, customer_address, notes)
  VALUES (
    user_id,
    order_status,
    total_amount,
    customer_details.customer_name,
    customer_details.customer_phone,
    customer_details.customer_address,
    customer_details.notes
  )
  RETURNING id INTO new_order_id;

  -- Inserir os itens do pedido na tabela 'order_items'
  IF array_length(order_items_data, 1) > 0 THEN
    FOREACH item IN ARRAY order_items_data
    LOOP
      INSERT INTO public.order_items (order_id, product_id, quantity, price)
      VALUES (new_order_id, item.product_id, item.quantity, item.price);
    END LOOP;
  END IF;

  RETURN new_order_id;
END;
$$;
