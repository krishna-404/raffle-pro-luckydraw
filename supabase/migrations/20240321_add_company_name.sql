-- Add company_name column to event_entries table
ALTER TABLE event_entries ADD COLUMN company_name VARCHAR;

-- Update RLS policies to include new column
DROP POLICY IF EXISTS "Public can create entries for active events" ON event_entries;
CREATE POLICY "Public can create entries for active events"
  ON event_entries FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_entries.event_id 
    AND current_date BETWEEN events.start_date AND events.end_date
  )); 