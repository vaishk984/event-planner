-- Migration: MASTER FIX (Guests + Budget + Vendor Seed + Visibility)
-- Combines fixes for Guest Schema, Budget Schema, Vendor RLS, and Vendor Data into one file.

-- ============================================================================
-- 1. FIX GUESTS TABLE
-- ============================================================================

DO $$ 
BEGIN
    -- category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'category') THEN
        ALTER TABLE guests ADD COLUMN category TEXT DEFAULT 'other';
    END IF;

    -- rsvp_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'rsvp_status') THEN
        ALTER TABLE guests ADD COLUMN rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed', 'declined', 'maybe'));
    END IF;

    -- dietary_preferences
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'dietary_preferences') THEN
        ALTER TABLE guests ADD COLUMN dietary_preferences TEXT;
    END IF;

    -- plus_one
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'plus_one') THEN
        ALTER TABLE guests ADD COLUMN plus_one BOOLEAN DEFAULT FALSE;
    END IF;

    -- plus_one_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'plus_one_name') THEN
        ALTER TABLE guests ADD COLUMN plus_one_name TEXT;
    END IF;

    -- table_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'table_number') THEN
        ALTER TABLE guests ADD COLUMN table_number INTEGER;
    END IF;
    
    -- email
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'email') THEN
        ALTER TABLE guests ADD COLUMN email TEXT;
    END IF;

    -- phone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'phone') THEN
        ALTER TABLE guests ADD COLUMN phone TEXT;
    END IF;

END $$;

-- Enable RLS for guests if not already
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guests' AND policyname = 'Users can manage their guests') THEN
        CREATE POLICY "Users can manage their guests"
            ON guests
            FOR ALL
            USING (
                event_id IN (
                    SELECT id FROM events WHERE planner_id = auth.uid()
                )
            );
    END IF;
END $$;


-- ============================================================================
-- 2. FIX BUDGET ITEMS TABLE
-- ============================================================================

-- Rename columns if they exist with old names
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budget_items' AND column_name = 'allocated_amount') THEN
        ALTER TABLE budget_items RENAME COLUMN allocated_amount TO estimated_amount;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budget_items' AND column_name = 'spent_amount') THEN
        ALTER TABLE budget_items RENAME COLUMN spent_amount TO actual_amount;
    END IF;
END $$;

-- Add usage columns for application code
DO $$
BEGIN
    -- description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budget_items' AND column_name = 'description') THEN
        ALTER TABLE budget_items ADD COLUMN description TEXT DEFAULT 'Expense';
    END IF;

    -- paid_amount
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budget_items' AND column_name = 'paid_amount') THEN
        ALTER TABLE budget_items ADD COLUMN paid_amount DECIMAL(15, 2) DEFAULT 0;
    END IF;

    -- vendor_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budget_items' AND column_name = 'vendor_id') THEN
        ALTER TABLE budget_items ADD COLUMN vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL;
    END IF;
    
    -- booking_request_id
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budget_items' AND column_name = 'booking_request_id') THEN
        ALTER TABLE budget_items ADD COLUMN booking_request_id UUID REFERENCES booking_requests(id) ON DELETE SET NULL;
    END IF;

END $$;

-- ============================================================================
-- 3. FIX VENDOR VISIBILITY (RLS)
-- ============================================================================

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- Ensure vendors are visible to everyone (or at least authenticated users)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vendors' AND policyname = 'Enable read access for all users') THEN
        CREATE POLICY "Enable read access for all users" ON "public"."vendors" FOR SELECT USING (true);
    END IF;
END $$;

-- ============================================================================
-- 4. SEED VENDORS DATA
-- ============================================================================

INSERT INTO vendors (
    company_name, 
    category, 
    contact_name, 
    email, 
    phone, 
    location, 
    description,
    rating
) VALUES 
(
    'Elegant Moments Photography',
    'photography',
    'Rahul Verma',
    'rahul@elegantmoments.com',
    '9876543210',
    'Mumbai, Maharashtra',
    'Specializing in candid wedding photography and cinematic films.',
    4.8
),
(
    'Royal Feast Catering',
    'catering',
    'Sanjeev Kapoor (Manager)',
    'info@royalfeast.com',
    '9876543211',
    'Delhi NCR',
    'Premium authentic North Indian and Mughlai cuisine.',
    4.9
),
(
    'Bloom & Petal Decorators',
    'decor',
    'Priya Singh',
    'priya@bloompetal.com',
    '9876543212',
    'Bangalore, Karnataka',
    'Contemporary floral designs and sustainable decor themes.',
    4.7
),
(
    'Rhythm & Beats JS',
    'entertainment',
    'DJ Amit',
    'amit@rhythmbeats.com',
    '9876543213',
    'Goa',
    'Professional DJ and Sound setup for weddings and parties.',
    4.6
),
(
    'Grand Palace Venue',
    'venue',
    'Manager Desk',
    'bookings@grandpalace.com',
    '9876543214',
    'Udaipur, Rajasthan',
    'Heritage property with lakeside views perfect for royal weddings.',
    5.0
)
ON CONFLICT DO NOTHING;
