-- Seed transport vendors for the showroom
-- NOTE: 050_seed_more_vendors.sql already has 10 transport vendors.
-- This migration is only needed if 050 was not run.
-- If you already ran 050, you can skip this file.

INSERT INTO vendors (company_name, category, contact_name, email, phone, location, description, rating, start_price, image_url, status, review_count) VALUES
('Boat & Beyond', 'transport', 'Joseph Mathew', 'joseph@boatbeyond.in', '9800700011', 'Hyderabad, Telangana', 'Premium guest transport services including luxury buses, tempo travellers, and airport pickups.', 4.6, 3500, NULL, 'active', 89),
('Royal Rides', 'transport', 'Vikrant Thakur', 'vikrant@royalrides.in', '9800700012', 'Hyderabad, Telangana', 'Decorated wedding cars, vintage vehicles, baraat arrangements with ghodi and band.', 4.8, 8000, NULL, 'active', 134),
('City Shuttle Services', 'transport', 'Neeraj Shah', 'neeraj@cityshuttle.in', '9800700013', 'Hyderabad, Telangana', 'Affordable guest shuttle buses and mini vans for event transport. Airport transfers included.', 4.3, 2500, NULL, 'active', 67),
('Luxury Wheels India', 'transport', 'Karan Singh', 'karan@luxurywheels.in', '9800700014', 'Hyderabad, Telangana', 'Mercedes, BMW, Audi fleet for VIP guest pickups. Chauffeur-driven with red carpet service.', 4.9, 12000, NULL, 'active', 52),
('Green Cabs Events', 'transport', 'Pradeep Kumar', 'pradeep@greencabs.in', '9800700015', 'Hyderabad, Telangana', 'Eco-friendly event transport with electric vehicles and app-based guest tracking.', 4.4, 1800, NULL, 'active', 112),
('Baraat Express', 'transport', 'Ranjit Mehra', 'ranjit@baraatexpress.in', '9800700016', 'Hyderabad, Telangana', 'Specializing in baraat processions — ghodi, buggy, vintage cars, LED chariots, and band.', 4.7, 15000, NULL, 'active', 78)
ON CONFLICT DO NOTHING;
