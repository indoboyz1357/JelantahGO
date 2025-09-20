-- Recreate the function to ensure roles are stored with correct casing (e.g., 'Customer')
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_customer_id UUID;
  user_name TEXT;
  user_role TEXT;
BEGIN
  -- Extract name and role from metadata
  user_name := COALESCE(NEW.raw_user_meta_data ->> 'name', 'New User');
  user_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'Customer'); -- Default to 'Customer'

  -- Capitalize the role to match the frontend enum (e.g., 'customer' -> 'Customer')
  user_role := INITCAP(user_role);

  -- Create a customer profile for every new user
  INSERT INTO public.customers (name, phone)
  VALUES (user_name, NEW.phone)
  RETURNING id INTO new_customer_id;
  
  -- Create a user profile for every new user
  INSERT INTO public.users (id, name, role, customer_id)
  VALUES (NEW.id, user_name, user_role, new_customer_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger itself does not need to be recreated, as it just calls the function.