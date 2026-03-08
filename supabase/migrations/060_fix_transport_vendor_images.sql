-- Fix transport vendor images from 050_seed_more_vendors.sql
-- They all used the same broken image URL

UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1494976388531-d1058494ceb8?w=800' WHERE company_name = 'Royal Rides India' AND category = 'transport';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800' WHERE company_name = 'Limousine Luxe' AND category = 'transport';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=800' WHERE company_name = 'Heritage Horse Carriage' AND category = 'transport';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800' WHERE company_name = 'Fleet Masters' AND category = 'transport';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800' WHERE company_name = 'Chopper Weddings' AND category = 'transport';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800' WHERE company_name = 'Eco Green Cabs' AND category = 'transport';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800' WHERE company_name = 'Boat & Beyond' AND category = 'transport';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800' WHERE company_name = 'Vintage Garage' AND category = 'transport';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800' WHERE company_name = 'Elephant Cavalry' AND category = 'transport';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800' WHERE company_name = 'Swift Shuttle Service' AND category = 'transport';
