// Script to check and fix Supabase email settings
// Run with: node scripts/fix-email-settings.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkEmailSettings() {
  console.log('Checking current email settings...');
  
  try {
    // Check current email settings
    const { data: settings, error } = await supabase
      .from('config')
      .select('*');
    
    if (error) {
      console.error('Error fetching email settings:', error);
      return;
    }
    
    console.log('Current email settings:', settings);
    
    // Check if email confirmations are enabled
    const emailEnabled = settings?.find(s => s.key === 'ENABLE_EMAIL_CONFIRMATIONS');
    console.log('Email confirmations enabled:', emailEnabled?.value);
    
    if (!emailEnabled || emailEnabled.value !== 'true') {
      console.log('Enabling email confirmations...');
      
      // Enable email confirmations
      const { error: updateError } = await supabase
        .from('config')
        .update({ 
          'ENABLE_EMAIL_CONFIRMATIONS': 'true'
        })
        .eq('key', 'ENABLE_EMAIL_CONFIRMATIONS');
      
      if (updateError) {
        console.error('Error enabling email confirmations:', updateError);
      } else {
        console.log('Email confirmations enabled successfully!');
      }
    } else {
      console.log('Email confirmations are already enabled.');
    }
    
    // Check SMTP settings
    const { data: smtpSettings } = await supabase
      .from('config')
      .select('*')
      .eq('key', 'SMTP');
    
    if (smtpSettings) {
      console.log('Current SMTP settings:', smtpSettings);
    } else {
      console.log('No custom SMTP settings found, using Supabase default.');
    }
    
  } catch (error) {
    console.error('Error checking email settings:', error);
  }
}

async function testEmailSending() {
  console.log('Testing email sending...');
  
  try {
    // Test with a simple signup to trigger email
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test123456';
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: 'http://localhost:5173/auth'
      }
    });
    
    if (error) {
      console.error('Test signup failed:', error);
    } else {
      console.log('Test signup successful, email should be sent.');
    }
    
    // Clean up test user
    if (data.user) {
      await supabase.auth.admin.deleteUser(data.user.id);
      console.log('Test user deleted.');
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

async function main() {
  console.log('=== Supabase Email Settings Fix ===');
  console.log('Supabase URL:', supabaseUrl);
  
  await checkEmailSettings();
  await testEmailSending();
  
  console.log('\n=== Email Settings Check Complete ===');
  console.log('\nIf emails are still not working:');
  console.log('1. Check your Supabase project dashboard > Authentication > Settings');
  console.log('2. Ensure "Enable email confirmations" is turned ON');
  console.log('3. Check your SMTP settings or use Supabase email service');
  console.log('4. Look for emails in spam/junk folders');
  console.log('5. Try the resend functionality in the app');
}

main().catch(console.error);