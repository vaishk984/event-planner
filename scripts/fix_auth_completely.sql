-- COMPREHENSIVE FIX: Remove ALL triggers on auth.users
-- This will allow user creation to work again

-- Step 1: List all triggers on auth.users
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users';

-- Step 2: Drop ALL triggers on auth.users
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_schema = 'auth'
        AND event_object_table = 'users'
    ) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON auth.users CASCADE';
    END LOOP;
END $$;

-- Step 3: Drop the problematic function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 4: Verify triggers are gone
SELECT 
    trigger_name,
    event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users';
