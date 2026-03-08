-- Fix existing vendor users who have incorrect role in user_profiles
-- This migration corrects the role for any user who has a vendor record

-- First, add role column if it doesn't exist (for databases using old schema)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('planner', 'vendor', 'admin')) DEFAULT 'planner';

-- Set role based on role_id if role is null (migrate from old schema)
UPDATE user_profiles
SET role = CASE 
    WHEN role_id IN (SELECT id FROM roles WHERE name = 'vendor') THEN 'vendor'
    WHEN role_id IN (SELECT id FROM roles WHERE name = 'planner') THEN 'planner'
    WHEN role_id IN (SELECT id FROM roles WHERE name = 'admin') THEN 'admin'
    ELSE 'planner'
END
WHERE role IS NULL AND role_id IS NOT NULL;

-- Update user_profiles.role to 'vendor' for users who have vendor records
UPDATE user_profiles
SET role = 'vendor'
WHERE id IN (
    SELECT DISTINCT user_id 
    FROM vendors 
    WHERE user_id IS NOT NULL
)
AND (role IS NULL OR role != 'vendor');
