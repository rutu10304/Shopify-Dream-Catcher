-- Fix search path for generate_order_number function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_date TEXT;
  order_count INTEGER;
  new_order_number TEXT;
BEGIN
  today_date := TO_CHAR(CURRENT_DATE, 'DDMMYYYY');
  
  SELECT COUNT(*) INTO order_count
  FROM public.orders
  WHERE order_number LIKE today_date || '-%';
  
  new_order_number := today_date || '-' || (order_count + 1)::TEXT;
  
  RETURN new_order_number;
END;
$$;