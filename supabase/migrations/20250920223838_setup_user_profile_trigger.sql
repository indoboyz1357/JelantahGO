-- Function to create a user profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_customer_id UUID;
  user_name TEXT;
BEGIN
  -- Extract name from metadata, default to a placeholder if not available
  user_name := COALESCE(NEW.raw_user_meta_data ->> 'name', 'New User');

  -- Create a customer profile for every new user
  INSERT INTO public.customers (name, phone)
  VALUES (user_name, NEW.phone)
  RETURNING id INTO new_customer_id;
  
  -- Create a user profile for every new user, defaulting role to 'customer'
  INSERT INTO public.users (id, name, role, customer_id)
  VALUES (NEW.id, user_name, 'customer', new_customer_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();