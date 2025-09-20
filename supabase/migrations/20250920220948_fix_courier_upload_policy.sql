-- Function to get a specific claim from the JWT
CREATE OR REPLACE FUNCTION get_my_claim(claim TEXT)
RETURNS JSONB AS $$
  SELECT COALESCE(current_setting('request.jwt.claims', true)::JSONB ->> claim, NULL)::JSONB;
$$ LANGUAGE SQL STABLE;

-- Drop the old, insecure policies
DROP POLICY IF EXISTS "Courier can upload their own pickup photos" ON storage.objects;
DROP POLICY IF EXISTS "Courier can view their own pickup photos" ON storage.objects;

-- Create a new, more secure policy for courier uploads (INSERT)
CREATE POLICY "Courier can upload pickup photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pickup-photos' AND
  get_my_claim('role')::TEXT = '"kurir"'
);

-- Create a new, more secure policy for courier reads (SELECT)
CREATE POLICY "Courier can view their own pickup photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'pickup-photos' AND
  get_my_claim('role')::TEXT = '"kurir"' AND
  owner = auth.uid()
);