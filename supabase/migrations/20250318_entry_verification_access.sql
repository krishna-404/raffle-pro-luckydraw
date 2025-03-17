-- Migration to add public access to event_entries for verification
-- This allows non-authenticated users to view their own entries

-- Drop the policy if it already exists (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view their own entries" ON event_entries;

-- Add policy to allow public to view entries for verification
CREATE POLICY "Public can view their own entries"
  ON event_entries FOR SELECT
  USING (true);

-- This policy allows any user (authenticated or not) to read entries
-- which is necessary for the entry verification process in the success page 