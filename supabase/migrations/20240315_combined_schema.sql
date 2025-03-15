-- Set timezone to India
SET timezone = 'Asia/Kolkata';

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  email VARCHAR PRIMARY KEY,
  password VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create QR codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by_admin VARCHAR REFERENCES admin_users(email),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT valid_pincode CHECK (pincode >= 100000 AND pincode <= 999999)
);

-- Create registration_attempts table
CREATE TABLE registration_attempts (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  user_agent TEXT,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for efficient querying
CREATE INDEX registration_attempts_ip_created_at_idx ON registration_attempts(ip_address, created_at);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
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
ALTER TABLE registration_attempts ENABLE ROW LEVEL SECURITY;

-- Admin users policies
CREATE POLICY "Anyone can view admin data"
  ON admin_users FOR SELECT
  USING (true);

-- Events policies
CREATE POLICY "Admin users can manage all events"
  ON events FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    JOIN auth.users ON auth.users.email = admin_users.email 
    WHERE auth.users.id = auth.uid()
  ));

CREATE POLICY "Public can view active events"
  ON events FOR SELECT
  USING (current_date BETWEEN start_date AND end_date);

-- Prizes policies
CREATE POLICY "Admin users can manage all prizes"
  ON prizes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    JOIN auth.users ON auth.users.email = admin_users.email 
    WHERE auth.users.id = auth.uid()
  ));

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
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    JOIN auth.users ON auth.users.email = admin_users.email 
    WHERE auth.users.id = auth.uid()
  ));

-- Event entries policies
CREATE POLICY "Admin users can view all entries"
  ON event_entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    JOIN auth.users ON auth.users.email = admin_users.email 
    WHERE auth.users.id = auth.uid()
  ));

CREATE POLICY "Public can create entries for active events"
  ON event_entries FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_entries.event_id 
    AND current_date BETWEEN events.start_date AND events.end_date
  ));

-- Registration attempts policies
CREATE POLICY "Enable insert for registration attempts"
  ON registration_attempts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable select for registration attempts"
  ON registration_attempts FOR SELECT
  USING (true); 