/**
 * Seed vendors into Supabase
 * Run: npx tsx scripts/seed-vendors.ts
 * 
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local to bypass RLS
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    console.error('   Add: SUPABASE_SERVICE_ROLE_KEY=your_key_here')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
})

interface VendorInsert {
    company_name: string
    category: string
    contact_name: string
    email: string
    phone: string
    location: string
    description: string
    rating: number
    start_price: number
    image_url: string
    status: string
    review_count: number
}

const vendors: VendorInsert[] = [
    // ========== VENUE (10) ==========
    { company_name: 'Lakeside Palace', category: 'venue', contact_name: 'Arjun Mehta', email: 'bookings@lakesidepalace.com', phone: '9800100001', location: 'Udaipur, Rajasthan', description: 'A majestic lakeside heritage palace perfect for royal destination weddings with panoramic views.', rating: 4.9, start_price: 800000, image_url: 'https://images.unsplash.com/photo-1519167758481-83f29da8c740?w=800', status: 'active', review_count: 124 },
    { company_name: 'The Green Lawn Banquets', category: 'venue', contact_name: 'Suresh Patel', email: 'info@greenlawn.in', phone: '9800100002', location: 'Ahmedabad, Gujarat', description: 'Sprawling open-air banquet with lush gardens, accommodating up to 2000 guests.', rating: 4.7, start_price: 350000, image_url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800', status: 'active', review_count: 89 },
    { company_name: 'Hotel Grandeur', category: 'venue', contact_name: 'Rakesh Sharma', email: 'events@hotelgrandeur.com', phone: '9800100003', location: 'Mumbai, Maharashtra', description: 'Five-star luxury ballroom venue in the heart of South Mumbai with harbor views.', rating: 4.8, start_price: 600000, image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800', status: 'active', review_count: 156 },
    { company_name: 'Royal Orchid Convention Centre', category: 'venue', contact_name: 'Deepa Nair', email: 'deepa@royalorchid.com', phone: '9800100004', location: 'Bangalore, Karnataka', description: 'Elegant convention hall with modern amenities, ideal for grand and intimate weddings.', rating: 4.6, start_price: 400000, image_url: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800', status: 'active', review_count: 72 },
    { company_name: 'Desert Pearl Resort', category: 'venue', contact_name: 'Mahendra Singh', email: 'wedding@desertpearl.com', phone: '9800100005', location: 'Jaisalmer, Rajasthan', description: 'Boutique desert resort offering a stunning backdrop of sand dunes for exotic weddings.', rating: 4.9, start_price: 700000, image_url: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800', status: 'active', review_count: 98 },
    { company_name: 'The Leela Gardens', category: 'venue', contact_name: 'Priti Kapoor', email: 'events@leelagardens.com', phone: '9800100006', location: 'Delhi NCR', description: 'Iconic palace-style venue with Mughal architecture and state-of-the-art facilities.', rating: 4.8, start_price: 900000, image_url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800', status: 'active', review_count: 201 },
    { company_name: 'Seaside Retreat', category: 'venue', contact_name: "Carlos D'Souza", email: 'info@seasideretreat.in', phone: '9800100007', location: 'Goa', description: 'Beachfront wedding venue with tropical gardens and sunset ceremony area.', rating: 4.7, start_price: 550000, image_url: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?w=800', status: 'active', review_count: 67 },
    { company_name: 'Noor Mahal Heritage', category: 'venue', contact_name: 'Farah Khan', email: 'bookings@noormahal.com', phone: '9800100008', location: 'Jaipur, Rajasthan', description: 'Restored 19th-century haveli offering authentic Rajasthani regal ambience.', rating: 4.9, start_price: 750000, image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', status: 'active', review_count: 143 },
    { company_name: 'Hilltop Vineyards Estate', category: 'venue', contact_name: 'Vikram Chauhan', email: 'events@hilltopvineyards.in', phone: '9800100009', location: 'Nashik, Maharashtra', description: 'Wine country wedding amidst rolling vineyards and scenic hillside views.', rating: 4.5, start_price: 450000, image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800', status: 'active', review_count: 53 },
    { company_name: 'Taj Riverside', category: 'venue', contact_name: 'Ananya Iyer', email: 'weddings@tajriverside.com', phone: '9800100010', location: 'Kochi, Kerala', description: 'Luxury riverside property with backwater views and traditional Kerala architecture.', rating: 4.8, start_price: 650000, image_url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800', status: 'active', review_count: 112 },

    // ========== CATERING (10) ==========
    { company_name: 'Saffron & Spice Catering', category: 'catering', contact_name: 'Chef Ramesh Kumar', email: 'ramesh@saffronspice.in', phone: '9800200001', location: 'Delhi NCR', description: 'Multi-cuisine specialists serving authentic North Indian, Mughlai, and continental fare.', rating: 4.9, start_price: 1500, image_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800', status: 'active', review_count: 178 },
    { company_name: 'Coastal Kitchen Co.', category: 'catering', contact_name: 'Anita Shetty', email: 'info@coastalkitchen.com', phone: '9800200002', location: 'Mumbai, Maharashtra', description: 'South Indian and coastal cuisine experts with live counters and seafood specialties.', rating: 4.7, start_price: 1200, image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', status: 'active', review_count: 94 },
    { company_name: 'The Biryani House', category: 'catering', contact_name: 'Irfan Ali', email: 'catering@biryanihouse.in', phone: '9800200003', location: 'Hyderabad, Telangana', description: 'Legendary Hyderabadi biryani and Nawabi cuisine for grand events and intimate gatherings.', rating: 4.8, start_price: 900, image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', status: 'active', review_count: 215 },
    { company_name: 'Green Table Vegans', category: 'catering', contact_name: 'Meera Joshi', email: 'meera@greentable.in', phone: '9800200004', location: 'Pune, Maharashtra', description: 'Plant-based luxury catering with innovative vegan and Jain menu options.', rating: 4.6, start_price: 1100, image_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800', status: 'active', review_count: 62 },
    { company_name: 'Punjab Da Tandoor', category: 'catering', contact_name: 'Sardar Gurpreet Singh', email: 'info@punjabdatandoor.com', phone: '9800200005', location: 'Chandigarh, Punjab', description: 'Authentic Punjabi wedding cuisine with live tandoor, chaat, and dessert stations.', rating: 4.9, start_price: 800, image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', status: 'active', review_count: 186 },
    { company_name: 'East Flavours', category: 'catering', contact_name: 'Rina Bose', email: 'rina@eastflavours.in', phone: '9800200006', location: 'Kolkata, West Bengal', description: 'Bengali, Chinese-Indian, and pan-Asian fusion cuisine for modern celebrations.', rating: 4.5, start_price: 750, image_url: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800', status: 'active', review_count: 48 },
    { company_name: 'Dessert Dreams', category: 'catering', contact_name: 'Sneha Reddy', email: 'sneha@dessertdreams.com', phone: '9800200007', location: 'Bangalore, Karnataka', description: 'Specializing in luxury dessert bars, custom wedding cakes, and sweet stations.', rating: 4.8, start_price: 500, image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800', status: 'active', review_count: 132 },
    { company_name: 'Maharaja Thali', category: 'catering', contact_name: 'Kishan Agarwal', email: 'events@maharajathali.in', phone: '9800200008', location: 'Jaipur, Rajasthan', description: 'Traditional Rajasthani thali service with Dal Baati Churma and elaborate multi-course menus.', rating: 4.7, start_price: 950, image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', status: 'active', review_count: 103 },
    { company_name: 'Global Gourmet', category: 'catering', contact_name: 'Chef Antoine Pierre', email: 'antoine@globalgourmet.in', phone: '9800200009', location: 'Goa', description: 'International fine-dining catering: French, Italian, Japanese, and molecular gastronomy.', rating: 4.6, start_price: 2500, image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800', status: 'active', review_count: 71 },
    { company_name: 'Farm to Feast', category: 'catering', contact_name: 'Lakshmi Narayan', email: 'lakshmi@farmtofeast.com', phone: '9800200010', location: 'Chennai, Tamil Nadu', description: 'Organic farm-to-table catering with Chettinad, Andhra, and Kerala specialties.', rating: 4.8, start_price: 1000, image_url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800', status: 'active', review_count: 87 },

    // ========== DECOR (10) ==========
    { company_name: 'Enchanted Gardens Decor', category: 'decor', contact_name: 'Nisha Malhotra', email: 'nisha@enchantedgardens.in', phone: '9800300001', location: 'Delhi NCR', description: 'Luxury floral installations and themed wedding decor with bespoke design consultation.', rating: 4.9, start_price: 150000, image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', status: 'active', review_count: 167 },
    { company_name: 'Luminaire Events', category: 'decor', contact_name: 'Rajat Gupta', email: 'rajat@luminaire.in', phone: '9800300002', location: 'Mumbai, Maharashtra', description: 'Specialized in LED and ambient lighting design that transforms any venue into a fairy tale.', rating: 4.7, start_price: 80000, image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800', status: 'active', review_count: 91 },
    { company_name: 'Rustic Charm Studio', category: 'decor', contact_name: 'Kavita Sen', email: 'kavita@rusticcharm.in', phone: '9800300003', location: 'Bangalore, Karnataka', description: 'Boho and rustic-themed event decor with sustainable materials and vintage props.', rating: 4.6, start_price: 60000, image_url: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800', status: 'active', review_count: 54 },
    { company_name: 'Mandap Masters', category: 'decor', contact_name: 'Ashok Verma', email: 'ashok@mandapmasters.com', phone: '9800300004', location: 'Jaipur, Rajasthan', description: 'Traditional Indian mandap designs with intricate floral and fabric art.', rating: 4.8, start_price: 120000, image_url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800', status: 'active', review_count: 139 },
    { company_name: 'Crystal Clear Events', category: 'decor', contact_name: 'Simran Kaur', email: 'simran@crystalclear.in', phone: '9800300005', location: 'Chandigarh, Punjab', description: 'Crystal and glass-themed luxury decor for receptions and sangeet nights.', rating: 4.5, start_price: 90000, image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800', status: 'active', review_count: 41 },
    { company_name: 'Tropical Vibes Decor', category: 'decor', contact_name: "Rohan D'Costa", email: 'rohan@tropicalvibes.in', phone: '9800300006', location: 'Goa', description: 'Beach and tropical-themed decor with palm fronds, shells, and oceanic motifs.', rating: 4.7, start_price: 70000, image_url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800', status: 'active', review_count: 78 },
    { company_name: 'Royal Drape Design', category: 'decor', contact_name: 'Meena Shukla', email: 'meena@royaldrape.com', phone: '9800300007', location: 'Lucknow, Uttar Pradesh', description: 'Nawabi-inspired fabric draping, luxurious canopy setups, and regal Mughal themes.', rating: 4.8, start_price: 100000, image_url: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800', status: 'active', review_count: 95 },
    { company_name: 'Petal & Pearl', category: 'decor', contact_name: 'Divya Rao', email: 'divya@petalpearl.in', phone: '9800300008', location: 'Hyderabad, Telangana', description: 'Minimalist modern decor with pastel palettes, pearl accents, and elegant centerpieces.', rating: 4.6, start_price: 55000, image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800', status: 'active', review_count: 63 },
    { company_name: 'Theme Factory', category: 'decor', contact_name: 'Aman Trivedi', email: 'aman@themefactory.in', phone: '9800300009', location: 'Ahmedabad, Gujarat', description: 'Themed event decor from Bollywood to Disney and everything in between.', rating: 4.4, start_price: 45000, image_url: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?w=800', status: 'active', review_count: 37 },
    { company_name: "Nature's Canvas", category: 'decor', contact_name: 'Pooja Deshmukh', email: 'pooja@naturescanvas.com', phone: '9800300010', location: 'Pune, Maharashtra', description: 'Eco-friendly decor using live plants, recycled materials, and zero-waste floral arrangements.', rating: 4.7, start_price: 65000, image_url: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800', status: 'active', review_count: 82 },

    // ========== PHOTOGRAPHY (10) ==========
    { company_name: 'Candid Clicks Studio', category: 'photography', contact_name: 'Arun Nagar', email: 'arun@candidclicks.in', phone: '9800400001', location: 'Mumbai, Maharashtra', description: 'Award-winning candid wedding photographer with a cinematic storytelling approach.', rating: 4.9, start_price: 75000, image_url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800', status: 'active', review_count: 203 },
    { company_name: 'Shutter Lane', category: 'photography', contact_name: 'Tanya Khanna', email: 'tanya@shutterlane.com', phone: '9800400002', location: 'Delhi NCR', description: 'Boutique photography studio specializing in pre-wedding shoots and destination coverage.', rating: 4.8, start_price: 60000, image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800', status: 'active', review_count: 145 },
    { company_name: 'Frame by Frame', category: 'photography', contact_name: 'Varun Iyer', email: 'varun@framebyframe.in', phone: '9800400003', location: 'Bangalore, Karnataka', description: 'Documentary-style wedding photography capturing raw emotions and real moments.', rating: 4.7, start_price: 50000, image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', status: 'active', review_count: 88 },
    { company_name: 'Golden Hour Films', category: 'photography', contact_name: 'Karthik Rajan', email: 'karthik@goldenhourfilms.in', phone: '9800400004', location: 'Chennai, Tamil Nadu', description: 'Cinematic wedding films and drone videography for unforgettable aerial shots.', rating: 4.8, start_price: 90000, image_url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800', status: 'active', review_count: 121 },
    { company_name: 'Pixel Perfect Studio', category: 'photography', contact_name: 'Neha Gupta', email: 'neha@pixelperfect.in', phone: '9800400005', location: 'Kolkata, West Bengal', description: 'Fine-art wedding photography with a blend of traditional and contemporary styles.', rating: 4.6, start_price: 45000, image_url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800', status: 'active', review_count: 67 },
    { company_name: 'Royal Lens', category: 'photography', contact_name: 'Manish Chauhan', email: 'manish@royallens.com', phone: '9800400006', location: 'Jaipur, Rajasthan', description: 'Heritage and palace wedding specialist with extensive experience in Rajasthani venues.', rating: 4.9, start_price: 85000, image_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800', status: 'active', review_count: 176 },
    { company_name: 'Dreamy Captures', category: 'photography', contact_name: 'Sanya Mirza', email: 'sanya@dreamycaptures.in', phone: '9800400007', location: 'Hyderabad, Telangana', description: 'Fairytale wedding photography with ethereal editing and dreamy compositions.', rating: 4.5, start_price: 40000, image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', status: 'active', review_count: 52 },
    { company_name: 'Vow Stories', category: 'photography', contact_name: 'Rishi Saxena', email: 'rishi@vowstories.com', phone: '9800400008', location: 'Pune, Maharashtra', description: 'Storytelling-driven photography duo covering weddings across India and abroad.', rating: 4.7, start_price: 55000, image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800', status: 'active', review_count: 94 },
    { company_name: 'Flashback Films', category: 'photography', contact_name: 'Aarav Menon', email: 'aarav@flashbackfilms.in', phone: '9800400009', location: 'Kochi, Kerala', description: 'Traditional and modern Kerala wedding photography with same-day edit highlight reels.', rating: 4.6, start_price: 48000, image_url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800', status: 'active', review_count: 73 },
    { company_name: 'Vintage Lens Co.', category: 'photography', contact_name: 'Pooja Sharma', email: 'pooja@vintagelens.in', phone: '9800400010', location: 'Goa', description: 'Vintage film-inspired wedding photography for beach and destination celebrations.', rating: 4.8, start_price: 65000, image_url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800', status: 'active', review_count: 108 },

    // ========== ENTERTAINMENT (10) ==========
    { company_name: 'Bollywood Beats DJ', category: 'entertainment', contact_name: 'DJ Rahul', email: 'rahul@bollywoodbeats.in', phone: '9800500001', location: 'Mumbai, Maharashtra', description: 'High-energy Bollywood and commercial DJ with top-of-the-line sound and laser systems.', rating: 4.8, start_price: 50000, image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', status: 'active', review_count: 165 },
    { company_name: 'Sur Sangam Live Band', category: 'entertainment', contact_name: 'Vikram Desai', email: 'vikram@sursangam.in', phone: '9800500002', location: 'Delhi NCR', description: 'Live wedding band performing Bollywood, Sufi, and classical fusion sets.', rating: 4.7, start_price: 75000, image_url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', status: 'active', review_count: 97 },
    { company_name: 'Nritya Dance Company', category: 'entertainment', contact_name: 'Shreya Patel', email: 'shreya@nritya.in', phone: '9800500003', location: 'Ahmedabad, Gujarat', description: 'Professional dance troupe for sangeet choreography, flash mobs, and cultural performances.', rating: 4.9, start_price: 40000, image_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800', status: 'active', review_count: 134 },
    { company_name: 'Comedy Night Stand-Up', category: 'entertainment', contact_name: 'Rohan Joshi', email: 'rohan@comedynight.in', phone: '9800500004', location: 'Bangalore, Karnataka', description: 'Stand-up comedy acts and emcee services to keep your guests laughing all evening.', rating: 4.5, start_price: 30000, image_url: 'https://images.unsplash.com/photo-1516280440614-37f7cb4da717?w=800', status: 'active', review_count: 45 },
    { company_name: 'Punjab Di Dhol', category: 'entertainment', contact_name: 'Harpreet Singh', email: 'harpreet@punjabdidhol.com', phone: '9800500005', location: 'Chandigarh, Punjab', description: 'Traditional Punjabi dhol players and bhangra troupe for baraat and wedding celebrations.', rating: 4.8, start_price: 25000, image_url: 'https://images.unsplash.com/photo-1504509546545-e000b4a62425?w=800', status: 'active', review_count: 187 },
    { company_name: 'Fireworks & Sky Show', category: 'entertainment', contact_name: 'Ajay Rao', email: 'ajay@skyshow.in', phone: '9800500006', location: 'Hyderabad, Telangana', description: 'Professional fireworks, cold pyro, and drone light shows for grand wedding finales.', rating: 4.6, start_price: 80000, image_url: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800', status: 'active', review_count: 58 },
    { company_name: 'Sufi Night Live', category: 'entertainment', contact_name: 'Zara Begum', email: 'zara@sufinightlive.in', phone: '9800500007', location: 'Lucknow, Uttar Pradesh', description: 'Enchanting Sufi music ensemble for mehendi and pre-wedding soirées.', rating: 4.7, start_price: 45000, image_url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', status: 'active', review_count: 82 },
    { company_name: 'Magic Moments', category: 'entertainment', contact_name: 'Sameer Malik', email: 'sameer@magicmoments.in', phone: '9800500008', location: 'Jaipur, Rajasthan', description: 'Close-up magic, illusion acts, and interactive entertainment for cocktail nights.', rating: 4.4, start_price: 20000, image_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800', status: 'active', review_count: 39 },
    { company_name: 'Carnival Zone', category: 'entertainment', contact_name: 'Ankit Bhatia', email: 'ankit@carnivalzone.in', phone: '9800500009', location: 'Pune, Maharashtra', description: 'Photo booths, carnival games, and interactive fun zones for guests of all ages.', rating: 4.6, start_price: 35000, image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', status: 'active', review_count: 64 },
    { company_name: 'Symphony Orchestra India', category: 'entertainment', contact_name: 'Maestro Das', email: 'maestro@symphonyindia.com', phone: '9800500010', location: 'Kolkata, West Bengal', description: 'Classical and fusion orchestra performances for elegant reception dinners.', rating: 4.8, start_price: 100000, image_url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', status: 'active', review_count: 76 },

    // ========== MAKEUP (10) ==========
    { company_name: 'Glamour Box Studio', category: 'makeup', contact_name: 'Priya Arora', email: 'priya@glamourbox.in', phone: '9800600001', location: 'Delhi NCR', description: 'Celebrity makeup artist specializing in bridal HD and airbrush makeup looks.', rating: 4.9, start_price: 35000, image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800', status: 'active', review_count: 198 },
    { company_name: 'Bridal Glow by Neha', category: 'makeup', contact_name: 'Neha Sharma', email: 'neha@bridalglow.in', phone: '9800600002', location: 'Mumbai, Maharashtra', description: 'Natural and dewy bridal makeup with premium international products.', rating: 4.8, start_price: 28000, image_url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800', status: 'active', review_count: 142 },
    { company_name: 'Kohl & Contour', category: 'makeup', contact_name: 'Ritu Kapoor', email: 'ritu@kohlandcontour.com', phone: '9800600003', location: 'Bangalore, Karnataka', description: 'South Indian bridal specialist with expertise in traditional and fusion looks.', rating: 4.7, start_price: 22000, image_url: 'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=800', status: 'active', review_count: 89 },
    { company_name: 'The Makeup Diary', category: 'makeup', contact_name: 'Aisha Khan', email: 'aisha@makeupdiary.in', phone: '9800600004', location: 'Hyderabad, Telangana', description: 'Nikah and reception makeup specialist with expertise in Arabic and Indian bridal styles.', rating: 4.6, start_price: 18000, image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800', status: 'active', review_count: 67 },
    { company_name: 'Blush & Bronze Academy', category: 'makeup', contact_name: 'Tanvi Desai', email: 'tanvi@blushbronze.in', phone: '9800600005', location: 'Pune, Maharashtra', description: 'Boho, minimalist, and editorial bridal makeup for the modern Indian bride.', rating: 4.5, start_price: 15000, image_url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800', status: 'active', review_count: 54 },
    { company_name: 'Regal Beauty Lounge', category: 'makeup', contact_name: 'Deepika Jain', email: 'deepika@regalbeauty.in', phone: '9800600006', location: 'Jaipur, Rajasthan', description: 'Rajasthani bridal specialist with heirloom jewelry styling and traditional look expertise.', rating: 4.8, start_price: 25000, image_url: 'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=800', status: 'active', review_count: 115 },
    { company_name: 'Hair Affair Studio', category: 'makeup', contact_name: "Simone D'Costa", email: 'simone@hairaffair.in', phone: '9800600007', location: 'Goa', description: 'Beach bride and destination wedding specialist for hair and makeup.', rating: 4.7, start_price: 20000, image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800', status: 'active', review_count: 78 },
    { company_name: 'Lakme Bridal Services', category: 'makeup', contact_name: 'Vandana Gupta', email: 'vandana@lakmebridalservices.in', phone: '9800600008', location: 'Chennai, Tamil Nadu', description: 'Professional bridal team offering group packages for bride, bridesmaids, and family.', rating: 4.6, start_price: 30000, image_url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800', status: 'active', review_count: 93 },
    { company_name: 'Mehndi & Makeup Studio', category: 'makeup', contact_name: 'Zakiya Ansari', email: 'zakiya@mehndiandmakeup.in', phone: '9800600009', location: 'Lucknow, Uttar Pradesh', description: 'Combined mehndi artistry and bridal makeup packages for complete wedding prep.', rating: 4.4, start_price: 12000, image_url: 'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=800', status: 'active', review_count: 41 },
    { company_name: 'Veil & Vanity', category: 'makeup', contact_name: 'Natasha Roy', email: 'natasha@veilandvanity.com', phone: '9800600010', location: 'Kolkata, West Bengal', description: 'Bengali bridal specialist with signature gold and red traditional looks.', rating: 4.8, start_price: 23000, image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800', status: 'active', review_count: 128 },

    // ========== TRANSPORT (10) ==========
    { company_name: 'Royal Rides India', category: 'transport', contact_name: 'Vikrant Thakur', email: 'vikrant@royalrides.in', phone: '9800700001', location: 'Delhi NCR', description: 'Vintage cars, luxury sedans, and decorated baraat carriages for grand wedding arrivals.', rating: 4.8, start_price: 25000, image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=800', status: 'active', review_count: 134 },
    { company_name: 'Limousine Luxe', category: 'transport', contact_name: 'Arjun Reddy', email: 'arjun@limousineluxe.com', phone: '9800700002', location: 'Mumbai, Maharashtra', description: 'Stretch limousines, Rolls Royce, and Mercedes fleet for premium wedding transport.', rating: 4.9, start_price: 40000, image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=800', status: 'active', review_count: 87 },
    { company_name: 'Heritage Horse Carriage', category: 'transport', contact_name: 'Ranjit Singh', email: 'ranjit@heritagecarriage.in', phone: '9800700003', location: 'Jaipur, Rajasthan', description: 'Traditional horse carriages and buggy rides for a royal baraat procession.', rating: 4.7, start_price: 15000, image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=800', status: 'active', review_count: 156 },
    { company_name: 'Fleet Masters', category: 'transport', contact_name: 'Sanjay Patel', email: 'sanjay@fleetmasters.in', phone: '9800700004', location: 'Ahmedabad, Gujarat', description: 'Fleet of 50+ luxury buses and Tempo Travellers for large guest group transport.', rating: 4.6, start_price: 8000, image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=800', status: 'active', review_count: 72 },
    { company_name: 'Chopper Weddings', category: 'transport', contact_name: 'Karan Bajaj', email: 'karan@chopperweddings.com', phone: '9800700005', location: 'Bangalore, Karnataka', description: 'Helicopter entry and aerial transfers for the most dramatic wedding arrivals.', rating: 4.9, start_price: 200000, image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=800', status: 'active', review_count: 43 },
    { company_name: 'Eco Green Cabs', category: 'transport', contact_name: 'Pradeep Kumar', email: 'pradeep@ecogreencabs.in', phone: '9800700006', location: 'Chennai, Tamil Nadu', description: 'Electric and hybrid vehicle fleet for eco-conscious wedding transport.', rating: 4.5, start_price: 5000, image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=800', status: 'active', review_count: 38 },
    { company_name: 'Boat & Beyond', category: 'transport', contact_name: 'Joseph Mathew', email: 'joseph@boatbeyond.in', phone: '9800700007', location: 'Kochi, Kerala', description: 'Decorated houseboat and shikara services for unique waterway wedding transport.', rating: 4.7, start_price: 30000, image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=800', status: 'active', review_count: 91 },
    { company_name: 'Vintage Garage', category: 'transport', contact_name: 'Aman Kohli', email: 'aman@vintagegarage.in', phone: '9800700008', location: 'Goa', description: 'Classic 1960s convertible cars and retro vehicles for beach-side wedding vibes.', rating: 4.6, start_price: 18000, image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=800', status: 'active', review_count: 65 },
    { company_name: 'Elephant Cavalry', category: 'transport', contact_name: 'Suraj Mewar', email: 'suraj@elephantcavalry.com', phone: '9800700009', location: 'Udaipur, Rajasthan', description: "Decorated elephants for traditional Rajasthani baraat and groom's entry.", rating: 4.8, start_price: 35000, image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=800', status: 'active', review_count: 112 },
    { company_name: 'Swift Shuttle Service', category: 'transport', contact_name: 'Neeraj Gupta', email: 'neeraj@swiftshuttle.in', phone: '9800700010', location: 'Pune, Maharashtra', description: 'Shuttle bus and minivan services for seamless guest movement between wedding venues.', rating: 4.4, start_price: 3000, image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=800', status: 'active', review_count: 29 },
]

async function seedVendors() {
    console.log('🌱 Seeding vendors...')
    console.log(`Total vendors to seed: ${vendors.length}`)

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const vendor of vendors) {
        // Check if vendor already exists by email
        const { data: existing } = await supabase
            .from('vendors')
            .select('id')
            .eq('email', vendor.email)
            .single()

        if (existing) {
            skipCount++
            continue
        }

        const { error } = await supabase
            .from('vendors')
            .insert(vendor)

        if (error) {
            console.error(`❌ Failed: ${vendor.company_name}: ${error.message}`)
            errorCount++
        } else {
            successCount++
        }
    }

    console.log('')
    console.log('📊 Seeding Results:')
    console.log(`   ✅ Inserted: ${successCount}`)
    console.log(`   ⏭️  Skipped: ${skipCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
}

seedVendors()
