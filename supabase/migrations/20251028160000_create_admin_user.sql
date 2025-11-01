-- Function to create a user with admin role
CREATE OR REPLACE FUNCTION public.create_admin_user(email TEXT, password TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Create the user in auth.users
  INSERT INTO auth.users (email, password_hash, email_confirmed_at)
  VALUES (
    email,
    crypt(password, gen_salt('bf')),
    now()
  )
  RETURNING id INTO user_id;
  
  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_id, 'admin');
  
  -- Create profile for the admin user
  INSERT INTO public.profiles (id, full_name)
  VALUES (user_id, 'Admin User')
  ON CONFLICT (id) DO NOTHING;
  
  RETURN 'Admin user created successfully';
EXCEPTION
  WHEN unique_violation THEN
    RETURN 'User with this email already exists';
  WHEN OTHERS THEN
    RETURN 'Error creating admin user: ' || SQLERRM;
END;
$$;

-- Create a function to check if a user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = is_admin.user_id
      AND role = 'admin'
  );
$$;