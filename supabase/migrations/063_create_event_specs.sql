-- Create event_specs table to persist spec data per event
CREATE TABLE IF NOT EXISTS event_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL,
    category_name TEXT NOT NULL,
    category_color TEXT DEFAULT 'blue',
    vendor_name TEXT DEFAULT 'To be selected',
    items JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, category_id)
);

-- RLS
ALTER TABLE event_specs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Planners can manage their event specs" ON event_specs
    FOR ALL USING (
        event_id IN (SELECT id FROM events WHERE planner_id = auth.uid())
    );
