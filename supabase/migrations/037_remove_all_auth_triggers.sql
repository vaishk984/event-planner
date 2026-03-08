-- Drop ALL triggers that might be interfering with auth signup

-- Drop any triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop any triggers on user_profiles  
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_planner_profiles_updated_at ON planner_profiles;
DROP TRIGGER IF EXISTS update_admin_profiles_updated_at ON admin_profiles;

-- Drop the functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Recreate just the update timestamp trigger (safe one)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only add back timestamp updates (these are safe)
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
