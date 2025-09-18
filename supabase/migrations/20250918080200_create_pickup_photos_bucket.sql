-- Create the storage bucket for pickup photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('pickup-photos', 'pickup-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS is typically enabled by default on storage.objects.
-- If not, it should be enabled in the Supabase dashboard under Storage -> Policies.
-- The following command is commented out as it may cause permission issues.
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors on re-run
DROP POLICY IF EXISTS "Courier can upload their own pickup photos" ON storage.objects;
DROP POLICY IF EXISTS "Courier can view their own pickup photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can access all pickup photos" ON storage.objects;


-- Create policy for courier uploads (INSERT)
CREATE POLICY "Courier can upload their own pickup photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pickup-photos'
  AND owner = auth.uid()
);

-- Create policy for courier reads (SELECT)
CREATE POLICY "Courier can view their own pickup photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'pickup-photos'
  AND owner = auth.uid()
);

-- The admin policy has been removed to prevent errors due to the missing get_my_claim function.
-- You can add a similar policy later based on your specific user role management setup.