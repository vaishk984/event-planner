-- Migration: Multi-Event Type Support & Enhanced Schema
-- Created: 2026-02-03
-- Purpose: Support all event types (weddings, corporate, birthdays, etc.)

-- ============================================================================
-- 1. ADD EVENT CATEGORY TO EVENTS TABLE
-- ============================================================================

DO $$
BEGIN
    -- Add event_category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'event_category') THEN
        ALTER TABLE events ADD COLUMN event_category TEXT DEFAULT 'wedding' 
        CHECK (event_category IN (
            'wedding', 'birthday', 'anniversary', 'corporate_conference', 
            'corporate_team_building', 'product_launch', 'college_fest', 
            'school_event', 'exhibition', 'concert', 'reunion', 
            'baby_shower', 'engagement', 'retirement', 'charity', 'sports', 'other'
        ));
    END IF;

    -- Add event_subcategory for more specific classification
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'event_subcategory') THEN
        ALTER TABLE events ADD COLUMN event_subcategory TEXT;
    END IF;

    -- Add theme column (for birthdays, parties)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'theme') THEN
        ALTER TABLE events ADD COLUMN theme TEXT;
    END IF;

    -- Add expected_attendees (more generic than guest_count)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'expected_attendees') THEN
        ALTER TABLE events ADD COLUMN expected_attendees INTEGER;
    END IF;
END $$;

-- ============================================================================
-- 2. CREATE GUESTS TABLE (RSVP & Seating Management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    
    -- Guest Info
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    
    -- RSVP
    rsvp_status TEXT NOT NULL DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed', 'declined', 'maybe')),
    rsvp_date TIMESTAMPTZ,
    plus_one BOOLEAN DEFAULT false,
    plus_one_name TEXT,
    
    -- Preferences
    dietary_preferences TEXT,
    special_requirements TEXT,
    
    -- Categorization
    category TEXT, -- VIP, family, friends, colleagues, bride_side, groom_side
    table_number INTEGER,
    seat_number TEXT,
    
    -- Contact
    address TEXT,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Planners can manage guests for their events
CREATE POLICY "Planners can manage guests"
    ON guests FOR ALL
    USING (
        event_id IN (
            SELECT id FROM events WHERE planner_id = auth.uid()
        )
    );

-- Trigger for updated_at
CREATE TRIGGER update_guests_updated_at
    BEFORE UPDATE ON guests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. CREATE CHECKLISTS TABLE (Event-specific task templates)
-- ============================================================================

CREATE TABLE IF NOT EXISTS checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    
    -- Checklist Item
    title TEXT NOT NULL,
    description TEXT,
    category TEXT, -- venue, catering, decor, logistics, etc.
    
    -- Status
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES auth.users(id),
    
    -- Priority & Timing
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    due_date DATE,
    
    -- Order
    sort_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;

-- Planners can manage checklists for their events
CREATE POLICY "Planners can manage checklists"
    ON checklists FOR ALL
    USING (
        event_id IN (
            SELECT id FROM events WHERE planner_id = auth.uid()
        )
    );

-- Trigger for updated_at
CREATE TRIGGER update_checklists_updated_at
    BEFORE UPDATE ON checklists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. ENHANCE CLIENTS TABLE (Already done in 014, but verify)
-- ============================================================================

DO $$
BEGIN
    -- Ensure clients table has all lead-related fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'event_type') THEN
        ALTER TABLE clients ADD COLUMN event_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'event_date') THEN
        ALTER TABLE clients ADD COLUMN event_date DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'score') THEN
        ALTER TABLE clients ADD COLUMN score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'budget_range') THEN
        ALTER TABLE clients ADD COLUMN budget_range TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'source') THEN
        ALTER TABLE clients ADD COLUMN source TEXT CHECK (source IN ('website', 'referral', 'social_media', 'advertisement', 'walk_in', 'other'));
    END IF;
END $$;

-- ============================================================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_guests_event ON guests(event_id);
CREATE INDEX IF NOT EXISTS idx_guests_rsvp_status ON guests(rsvp_status);
CREATE INDEX IF NOT EXISTS idx_guests_category ON guests(category);

CREATE INDEX IF NOT EXISTS idx_checklists_event ON checklists(event_id);
CREATE INDEX IF NOT EXISTS idx_checklists_completed ON checklists(is_completed);
CREATE INDEX IF NOT EXISTS idx_checklists_due_date ON checklists(due_date);

CREATE INDEX IF NOT EXISTS idx_events_category ON events(event_category);
CREATE INDEX IF NOT EXISTS idx_clients_event_type ON clients(event_type);
CREATE INDEX IF NOT EXISTS idx_clients_score ON clients(score);
