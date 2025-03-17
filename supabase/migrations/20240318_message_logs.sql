-- Create message_logs table for tracking all messages sent
CREATE TABLE IF NOT EXISTS message_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id VARCHAR NOT NULL,
  recipient_mobile VARCHAR(15) NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  event_entry_id VARCHAR REFERENCES event_entries(id) ON DELETE SET NULL,
  message_variables JSONB NOT NULL,
  status VARCHAR NOT NULL,
  response_data JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index for efficient querying
CREATE INDEX message_logs_recipient_idx ON message_logs(recipient_mobile);
CREATE INDEX message_logs_event_id_idx ON message_logs(event_id);
CREATE INDEX message_logs_event_entry_id_idx ON message_logs(event_entry_id);
CREATE INDEX message_logs_created_at_idx ON message_logs(created_at);
CREATE INDEX message_logs_status_idx ON message_logs(status);

-- Create trigger for updating updated_at
CREATE TRIGGER update_message_logs_updated_at
    BEFORE UPDATE ON message_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admin users can manage all message logs" ON message_logs;

-- Create RLS policies
-- Allow authenticated users to manage all message logs
CREATE POLICY "Admin users can manage all message logs"
  ON message_logs FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Allow inserts from server-side functions
CREATE POLICY "Allow inserts from server-side functions"
  ON message_logs FOR INSERT
  WITH CHECK (true); 