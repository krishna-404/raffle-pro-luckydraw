-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  email VARCHAR PRIMARY KEY,
  password VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by_admin VARCHAR NOT NULL REFERENCES admin_users(email),
  name VARCHAR NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_start_date UNIQUE(start_date),
  CONSTRAINT unique_end_date UNIQUE(end_date),
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create QR codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by_admin VARCHAR REFERENCES admin_users(email),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create event entries table
CREATE TABLE IF NOT EXISTS event_entries (
  id VARCHAR PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE SET NULL,
  prize_id UUID REFERENCES prizes(id) ON DELETE SET NULL,
  name VARCHAR NOT NULL,
  email VARCHAR,
  whatsapp_number BIGINT NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR NOT NULL,
  pincode INTEGER NOT NULL,
  request_ip_address VARCHAR NOT NULL,
  request_user_agent TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT valid_pincode CHECK (pincode >= 100000 AND pincode <= 999999)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_qr_codes_expires_at ON qr_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_event_entries_event_id ON event_entries(event_id);
CREATE INDEX IF NOT EXISTS idx_event_entries_qr_code_id ON event_entries(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_prizes_event_id ON prizes(event_id);

-- Create RLS policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin users can view their own data" ON admin_users;
DROP POLICY IF EXISTS "Admin users can manage their own events" ON events;
DROP POLICY IF EXISTS "Public can view active events" ON events;
DROP POLICY IF EXISTS "Admin users can manage prizes for their events" ON prizes;
DROP POLICY IF EXISTS "Public can view prizes for active events" ON prizes;
DROP POLICY IF EXISTS "Admin users can manage their QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Admin users can view entries for their events" ON event_entries;
DROP POLICY IF EXISTS "Public can create entries for active events" ON event_entries;

-- Admin users policies
CREATE POLICY "Admin users can view their own data"
  ON admin_users FOR SELECT
  USING (auth.uid()::text = email);

-- Events policies
CREATE POLICY "Admin users can manage their own events"
  ON events FOR ALL
  USING (auth.uid()::text = created_by_admin);

CREATE POLICY "Public can view active events"
  ON events FOR SELECT
  USING (current_date BETWEEN start_date AND end_date);

-- Prizes policies
CREATE POLICY "Admin users can manage prizes for their events"
  ON prizes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = prizes.event_id 
    AND events.created_by_admin = auth.uid()::text
  ));

CREATE POLICY "Public can view prizes for active events"
  ON prizes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = prizes.event_id 
    AND current_date BETWEEN events.start_date AND events.end_date
  ));

-- QR codes policies
CREATE POLICY "Admin users can manage their QR codes"
  ON qr_codes FOR ALL
  USING (auth.uid()::text = created_by_admin);

-- Event entries policies
CREATE POLICY "Admin users can view entries for their events"
  ON event_entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_entries.event_id 
    AND events.created_by_admin = auth.uid()::text
  ));

CREATE POLICY "Public can create entries for active events"
  ON event_entries FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_entries.event_id 
    AND current_date BETWEEN events.start_date AND events.end_date
  ));

-- Create trigger to sync auth.users with admin_users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_users (email, password)
  VALUES (NEW.email, 'MANAGED_BY_SUPABASE_AUTH')
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 