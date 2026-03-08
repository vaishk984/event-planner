-- Migration: Fix Budget Schema to match Application Code
-- Aligning 'budget_items' table with actions/budget.ts and BudgetItem.ts

-- 1. Rename columns to match code expectations
-- allocated_amount -> estimated_amount
-- spent_amount -> actual_amount

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budget_items' AND column_name = 'allocated_amount') THEN
        ALTER TABLE budget_items RENAME COLUMN allocated_amount TO estimated_amount;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budget_items' AND column_name = 'spent_amount') THEN
        ALTER TABLE budget_items RENAME COLUMN spent_amount TO actual_amount;
    END IF;
END $$;

-- 2. Add missing columns required by BudgetItem.ts entity

DO $$
BEGIN
    -- description (if it doesn't exist, we can create it or just use notes? Code uses description)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budget_items' AND column_name = 'description') THEN
        ALTER TABLE budget_items ADD COLUMN description TEXT DEFAULT ' Expense';
    END IF;

    -- paid_amount
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budget_items' AND column_name = 'paid_amount') THEN
        ALTER TABLE budget_items ADD COLUMN paid_amount DECIMAL(15, 2) DEFAULT 0;
    END IF;

    -- vendor_id (referenced in some code, though might be optional)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budget_items' AND column_name = 'vendor_id') THEN
        ALTER TABLE budget_items ADD COLUMN vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL;
    END IF;
    
    -- booking_request_id (referenced in some code)
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budget_items' AND column_name = 'booking_request_id') THEN
        ALTER TABLE budget_items ADD COLUMN booking_request_id UUID REFERENCES booking_requests(id) ON DELETE SET NULL;
    END IF;

END $$;
