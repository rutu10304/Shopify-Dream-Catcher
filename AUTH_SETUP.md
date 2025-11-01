# Authentication Setup Guide

This guide will help you set up authentication for The Right Knot application.

## Prerequisites

1. Make sure you have your Supabase project configured with the environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

## Setting Up an Admin User

### Option 1: Using the Setup Script (Recommended)

1. Add your Supabase service role key to your `.env` file:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
   (You can find this in your Supabase project settings under API)

2. Install the required dependencies:
   ```bash
   npm install dotenv
   ```

3. Run the setup script:
   ```bash
   node scripts/setup-admin.js
   ```
   This will create an admin user with:
   - Email: admin@rightknot.com
   - Password: admin123456

   You can also provide custom email and password:
   ```bash
   node scripts/setup-admin.js your-email@example.com your-password
   ```

### Option 2: Manual Setup in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Add user"
4. Enter the admin email and password
5. After creating the user, go to the SQL Editor
6. Run the following SQL to assign admin role:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES (
     'your-user-id-here', 
     'admin'
   );
   ```

## Authentication Flow

### User Registration
1. Users navigate to `/auth`
2. They can sign up with email and password
3. After registration, they receive an email confirmation with a confirmation link
4. When they click the confirmation link, they're redirected back to `/auth` with tokens
5. The app automatically confirms their email and shows a success message
6. They can then sign in with their credentials

### Admin Login
1. Admins navigate to `/admin-login`
2. They sign in with their admin credentials
3. The system checks if they have admin role
4. If successful, they're redirected to `/admin`

### User Profile
1. After signing in, users can access their profile at `/profile`
2. They can view their order history
3. They can update their personal information

## Troubleshooting

### "Invalid login credentials" Error
- Verify the email and password are correct
- Check if the user has confirmed their email (for regular users)
- For admin users, ensure they have the admin role in the `user_roles` table

### "You don't have admin permissions" Error
- Check if the user has an entry in the `user_roles` table with role 'admin'
- Run this SQL to verify:
  ```sql
  SELECT * FROM public.user_roles WHERE role = 'admin';
  ```

### Email Confirmation Not Working
- Check your Supabase email settings in Authentication > Settings
- Ensure the email redirect URL is set correctly in your project settings
- The redirect URL should be: `your-domain.com/auth`
- For local development, use: `http://localhost:5173/auth`
- Make sure to add both Site URL and Redirect URLs in Supabase dashboard:
  - Site URL: `http://localhost:5173` (for development)
  - Redirect URLs: `http://localhost:5173/auth` (for development)
- If you're accessing the app via IP address (like 172.21.240.1:8080), the app will automatically
  redirect to localhost for email confirmation to ensure it works correctly

## Email Not Received?

If you're not receiving confirmation emails:

1. **Check Supabase Email Settings**:
   - Go to Authentication > Settings in your Supabase dashboard
   - Ensure "Enable email confirmations" is turned ON
   - Check the "Sender email" and "Reply-to email" are valid

2. **Check Spam/Junk Folders**:
   - Look for emails from "noreply@supabase.co" or your custom sender
   - Mark as "Not Spam" to improve future delivery

3. **Use Resend Feature**:
   - After signing up, if you don't receive the email within 5 minutes
   - Use the "Resend confirmation email" button on the auth page
   - Enter your email address and click resend

4. **Verify Email Address**:
   - Double-check for typos in the email address during signup
   - Try with a different email provider if needed

## Security Notes

1. Always use HTTPS in production
2. Keep your service role key secret and never expose it in client-side code
3. Regular users cannot access admin routes due to RLS policies
4. Admin users should use strong passwords
5. Consider implementing two-factor authentication for admin accounts

## Database Schema

The authentication system uses these key tables:
- `auth.users` - Supabase's built-in user authentication
- `public.user_roles` - Custom table to assign roles (admin/user)
- `public.profiles` - Extended user profile information

Row Level Security (RLS) is enabled on all tables to ensure users can only access their own data, while admins can access all data.