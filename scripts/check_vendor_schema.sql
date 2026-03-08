-- Check actual vendors table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'vendors'
ORDER BY ordinal_position;

-- Check if vendor exists (using correct column names)
SELECT 
    au.id as user_id,
    au.email,
    v.id as vendor_id,
    v.company_name,
    v.category
FROM auth.users au
LEFT JOIN vendors v ON v.user_id = au.id
WHERE au.email = 'vendor@test.com';
