// This script helps create an initial admin user
// Run with: node scripts/setup-admin.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need to add this to your .env

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY (add this to your .env file)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser(email, password) {
  try {
    console.log(`Creating admin user with email: ${email}`);
    
    // Call the database function to create admin user
    const { data, error } = await supabase.rpc('create_admin_user', {
      email,
      password
    });

    if (error) {
      console.error('Error creating admin user:', error);
      return;
    }

    console.log('Result:', data);
    
    if (data === 'Admin user created successfully') {
      console.log('\n✅ Admin user created successfully!');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log('\nYou can now log in at /admin-login');
    } else {
      console.log('\n⚠️', data);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Get email and password from command line arguments or use defaults
const email = process.argv[2] || 'admin@rightknot.com';
const password = process.argv[3] || 'admin123456';

createAdminUser(email, password);