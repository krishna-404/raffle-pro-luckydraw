-- Set timezone to India
SET timezone = 'Asia/Kolkata';

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  email VARCHAR PRIMARY KEY,
  password VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by_admin VARCHAR NOT NULL REFERENCES admin_users(email),
  name VARCHAR NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Create prizes table
CREATE TABLE IF NOT EXISTS prizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  seniority_index INTEGER NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create QR codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by_admin VARCHAR REFERENCES admin_users(email),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create event entries table
CREATE TABLE IF NOT EXISTS event_entries (
  id VARCHAR PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE SET NULL,
  prize_id UUID REFERENCES prizes(id) ON DELETE SET NULL,
  name VARCHAR NOT NULL,
  email VARCHAR,
  whatsapp_number VARCHAR(15) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR NOT NULL,
  pincode VARCHAR(6) NOT NULL,
  request_ip_address VARCHAR NOT NULL,
  request_user_agent TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT valid_pincode CHECK (pincode ~ '^[1-9][0-9]{5}$'),
  CONSTRAINT valid_whatsapp CHECK (whatsapp_number ~ '^[6-9][0-9]{9}$')
);

-- Create auth_attempts table for tracking login and registration attempts
CREATE TABLE auth_attempts (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  action_type VARCHAR NOT NULL CHECK (action_type IN ('login', 'registration')),
  success BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create entry_attempts table for tracking QR code and entry submission attempts
CREATE TABLE entry_attempts (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  attempt_type VARCHAR NOT NULL CHECK (attempt_type IN ('qr_validation', 'entry_submission')),
  qr_code_id UUID REFERENCES qr_codes(id),
  success BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for efficient querying
CREATE INDEX events_dates_idx ON events(start_date, end_date);
CREATE INDEX prizes_event_seniority_idx ON prizes(event_id, seniority_index);
CREATE INDEX entry_attempts_ip_created_at_idx ON entry_attempts(ip_address, created_at);
CREATE INDEX entry_attempts_qr_code_idx ON entry_attempts(qr_code_id);
CREATE INDEX auth_attempts_ip_created_at_idx ON auth_attempts(ip_address, created_at);
CREATE INDEX auth_attempts_action_type_idx ON auth_attempts(action_type);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger function for syncing auth users with admin_users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_users (email, password)
  VALUES (NEW.email, 'MANAGED_BY_SUPABASE_AUTH')
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create triggers for each table
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prizes_updated_at
    BEFORE UPDATE ON prizes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_codes_updated_at
    BEFORE UPDATE ON qr_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_entries_updated_at
    BEFORE UPDATE ON event_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_attempts ENABLE ROW LEVEL SECURITY;

-- Admin users policies
CREATE POLICY "Anyone can view admin data"
  ON admin_users FOR SELECT
  USING (true);

-- Events policies
CREATE POLICY "Admin users can manage all events"
  ON events FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public can view active events"
  ON events FOR SELECT
  USING (
    current_date BETWEEN start_date AND end_date
  );

-- Prizes policies
CREATE POLICY "Admin users can manage all prizes"
  ON prizes FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public can view prizes for active events"
  ON prizes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = prizes.event_id 
    AND current_date BETWEEN events.start_date AND events.end_date
  ));

-- QR codes policies
CREATE POLICY "Admin users can manage all QR codes"
  ON qr_codes FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Event entries policies
CREATE POLICY "Admin users can manage all entries"
  ON event_entries FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Public can create entries for active events"
  ON event_entries FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_entries.event_id 
    AND current_date BETWEEN events.start_date AND events.end_date
  ));

-- Auth attempts policies
CREATE POLICY "Enable insert for auth attempts"
  ON auth_attempts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable select for auth attempts"
  ON auth_attempts FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Entry attempts policies
CREATE POLICY "Enable insert for all"
  ON entry_attempts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users"
  ON entry_attempts FOR SELECT
  TO authenticated USING (true);

-- Create event input type
CREATE TYPE public.event_input AS (
  name VARCHAR,
  description TEXT,
  start_date DATE,
  end_date DATE,
  created_by_admin VARCHAR
);

-- Create prize input type
CREATE TYPE public.prize_input AS (
  name VARCHAR,
  description TEXT,
  seniority_index INTEGER,
  image_url TEXT
);

-- Create function to handle event creation with prizes in a transaction
CREATE OR REPLACE FUNCTION create_event_with_prizes(
  event_data event_input,
  prizes_data prize_input[]
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
  v_prize_ids UUID[] := ARRAY[]::UUID[];
  v_prize_id UUID;
  v_prize prize_input;
  v_result JSON;
BEGIN
  -- Start transaction
  BEGIN
    -- Insert event
    INSERT INTO events (
      name,
      description,
      start_date,
      end_date,
      created_by_admin
    )
    VALUES (
      event_data.name,
      event_data.description,
      event_data.start_date,
      event_data.end_date,
      event_data.created_by_admin
    )
    RETURNING id INTO v_event_id;

    -- Insert prizes
    FOREACH v_prize IN ARRAY prizes_data
    LOOP
      INSERT INTO prizes (
        event_id,
        name,
        description,
        seniority_index,
        image_url
      )
      VALUES (
        v_event_id,
        v_prize.name,
        v_prize.description,
        v_prize.seniority_index,
        v_prize.image_url
      )
      RETURNING id INTO v_prize_id;

      v_prize_ids := array_append(v_prize_ids, v_prize_id);
    END LOOP;

    -- Create JSON result
    SELECT json_build_object(
      'event_id', v_event_id,
      'prize_ids', v_prize_ids
    ) INTO v_result;

    RETURN v_result;
  END;
END;
$$;

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
STABLE
AS $$
  WITH grouped_qr AS (
    SELECT 
      qr.created_at,
      qr.created_by_admin,
      qr.expires_at,
      COUNT(*) as total,
      COUNT(DISTINCT e.id) as used,
      COUNT(*) - COUNT(DISTINCT e.id) as unused
    FROM qr_codes qr
    LEFT JOIN event_entries e ON e.qr_code_id = qr.id
    GROUP BY 
      qr.created_at,
      qr.created_by_admin,
      qr.expires_at
  )
  SELECT *
  FROM grouped_qr
  ORDER BY created_at DESC;
$$;

-- Create storage bucket for prize images
INSERT INTO storage.buckets (id, name, public)
VALUES ('prize-images', 'prize-images', true)
ON CONFLICT (id) DO NOTHING;

-- Update storage policies for prize-images bucket
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to manage files" ON storage.objects;

-- Policy for uploading files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'prize-images' AND
  auth.role() = 'authenticated'
);

-- Policy for updating files
CREATE POLICY "Allow authenticated users to update files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'prize-images' AND
  auth.role() = 'authenticated'
);

-- Policy for deleting files
CREATE POLICY "Allow authenticated users to delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'prize-images' AND
  auth.role() = 'authenticated'
);

-- Policy for viewing files
CREATE POLICY "Allow public to view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'prize-images');

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_event_with_prizes TO authenticated;
GRANT EXECUTE ON FUNCTION get_qr_code_stats TO authenticated; 