-- Fix Events Table Schema
-- Add missing columns that are required but don't exist

-- Add date column (required for event display)
ALTER TABLE events ADD COLUMN IF NOT EXISTS date DATE;

-- Add name column (required for event display)
ALTER TABLE events ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Add client info columns (nice to have)
ALTER TABLE events ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);
ALTER TABLE events ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20);
ALTER TABLE events ADD COLUMN IF NOT EXISTS client_email VARCHAR(255);

-- Add venue columns
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_name VARCHAR(255);
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_address TEXT;

-- Add capacity and budget
ALTER TABLE events ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 100;
ALTER TABLE events ADD COLUMN IF NOT EXISTS budget DECIMAL(12, 2);
ALTER TABLE events ADD COLUMN IF NOT EXISTS budget_min DECIMAL(12, 2);
ALTER TABLE events ADD COLUMN IF NOT EXISTS budget_max DECIMAL(12, 2);

-- Add location
ALTER TABLE events ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_type VARCHAR(50);

-- Add flexibility
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_date_flexible BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add metadata
ALTER TABLE events ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS source VARCHAR(50);
ALTER TABLE events ADD COLUMN IF NOT EXISTS submission_id UUID REFERENCES event_intakes(id);

-- Add timestamps if missing
ALTER TABLE events ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
