-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    planner_id UUID REFERENCES auth.users(id),
    invoice_number TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT DEFAULT '',
    client_phone TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    subtotal NUMERIC DEFAULT 0,
    platform_fee NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    paid_amount NUMERIC DEFAULT 0,
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    rate NUMERIC DEFAULT 0,
    amount NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies for invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Planners can manage their invoices" ON invoices
    FOR ALL USING (auth.uid() = planner_id);

-- RLS policies for invoice_items
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage invoice items" ON invoice_items
    FOR ALL USING (
        invoice_id IN (SELECT id FROM invoices WHERE planner_id = auth.uid())
    );

-- Tasks table already exists from migration 014_add_leads_and_tasks.sql
-- Just ensure missing columns exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
