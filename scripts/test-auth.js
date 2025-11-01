// Test script to verify authentication setup
// Run with: node scripts/test-auth.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- VITE_SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🔍 Testing authentication setup...\n');

  try {
    // Test 1: Check if we can connect to Supabase
    console.log('1. Testing Supabase connection...');
    const { data, error } = await supabase.from('products').select('count').single();
    if (error) {
      console.error('❌ Failed to connect to Supabase:', error.message);
      return;
    }
    console.log('✅ Successfully connected to Supabase\n');

    // Test 2: Check if user_roles table exists
    console.log('2. Checking user_roles table...');
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);
    
    if (rolesError) {
      console.error('❌ user_roles table not accessible:', rolesError.message);
      return;
    }
    console.log('✅ user_roles table is accessible\n');

    // Test 3: Check if admin user exists (optional)
    console.log('3. Checking for admin users...');
    const { data: adminData, error: adminError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .eq('role', 'admin');
    
    if (adminError) {
      console.error('❌ Error checking admin users:', adminError.message);
    } else {
      if (adminData.length > 0) {
        console.log(`✅ Found ${adminData.length} admin user(s)\n`);
      } else {
        console.log('⚠️ No admin users found. Run "npm run setup:admin" to create one.\n');
      }
    }

    // Test 4: Check if profiles table exists
    console.log('4. Checking profiles table...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ profiles table not accessible:', profilesError.message);
      return;
    }
    console.log('✅ profiles table is accessible\n');

    console.log('🎉 Authentication setup appears to be correct!');
    console.log('\nNext steps:');
    console.log('1. Run "npm run setup:admin" to create an admin user');
    console.log('2. Start the app with "npm run dev"');
    console.log('3. Navigate to /auth to test user registration');
    console.log('4. Navigate to /admin-login to test admin login');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testAuth();