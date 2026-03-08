-- Delete registered vendor users (users who signed up as vendors)
-- This ONLY deletes vendor accounts with user_id (registered users)
-- Does NOT delete marketplace vendors seeded from migrations

-- Step 1: Show vendors that will be deleted
SELECT 
    v.id,
    v.user_id,
    v.name,
    v.email,
    v.category,
    au.email as auth_email
FROM vendors v
LEFT JOIN auth.users au ON au.id = v.user_id
WHERE v.user_id IS NOT NULL;

-- Step 2: Delete vendor records for registered users
-- (This will also cascade delete from auth.users if needed)
DELETE FROM vendors
WHERE user_id IS NOT NULL;

-- Step 3: Delete the auth users (if you want to completely remove the accounts)
-- CAUTION: This will permanently delete the user accounts
-- Uncomment the following line only if you want to delete the user accounts too:
-- DELETE FROM auth.users WHERE id IN (SELECT user_id FROM vendors WHERE user_id IS NOT NULL);

-- Step 4: Verify deletion
SELECT COUNT(*) as remaining_registered_vendors
FROM vendors
WHERE user_id IS NOT NULL;
