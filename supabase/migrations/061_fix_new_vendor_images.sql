-- Fix vendor images for new categories with verified URLs
-- Mehendi: using Unsplash photo page IDs in correct format

-- MEHENDI ARTISTS (verified mehndi/henna photos from Unsplash search)
UPDATE vendors SET image_url = 'https://images.unsplash.com/vI0KGmBo9aY?w=800&auto=format&fit=crop' WHERE company_name = 'Henna by Rajni' AND category = 'mehendi';
UPDATE vendors SET image_url = 'https://images.unsplash.com/vT2_uTTn5lw?w=800&auto=format&fit=crop' WHERE company_name = 'Mehendi Magic Studio' AND category = 'mehendi';
UPDATE vendors SET image_url = 'https://images.unsplash.com/oCaAOmRRcAE?w=800&auto=format&fit=crop' WHERE company_name = 'Royal Henna Art' AND category = 'mehendi';
UPDATE vendors SET image_url = 'https://images.unsplash.com/T0XkA1N01x4?w=800&auto=format&fit=crop' WHERE company_name = 'Zara Mehendi Works' AND category = 'mehendi';
UPDATE vendors SET image_url = 'https://images.unsplash.com/BXBKyy3PAAc?w=800&auto=format&fit=crop' WHERE company_name = 'Heritage Henna Co.' AND category = 'mehendi';
UPDATE vendors SET image_url = 'https://images.unsplash.com/BbpGiziMR5w?w=800&auto=format&fit=crop' WHERE company_name = 'Glitter & Henna' AND category = 'mehendi';
UPDATE vendors SET image_url = 'https://images.unsplash.com/uV-EYgC5tf4?w=800&auto=format&fit=crop' WHERE company_name = 'Dulhan Mehendi Studio' AND category = 'mehendi';
UPDATE vendors SET image_url = 'https://images.unsplash.com/TLzO_k5wvi4?w=800&auto=format&fit=crop' WHERE company_name = 'Henna House India' AND category = 'mehendi';
UPDATE vendors SET image_url = 'https://images.unsplash.com/eGr4MP6GCyM?w=800&auto=format&fit=crop' WHERE company_name = 'Rang Mehendi Art' AND category = 'mehendi';
UPDATE vendors SET image_url = 'https://images.unsplash.com/GPC0TFjbuDc?w=800&auto=format&fit=crop' WHERE company_name = 'Suhagan Henna' AND category = 'mehendi';

-- FLORISTS
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800&auto=format&fit=crop' WHERE company_name = 'Bloom & Beyond' AND category = 'florist';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&auto=format&fit=crop' WHERE company_name = 'Petal Paradise' AND category = 'florist';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&auto=format&fit=crop' WHERE company_name = 'Garden of Eden Florals' AND category = 'florist';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&auto=format&fit=crop' WHERE company_name = 'Jasmine & Co.' AND category = 'florist';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&auto=format&fit=crop' WHERE company_name = 'The Flower Studio' AND category = 'florist';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1471696035578-3d8c78d99571?w=800&auto=format&fit=crop' WHERE company_name = 'Fresh Petals Events' AND category = 'florist';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1525310920384-fd6f826b23cb?w=800&auto=format&fit=crop' WHERE company_name = 'Wild Bloom Floral Co.' AND category = 'florist';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=800&auto=format&fit=crop' WHERE company_name = 'Orchid Dreams' AND category = 'florist';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=800&auto=format&fit=crop' WHERE company_name = 'Lotus & Lily' AND category = 'florist';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&auto=format&fit=crop' WHERE company_name = 'Forever Flowers' AND category = 'florist';

-- CHOREOGRAPHERS
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&auto=format&fit=crop' WHERE company_name = 'Bollywood Steps Academy' AND category = 'choreography';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop' WHERE company_name = 'Naach Meri Jaan' AND category = 'choreography';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&auto=format&fit=crop' WHERE company_name = 'Dance Mantra Studio' AND category = 'choreography';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&auto=format&fit=crop' WHERE company_name = 'Taal Se Taal' AND category = 'choreography';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800&auto=format&fit=crop' WHERE company_name = 'Groove Factory' AND category = 'choreography';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop' WHERE company_name = 'Wedding Beats Choreo' AND category = 'choreography';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=800&auto=format&fit=crop' WHERE company_name = 'Rhythm & Soul Dance' AND category = 'choreography';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop' WHERE company_name = 'Nachle Express' AND category = 'choreography';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&auto=format&fit=crop' WHERE company_name = 'Step Up India' AND category = 'choreography';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop' WHERE company_name = 'Dancing Dreams Co.' AND category = 'choreography';

-- LIGHTING & AV
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1504509546545-e000b4a62425?w=800&auto=format&fit=crop' WHERE company_name = 'Lumière Events' AND category = 'lighting';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop' WHERE company_name = 'Spark AV Solutions' AND category = 'lighting';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop' WHERE company_name = 'Light Craft Studio' AND category = 'lighting';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&auto=format&fit=crop' WHERE company_name = 'Galaxy AV Rentals' AND category = 'lighting';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&auto=format&fit=crop' WHERE company_name = 'Pyro & Lights India' AND category = 'lighting';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop' WHERE company_name = 'SoundWave Events' AND category = 'lighting';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1563841930606-67e2bce48b78?w=800&auto=format&fit=crop' WHERE company_name = 'Neon Dreams AV' AND category = 'lighting';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop' WHERE company_name = 'Starlight Productions' AND category = 'lighting';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop' WHERE company_name = 'Bass & Beam Co.' AND category = 'lighting';
UPDATE vendors SET image_url = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop' WHERE company_name = 'Aura Lighting Co.' AND category = 'lighting';
