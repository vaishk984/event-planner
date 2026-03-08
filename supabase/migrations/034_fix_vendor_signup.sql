-- Fix vendor signup to properly create vendor records
-- This migration updates the handle_new_user() trigger to create vendor records

-- First ensure role column exists
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('planner', 'vendor', 'admin')) DEFAULT 'planner';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
BEGIN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'planner');
    
    -- Create or update user profile with role
    INSERT INTO public.user_profiles (id, role, display_name)
    VALUES (
        NEW.id,
        user_role,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
    )
    ON CONFLICT (id) DO UPDATE
    SET role = user_role,
        display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email);
    
    -- If role is planner, create planner profile if it doesn't exist
    IF user_role = 'planner' THEN
        INSERT INTO public.planner_profiles (id, company_name)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company')
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    -- If role is vendor, create vendor record if it doesn't exist
    IF user_role = 'vendor' THEN
        INSERT INTO public.vendors (
            user_id,
            name,
            email,
            category,
            status,
            is_verified,
            created_at,
            updated_at
        )
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'display_name', 'Vendor'),
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'category_id', 'other'),
            'active',
            FALSE,
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
