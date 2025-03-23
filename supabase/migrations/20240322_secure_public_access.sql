-- Drop existing public access policies
DROP POLICY IF EXISTS "Public can view QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Public can view their own entries" ON event_entries;

-- Create function to securely validate QR code
CREATE OR REPLACE FUNCTION validate_qr_code(qr_code_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_qr_code qr_codes%ROWTYPE;
  v_event events%ROWTYPE;
BEGIN
  -- Check if QR code exists and is not expired
  SELECT * INTO v_qr_code
  FROM qr_codes
  WHERE id = qr_code_id
  AND (expires_at IS NULL OR expires_at > NOW());

  IF v_qr_code.id IS NULL THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Invalid or expired QR code'
    );
  END IF;

  -- Check if QR code is already used
  IF EXISTS (
    SELECT 1 FROM event_entries 
    WHERE qr_code_id = qr_code_id
  ) THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'QR code has already been used'
    );
  END IF;

  -- Get active event
  SELECT * INTO v_event
  FROM events
  WHERE current_date BETWEEN start_date AND end_date
  LIMIT 1;

  IF v_event.id IS NULL THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'No active giveaway found'
    );
  END IF;

  -- Return success with event details
  RETURN json_build_object(
    'valid', true,
    'eventId', v_event.id,
    'eventName', v_event.name
  );
END;
$$;

-- Grant execute permission on validate_qr_code function to public
GRANT EXECUTE ON FUNCTION validate_qr_code TO public; 