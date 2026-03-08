-- Migration: Create Timeline Items table (and dependencies)
-- Description: Stores the run sheet / itinerary for events.
-- Fix: Ensure event_functions exists.

-- 0. Ensure Event Functions Table Exists (Dependency)
CREATE TABLE IF NOT EXISTS event_functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN (
        'mehendi', 'haldi', 'sangeet', 'wedding', 'reception',
        'cocktail', 'after_party', 'brunch', 'ceremony', 'conference', 'dinner', 'custom'
    )),
    date DATE,
    start_time TIME,
    end_time TIME,
    venue_name TEXT,
    venue_address TEXT,
    guest_count INTEGER DEFAULT 0,
    budget DECIMAL(15, 2) DEFAULT 0,
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. Create Timeline Items Table
CREATE TABLE IF NOT EXISTS timeline_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    function_id UUID REFERENCES event_functions(id) ON DELETE CASCADE, -- Optional linkage to a specific function
    
    -- Timing
    start_time TIME NOT NULL,
    end_time TIME,
    duration INTEGER, -- minutes
    
    -- Content
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    
    -- Assignment
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed', 'cancelled')),
    
    -- Sorting
    sort_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_event_functions_event ON event_functions(event_id);
CREATE INDEX IF NOT EXISTS idx_timeline_items_event ON timeline_items(event_id);
CREATE INDEX IF NOT EXISTS idx_timeline_items_function ON timeline_items(function_id);
CREATE INDEX IF NOT EXISTS idx_timeline_items_start_time ON timeline_items(start_time);

-- 3. RLS
ALTER TABLE event_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_items ENABLE ROW LEVEL SECURITY;

-- Policies for Event Functions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_functions' AND policyname = 'Users can manage their event functions') THEN
        CREATE POLICY "Users can manage their event functions"
            ON event_functions FOR ALL
            USING (
                event_id IN (
                    SELECT id FROM events WHERE planner_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Policies for Timeline Items
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'timeline_items' AND policyname = 'Users can manage their timeline items') THEN
        CREATE POLICY "Users can manage their timeline items"
            ON timeline_items FOR ALL
            USING (
                event_id IN (
                    SELECT id FROM events WHERE planner_id = auth.uid()
                )
            );
    END IF;
END $$;

-- 4. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_event_functions_updated_at ON event_functions;
CREATE TRIGGER update_event_functions_updated_at
    BEFORE UPDATE ON event_functions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_timeline_items_updated_at ON timeline_items;
CREATE TRIGGER update_timeline_items_updated_at
    BEFORE UPDATE ON timeline_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
