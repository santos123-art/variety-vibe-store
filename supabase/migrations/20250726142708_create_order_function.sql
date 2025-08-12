-- Custom type for order items to make the function signature cleaner
CREATE TYPE public.order_item_type AS (
  product_id UUID,
  quantity INT,
  price NUMERIC
);

-- Function to create an order and its items in a single transaction
CREATE OR REPLACE FUNCTION public.create_order(
  p_user_id UUID,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_address TEXT,
  p_order_items public.order_item_type[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_amount NUMERIC := 0;
  v_order_id UUID;
  item public.order_item_type;
BEGIN
  -- This function should run with the permissions of the definer (e.g., postgres)
  -- to bypass RLS policies for inserting into orders and order_items.
  -- The RLS policies should still prevent users from reading other users' orders.

  -- 1. Calculate total amount from the items
  FOREACH item IN ARRAY p_order_items
  LOOP
    -- Ensure price and quantity are not null and are positive
    IF item.price IS NULL OR item.price <= 0 OR item.quantity IS NULL OR item.quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid price or quantity for product %', item.product_id;
    END IF;
    v_total_amount := v_total_amount + (item.price * item.quantity);
  END LOOP;

  -- 2. Insert into the orders table
  INSERT INTO public.orders (user_id, total_amount, customer_name, customer_phone, customer_address)
  VALUES (p_user_id, v_total_amount, p_customer_name, p_customer_phone, p_customer_address)
  RETURNING id INTO v_order_id;

  -- 3. Insert into the order_items table
  FOREACH item IN ARRAY p_order_items
  LOOP
    INSERT INTO public.order_items (order_id, product_id, quantity, price)
    VALUES (v_order_id, item.product_id, item.quantity, item.price);
  END LOOP;

  -- 4. Return the new order ID
  RETURN v_order_id;
END;
$$;
