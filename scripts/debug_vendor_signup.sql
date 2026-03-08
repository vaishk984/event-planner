-- Debug: Check what happens during vendor signup
-- Run this after creating a vendor account to see what was created

-- 1. Check auth.users metadata
SELECT 
    id,
    email,
    raw_user_meta_data->>'role' as metadata_role,
    raw_user_meta_data->>'display_name' as metadata_name,
    raw_user_meta_data->>'category_id' as metadata_category,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check user_profiles
SELECT 
    up.id,
    up.role,
    up.role_id,
    up.display_name,
    au.email
FROM user_profiles up
JOIN auth.users au ON au.id = up.id
ORDER BY up.created_at DESC
LIMIT 5;

-- 3. Check vendors table
SELECT 
    v.id,
    v.user_id,
    v.name,
    v.email,
    v.category,
    v.status,
    v.created_at,
    au.email as auth_email
FROM vendors v
LEFT JOIN auth.users au ON au.id = v.user_id
ORDER BY v.created_at DESC
LIMIT 5;

-- 4. Check if trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
