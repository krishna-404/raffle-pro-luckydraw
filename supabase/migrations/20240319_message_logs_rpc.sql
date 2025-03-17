-- Create RPC function to get message status counts
CREATE OR REPLACE FUNCTION get_message_status_counts()
RETURNS TABLE (
  status TEXT,
  count BIGINT
) 
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    status::TEXT,
    COUNT(*)::BIGINT
  FROM message_logs
  GROUP BY status
  ORDER BY status;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_message_status_counts TO authenticated; 