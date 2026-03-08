-- PlannerOS User Profiles and Role System
-- Migration: User profiles extending Supabase auth
-- Created: 2026-02-01

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('planner', 'vendor', 'admin')) DEFAULT 'planner',
    display_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PLANNER PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS planner_profiles (
    id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    company_logo TEXT,
    phone TEXT,
    alternate_phone TEXT,
    city TEXT,
    state TEXT,
    address TEXT,
    experience_years INTEGER DEFAULT 0,
    bio TEXT,
    website TEXT,
    instagram_handle TEXT,
    
    -- Business details
    gst_number TEXT,
    pan_number TEXT,
    
    -- Subscription
    subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'professional', 'business', 'enterprise')),
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    
    -- Stats (denormalized for quick access)
    total_events INTEGER DEFAULT 0,
    active_events INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- VENDOR PROFILES EXTENSION
-- ============================================================================

-- Add verification columns to existing vendors table
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS verification_documents JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- ADMIN PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_profiles (
    id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    department TEXT,
    permissions JSONB DEFAULT '["read"]',
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- User profiles: users can view and update their own profile
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Planner profiles: planners can manage their own profile
CREATE POLICY "Planners can view own profile"
    ON planner_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Planners can update own profile"
    ON planner_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Planners can insert own profile"
    ON planner_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Admin profiles: only admins can view admin profiles
CREATE POLICY "Admins can view admin profiles"
    ON admin_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, role, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'planner'),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
    );
    
    -- If role is planner, create planner profile
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'planner') = 'planner' THEN
        INSERT INTO public.planner_profiles (id, company_name)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company')
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- UPDATE TIMESTAMPS TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planner_profiles_updated_at
    BEFORE UPDATE ON planner_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_profiles_updated_at
    BEFORE UPDATE ON admin_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_planner_profiles_city ON planner_profiles(city);
CREATE INDEX IF NOT EXISTS idx_planner_profiles_subscription ON planner_profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_verified ON vendors(verified);
