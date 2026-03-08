-- Check if vendor users have correct role in user_profiles
-- Run this to diagnose the issue

-- Check user_profiles for vendor users
SELECT 
    up.id,
    up.role,
    up.display_name,
    au.email,
    v.id as vendor_id,
    v.name as vendor_name,
    v.category
FROM user_profiles up
JOIN auth.users au ON au.id = up.id
LEFT JOIN vendors v ON v.user_id = up.id
WHERE v.id IS NOT NULL OR up.role = 'vendor'
ORDER BY up.created_at DESC;

-- Fix any vendors that have role='planner' but exist in vendors table
UPDATE user_profiles
SET role = 'vendor'
WHERE id IN (
    SELECT DISTINCT user_id 
    FROM vendors 
    WHERE user_id IS NOT NULL
)
AND role != 'vendor';
