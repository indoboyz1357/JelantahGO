-- Recreate the function to safely handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- First, delete the corresponding customer profile from public.customers if it exists.
  -- This prevents foreign key violations from public.users.
  DELETE FROM public.customers WHERE id = OLD.id;

  -- Then, delete the user profile from public.users.
  -- This should always succeed if the trigger is fired.
  DELETE FROM public.users WHERE id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger itself does not need to be recreated, as it just calls the updated function.