-- Migration: Add Social Media and Payment Details to Vendors
-- Adds instagram and payment_details columns to vendors table

ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS instagram VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_details JSONB DEFAULT '{}'::jsonb;

-- Add comment to explain payment_details structure
COMMENT ON COLUMN vendors.payment_details IS 'Stores payment information like bank details, UPI ID, etc. Structure: { bankName, accountNumber, ifsc, upiId }';

-- Add index for social media searches if needed later
CREATE INDEX IF NOT EXISTS idx_vendors_instagram ON vendors(instagram);
