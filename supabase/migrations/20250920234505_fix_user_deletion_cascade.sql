-- Function to automatically delete user and customer profiles when an auth.users record is deleted.
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the corresponding user profile from public.users
  DELETE FROM public.users WHERE id = OLD.id;
  
  -- Delete the corresponding customer profile from public.customers
  -- This assumes that the customer ID is the same as the user ID for customer roles.
  DELETE FROM public.customers WHERE id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a user is deleted from auth.users
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();