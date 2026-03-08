-- Migration: Add More Venue Vendors and Package Selection
-- Adds diversity to venue vendors and creates packages table

-- Add more diverse venue vendors
INSERT INTO vendors (
    company_name, 
    category, 
    contact_name, 
    email, 
    phone, 
    location, 
    description,
    rating,
    start_price,
    image_url,
    portfolio_urls
) VALUES 
(
    'Lakeside Resort & Convention',
    'venue',
    'Anjali Mehta',
    'contact@lakesideresort.com',
    '9876543220',
    'Lonavala, Maharashtra',
    'Modern banquet halls with lake views and outdoor lawns.',
    4.7,
    350000,
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
    '[
        "https://images.unsplash.com/photo-1519167758481-83f29da8c740?w=800",
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
        "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800"
    ]'::jsonb
),
(
    'Heritage Haveli Jaipur',
    'venue',
    'Vikram Singh',
    'bookings@heritagehaveli.com',
    '9876543221',
    'Jaipur, Rajasthan',
    'Traditional Rajasthani architecture with royal ambiance.',
    4.9,
    750000,
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    '[
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
        "https://images.unsplash.com/photo-1604328952995-da5d2e18f82f?w=800"
    ]'::jsonb
),
(
    'Beachside Banquets Goa',
    'venue',
    'Rita D''Souza',
    'events@beachsidebanquets.com',
    '9876543222',
    'Goa',
    'Stunning beach-facing venue perfect for destination weddings.',
    4.8,
    450000,
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    '[
        "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800",
        "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800"
    ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create vendor_packages table for package selection
CREATE TABLE IF NOT EXISTS vendor_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    duration TEXT, -- e.g., "1 Day", "3 Days"
    inclusions TEXT[],
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies for vendor_packages
ALTER TABLE vendor_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vendor_packages_public_read" ON vendor_packages
    FOR SELECT USING (is_active = true);

CREATE POLICY "vendor_packages_authenticated_all" ON vendor_packages
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Seed packages for Grand Palace Venue
INSERT INTO vendor_packages (vendor_id, name, description, price, duration, inclusions, is_popular)
SELECT 
    id,
    'Standard Package',
    'Basic venue rental with essential services',
    500000,
    '1 Day',
    ARRAY['Venue rental for 8 hours', 'Basic lighting', 'Seating for 300 guests', 'Parking space'],
    false
FROM vendors WHERE company_name = 'Grand Palace Venue'
UNION ALL
SELECT 
    id,
    'Premium Package',
    'All-inclusive premium service',
    750000,
    '2 Days',
    ARRAY['Venue rental for 2 days', 'Premium lighting & sound', 'Seating for 500 guests', 'Valet parking', 'Bridal suite access', 'Complimentary decoration'],
    true
FROM vendors WHERE company_name = 'Grand Palace Venue';

-- Seed packages for Lakeside Resort
INSERT INTO vendor_packages (vendor_id, name, description, price, duration, inclusions, is_popular)
SELECT 
    id,
    'Classic Package',
    'Perfect for intimate gatherings',
    350000,
    '1 Day',
    ARRAY['Banquet hall rental', 'Basic AV equipment', 'Seating for 200', 'Complimentary parking'],
    false
FROM vendors WHERE company_name = 'Lakeside Resort & Convention'
UNION ALL
SELECT 
    id,
    'Deluxe Package',
    'Complete experience with outdoor lawn',
    550000,
    '1 Day',
    ARRAY['Indoor + Outdoor venue', 'Premium sound system', 'Seating for 400', 'Lakeside photoshoot area', 'Guest rooms (10)'],
    true
FROM vendors WHERE company_name = 'Lakeside Resort & Convention';
