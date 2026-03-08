-- Fix: Allow users to create their own profile during signup
-- This policy allows INSERT for the authenticated user's own profile

-- Drop existing user_profiles policies
DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update" ON user_profiles;

-- USER PROFILES: Users can manage their own profile
CREATE POLICY "user_profiles_select" ON user_profiles 
  FOR SELECT 
  USING (id = auth.uid());

CREATE POLICY "user_profiles_insert" ON user_profiles 
  FOR INSERT 
  WITH CHECK (id = auth.uid());

CREATE POLICY "user_profiles_update" ON user_profiles 
  FOR UPDATE 
  USING (id = auth.uid());
