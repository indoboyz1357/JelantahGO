-- Function to create a user profile when a new user signs up in auth.users
-- This version allows an admin to specify a role during user creation via metadata.
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

  -- If the user is a customer, create a corresponding customer profile
  IF user_role = 'customer' THEN
    INSERT INTO public.customers (name, phone)
    VALUES (user_name, NEW.phone)
    RETURNING id INTO new_customer_id;
  END IF;
  
  -- Create a user profile for every new user
  INSERT INTO public.users (id, name, role, customer_id)
  VALUES (NEW.id, user_name, user_role, new_customer_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger itself does not need to be changed, just the function it calls.
-- Re-applying the trigger is good practice to ensure it's using the latest function definition.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();