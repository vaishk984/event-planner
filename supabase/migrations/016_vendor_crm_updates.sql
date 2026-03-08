-- Migration: Update Vendors table for CRM capabilities and align with Entity definition
-- Description: Allow vendors to be created by planners (CRM contacts) and add detailed profile fields.

-- 1. Make user_id nullable (for offline/private vendors)
ALTER TABLE vendors ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add CRM & Profile fields
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS planner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Contact Details
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS contact_name VARCHAR(200);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS website VARCHAR(255);

-- Profile Details (Aligning with Vendor.ts)
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS start_price DECIMAL(10, 2); -- for price range
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS end_price DECIMAL(10, 2);   -- for price range
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS portfolio_urls JSONB DEFAULT '[]';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 0.00;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_vendors_planner ON vendors(planner_id);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_location ON vendors(location);

-- 4. Status
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
