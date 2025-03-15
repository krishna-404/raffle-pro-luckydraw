-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_qr_code_stats();

-- Create function to get QR code stats
CREATE OR REPLACE FUNCTION get_qr_code_stats()
RETURNS TABLE (
  created_at TIMESTAMPTZ,
  created_by_admin VARCHAR,
  expires_at TIMESTAMPTZ,
  total BIGINT,
  used BIGINT,
  unused BIGINT
) 
LANGUAGE SQL
SECURITY DEFINER
STABLE  -- Function result is deterministic for same inputs
AS $$
  WITH grouped_qr AS (
    SELECT 
      date_trunc('second', qr.created_at) as created_at,
      qr.created_by_admin,
      qr.expires_at,
      COUNT(*) as total,
      COUNT(DISTINCT e.id) as used,
      COUNT(*) - COUNT(DISTINCT e.id) as unused
    FROM qr_codes qr
    LEFT JOIN event_entries e ON e.qr_code_id = qr.id
    GROUP BY 
      date_trunc('second', qr.created_at),
      qr.created_by_admin,
      qr.expires_at
  )
  SELECT *
  FROM grouped_qr
  ORDER BY created_at DESC;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_qr_code_stats() TO authenticated; 