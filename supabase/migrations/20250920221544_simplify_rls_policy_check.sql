-- Drop the old, problematic policies
DROP POLICY IF EXISTS "Courier can upload pickup photos" ON storage.objects;
DROP POLICY IF EXISTS "Courier can view their own pickup photos" ON storage.objects;

-- Create a new, corrected policy for courier uploads (INSERT)
CREATE POLICY "Allow courier uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pickup-photos' AND
  (get_my_claim('role') ->> 0) = 'kurir'
);

-- Create a new, corrected policy for courier reads (SELECT)
CREATE POLICY "Allow courier to view their own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'pickup-photos' AND
  (get_my_claim('role') ->> 0) = 'kurir' AND
  owner = auth.uid()
);