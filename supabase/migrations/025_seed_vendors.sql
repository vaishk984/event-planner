-- Migration: Seed Sample Vendors
-- Populates the vendors table with test data

INSERT INTO vendors (
    company_name, 
    category, 
    contact_name, 
    email, 
    phone, 
    location, 
    description,
    rating
) VALUES 
(
    'Elegant Moments Photography',
    'photography',
    'Rahul Verma',
    'rahul@elegantmoments.com',
    '9876543210',
    'Mumbai, Maharashtra',
    'Specializing in candid wedding photography and cinematic films.',
    4.8
),
(
    'Royal Feast Catering',
    'catering',
    'Sanjeev Kapoor (Manager)',
    'info@royalfeast.com',
    '9876543211',
    'Delhi NCR',
    'Premium authentic North Indian and Mughlai cuisine.',
    4.9
),
(
    'Bloom & Petal Decorators',
    'decor',
    'Priya Singh',
    'priya@bloompetal.com',
    '9876543212',
    'Bangalore, Karnataka',
    'Contemporary floral designs and sustainable decor themes.',
    4.7
),
(
    'Rhythm & Beats JS',
    'entertainment',
    'DJ Amit',
    'amit@rhythmbeats.com',
    '9876543213',
    'Goa',
    'Professional DJ and Sound setup for weddings and parties.',
    4.6
),
(
    'Grand Palace Venue',
    'venue',
    'Manager Desk',
    'bookings@grandpalace.com',
    '9876543214',
    'Udaipur, Rajasthan',
    'Heritage property with lakeside views perfect for royal weddings.',
    5.0
)
ON CONFLICT DO NOTHING;
