-- This migration fixes the handle_new_user function to be case-insensitive when checking the user's role.
-- This ensures that a customer profile is created correctly regardless of the casing ('Customer' vs 'customer').

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_customer_id UUID;
  user_name TEXT;
  user_role TEXT;
BEGIN
  -- Extract name from metadata, default to a placeholder if not available
  user_name := COALESCE(NEW.raw_user_meta_data ->> 'name', 'New User');
  
  -- Extract role from metadata, default to 'customer' if not available
  user_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer');

  -- If the user is a customer (case-insensitive check), create a corresponding customer profile
  IF LOWER(user_role) = 'customer' THEN
    INSERT INTO public.customers (name, phone)
    VALUES (user_name, NEW.phone)
    RETURNING id INTO new_customer_id;
  END IF;
  
  -- Create a user profile for every new user
  -- Note: The original role casing from metadata is preserved in the users table.
  INSERT INTO public.users (id, name, role, customer_id)
  VALUES (NEW.id, user_name, user_role, new_customer_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-applying the trigger to ensure it's using the latest function definition.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();