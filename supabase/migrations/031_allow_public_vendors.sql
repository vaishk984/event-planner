-- Migration: Allow public read access to active vendors
-- Description: Required for the Showroom to display vendors without user login.

-- Policy: Anyone can view active vendors
-- Note: 'active' status is confirmed by 016_vendor_crm_updates.sql
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vendors' AND policyname = 'Anyone can view active vendors') THEN
        CREATE POLICY "Anyone can view active vendors"
            ON vendors FOR SELECT
            USING (status = 'active');
    END IF;
END $$;
