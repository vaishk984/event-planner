-- Insert default roles if they don't exist
-- Run this in Supabase SQL Editor

INSERT INTO roles (name, description) VALUES
  ('planner', 'Event planner with full access'),
  ('client', 'Client with limited access to their events'),
  ('vendor', 'Vendor with access to assigned tasks')
ON CONFLICT (name) DO NOTHING;
