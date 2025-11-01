const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixOrderNumberFunction() {
  try {
    console.log('Fixing generate_order_number function...');
    
    // SQL to fix the function
    const sql = `
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
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      process.exit(1);
    }
    
    console.log('✅ generate_order_number function has been fixed successfully!');
    
    // Test the function
    const { data: testData, error: testError } = await supabase.rpc('generate_order_number');
    
    if (testError) {
      console.error('Error testing function:', testError);
    } else {
      console.log('✅ Function test successful. Generated order number:', testData);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

fixOrderNumberFunction();