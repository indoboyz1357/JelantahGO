-- Recreate the function to ensure customer_id is correctly linked
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

  -- Capitalize the role to match the frontend enum
  user_role := INITCAP(user_role);

  -- Create a customer profile for the new user
  INSERT INTO public.customers (id, name, phone)
  VALUES (NEW.id::uuid, user_name, NEW.phone)
  RETURNING id INTO new_customer_id;
  
  -- Create a user profile, linking it to the new customer profile
  INSERT INTO public.users (id, name, role, customer_id)
  VALUES (NEW.id, user_name, user_role, new_customer_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;