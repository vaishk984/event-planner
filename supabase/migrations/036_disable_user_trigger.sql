-- Disable the problematic handle_new_user trigger that's causing signup failures
-- This trigger was trying to use columns that don't exist in the current schema

-- Drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Note: User profiles and vendor records will now be created 
-- directly by the application code in signup actions
