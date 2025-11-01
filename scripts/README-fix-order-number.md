# Fix for generate_order_number Function Error

## Problem
The application is showing an error:
```
Could not find the function public.generate_order_number without parameters in the schema cache
```

This error occurs when the Cart component tries to generate an order number during checkout.

## Solution Options

### Option 1: Manual SQL Execution (Recommended)

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `scripts/fix-order-number-function.sql`
4. Click "Run" to execute the SQL

### Option 2: Run the Node.js Script

If you have your Supabase credentials set up in your `.env` file:

```bash
node scripts/fix-order-number.js
```

### Option 3: Use the Supabase CLI (if properly configured)

```bash
npx supabase db push
```

## What the Fix Does

The SQL script:
1. Drops any existing `generate_order_number` function
2. Recreates the function with proper security settings (`SECURITY DEFINER`)
3. Sets the correct search path to `public`
4. Grants execute permissions to `authenticated` and `service_role` users
5. Includes a verification query to confirm the function was created

## Function Details

The `generate_order_number` function:
- Generates order numbers in the format `DDMMYYYY-1`, `DDMMYYYY-2`, etc.
- Counts existing orders for the current date to determine the next number
- Is used by the Cart component during checkout to create unique order identifiers

## After Applying the Fix

Once the fix is applied:
1. The error should disappear
2. Users will be able to complete checkout successfully
3. Order numbers will be generated automatically in the format described above

## Troubleshooting

If the error persists after applying the fix:
1. Verify the function was created by running: `SELECT proname FROM pg_proc WHERE proname = 'generate_order_number'`
2. Check that your Supabase client has the correct permissions
3. Ensure the `orders` table exists with the `order_number` column