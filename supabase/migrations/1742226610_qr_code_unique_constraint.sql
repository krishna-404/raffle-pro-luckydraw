-- Migration to add a unique constraint to event_entries table for qr_code_id
-- This prevents multiple entries from using the same QR code

-- Add a unique constraint to the qr_code_id column in event_entries table
-- We'll create a partial index instead of using WHERE clause in the constraint
ALTER TABLE event_entries 
  ADD CONSTRAINT event_entries_qr_code_id_unique 
  UNIQUE (qr_code_id);

-- Add a comment explaining the constraint
COMMENT ON CONSTRAINT event_entries_qr_code_id_unique ON event_entries 
  IS 'Ensures each QR code can only be used once for entry submission'; 