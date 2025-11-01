-- Fix the generate_order_number function with proper permissions
-- Run this script in your Supabase SQL editor

-- First, drop the existing function if it exists
DROP FUNCTION IF EXISTS public.generate_order_number();

-- Recreate the function with proper security settings
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

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO service_role;

-- Verify the function was created
SELECT proname, prosrc FROM pg_proc WHERE proname = 'generate_order_number';