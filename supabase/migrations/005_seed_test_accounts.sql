-- Seed Test Accounts for Development
-- Run this in Supabase SQL Editor to create test accounts

-- Note: You need to disable "Confirm email" in Supabase Auth settings first
-- Go to: Authentication → Providers → Email → Toggle OFF "Confirm email"

-- Insert test users into auth.users (using Supabase's auth.users table)
-- These will be created with confirmed emails

-- Test Account 1: Planner
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'planner@test.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Test Account 2: Client
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'client@test.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Test Account 3: Vendor
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  'vendor@test.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Create user profiles for test accounts
INSERT INTO user_profiles (id, role_id) VALUES
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM roles WHERE name = 'planner')),
  ('00000000-0000-0000-0000-000000000002', (SELECT id FROM roles WHERE name = 'client')),
  ('00000000-0000-0000-0000-000000000003', (SELECT id FROM roles WHERE name = 'vendor'))
ON CONFLICT (id) DO NOTHING;
