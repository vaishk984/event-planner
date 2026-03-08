-- Check if vendor was created for the test user
SELECT 
    v.id,
    v.user_id,
    v.name,
    v.email,
    v.category,
    v.status,
    au.email as auth_email
FROM vendors v
JOIN auth.users au ON au.id = v.user_id
WHERE v.email = 'vendor@test.com'
OR au.email = 'vendor@test.com';

-- Check all recent vendors
SELECT 
    v.id,
    v.user_id,
    v.name,
    v.email,
    v.category,
    v.created_at
FROM vendors v
WHERE v.user_id IS NOT NULL
ORDER BY v.created_at DESC
LIMIT 5;

-- Check if the user exists in auth
SELECT 
    id,
    email,
    created_at,
    raw_user_meta_data->>'role' as metadata_role
FROM auth.users
WHERE email = 'vendor@test.com';
