-- Insert initial admin user
-- Note: Replace 'your.email@example.com' and 'your-secure-password' with actual values
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  role
) VALUES (
  'admin@elegance.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  'authenticated'
) ON CONFLICT (email) DO NOTHING; 