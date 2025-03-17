-- Migration to add public access to QR codes
-- This allows non-authenticated users to view QR codes for validation

-- Drop the policy if it already exists (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view QR codes" ON qr_codes;

-- Add policy to allow public to view QR codes for validation
CREATE POLICY "Public can view QR codes"
  ON qr_codes FOR SELECT
  USING (true);

-- This policy allows any user (authenticated or not) to read QR codes
-- which is necessary for the QR code validation process in the public-facing app 