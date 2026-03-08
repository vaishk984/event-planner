-- Create vendor_availability table
CREATE TABLE IF NOT EXISTS vendor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('available', 'busy', 'tentative')),
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(vendor_id, date)
);

-- Enable RLS
ALTER TABLE vendor_availability ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Vendors can view their own availability"
    ON vendor_availability FOR SELECT
    USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can insert their own availability"
    ON vendor_availability FOR INSERT
    WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update their own availability"
    ON vendor_availability FOR UPDATE
    USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can delete their own availability"
    ON vendor_availability FOR DELETE
    USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX idx_vendor_availability_vendor_id ON vendor_availability(vendor_id);
CREATE INDEX idx_vendor_availability_date ON vendor_availability(date);
