-- Migration: Update Vendor Prices and Images
-- Adds missing start_price and images data to existing seed vendors

-- Update Grand Palace Venue
UPDATE vendors
SET 
    start_price = 500000,
    image_url = 'https://images.unsplash.com/photo-1519167758481-83f29da8c740?w=800',
    portfolio_urls = '["https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800", "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800"]'::jsonb
WHERE company_name = 'Grand Palace Venue';

-- Update Royal Feast Catering
UPDATE vendors
SET 
    start_price = 1200,
    image_url = 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
    portfolio_urls = '["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"]'::jsonb
WHERE company_name = 'Royal Feast Catering';

-- Update Bloom & Petal Decorators
UPDATE vendors
SET 
    start_price = 75000,
    image_url = 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800',
    portfolio_urls = '["https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800", "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800"]'::jsonb
WHERE company_name = 'Bloom & Petal Decorators';

-- Update Elegant Moments Photography
UPDATE vendors
SET 
    start_price = 50000,
    image_url = 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800',
    portfolio_urls = '["https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800", "https://images.unsplash.com/photo-1519741497674-611481863552?w=800"]'::jsonb
WHERE company_name = 'Elegant Moments Photography';

-- Update Rhythm & Beats JS
UPDATE vendors
SET 
    start_price = 35000,
    image_url = 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    portfolio_urls = '["https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800", "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800"]'::jsonb
WHERE company_name = 'Rhythm & Beats JS';

