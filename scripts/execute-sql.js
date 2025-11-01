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

async function executeSQL() {
  try {
    console.log('Executing SQL to fix generate_order_number function...');
    
    // First, try to create the function directly
    const { data, error } = await supabase
      .from('pg_proc')
      .select('*')
      .eq('proname', 'generate_order_number');
    
    if (error) {
      console.log('Function does not exist, creating it...');
      
      // Use raw SQL execution through the Supabase client
      const { data: createData, error: createError } = await supabase
        .rpc('exec', {
          sql: `
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
            
            GRANT EXECUTE ON FUNCTION public.generate_order_number() TO authenticated;
            GRANT EXECUTE ON FUNCTION public.generate_order_number() TO service_role;
          `
        });
      
      if (createError) {
        console.error('Error creating function:', createError);
        console.log('\nPlease run the SQL manually in your Supabase SQL editor:');
        console.log('File: scripts/fix-order-number-function.sql');
      } else {
        console.log('✅ Function created successfully!');
      }
    } else {
      console.log('Function already exists, updating it...');
      // Similar update logic here
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    console.log('\nPlease run the SQL manually in your Supabase SQL editor:');
    console.log('File: scripts/fix-order-number-function.sql');
  }
}

executeSQL();