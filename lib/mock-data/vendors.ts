import { Vendor } from "@/lib/types/vendor";

export const MOCK_VENDORS: Vendor[] = [
    // --- VENUES ---
    {
        id: 'v1',
        name: 'The Grand Palace Hotel',
        category: 'venue',
        city: 'Mumbai',
        rating: 4.8,
        reviewCount: 124,
        startPrice: 250000,
        description: 'Luxurious 5-star venue with ballrooms catering to weddings and corporate events. Located in the heart of South Mumbai.',
        imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop', // Placeholder
        images: [],
        features: ['AC Hall', 'Valet Parking', 'In-house Catering', '500+ Capacity'],
        contact: { phone: '+91 98765 00001', email: 'events@grandpalace.com' },
        services: [
            { id: 's1', name: 'Grand Ballroom Rental', description: 'Full day rental for weddings', price: 500000, unit: 'per_day', isPopular: true },
            { id: 's2', name: 'Conference Hall', description: 'Business setup for 100 pax', price: 150000, unit: 'per_day' }
        ]
    },
    {
        id: 'v2',
        name: 'Royal Heritage Lawns',
        category: 'venue',
        city: 'Delhi',
        rating: 4.5,
        reviewCount: 89,
        startPrice: 150000,
        description: 'Spacious open-air lawns perfect for winter weddings and large gatherings.',
        imageUrl: 'https://images.unsplash.com/photo-1587271407850-8d4389188465?q=80&w=800&auto=format&fit=crop',
        images: [],
        features: ['Open Lawn', 'Bridal Room', 'Generator Backup', '1000+ Capacity'],
        contact: { phone: '+91 98765 00002', email: 'book@royallawns.in' },
        services: [
            { id: 's3', name: 'Main Lawn Rental', description: 'Capacity 1000 guests', price: 200000, unit: 'per_day', isPopular: true },
            { id: 's4', name: 'Poolside Area', description: 'For Haldi/Mehendi', price: 75000, unit: 'per_day' }
        ]
    },

    // --- CATERING ---
    {
        id: 'c1',
        name: 'Spice Symphony Caterers',
        category: 'catering',
        city: 'Mumbai',
        rating: 4.9,
        reviewCount: 210,
        startPrice: 850,
        description: 'Premium multi-cuisine catering specializing in authentic North Indian and Live Counters.',
        imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800&auto=format&fit=crop',
        images: [],
        features: ['Live Counters', 'Jain Options', 'Chaats', 'Uniformed Staff'],
        contact: { phone: '+91 98765 00003', email: 'info@spicesymphony.com' },
        services: [
            { id: 's5', name: 'Sangeet Menu (Veg)', description: 'Starters + Main Course + Dessert', price: 850, unit: 'per_plate', isPopular: true },
            { id: 's6', name: 'Wedding Feast (Veg/Non-Veg)', description: 'Premium spread with live counters', price: 1200, unit: 'per_plate' },
            { id: 's7', name: 'High Tea', description: 'Snacks and beverages', price: 450, unit: 'per_plate' }
        ]
    },
    {
        id: 'c2',
        name: 'Delight Foods',
        category: 'catering',
        city: 'Bangalore',
        rating: 4.6,
        reviewCount: 150,
        startPrice: 600,
        description: 'Affordable and hygienic catering services for corporate and small social events.',
        imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop',
        images: [],
        features: ['Box Meals', 'Corporate Menu', 'Healthy Options'],
        contact: { phone: '+91 98765 00004', email: 'hello@delightfoods.in' },
        services: [
            { id: 's8', name: 'Standard Veg Buffet', description: 'Salad, Roti, 2 Sabzi, Dal, Rice, Sweet', price: 600, unit: 'per_plate' },
            { id: 's9', name: 'Premium Lunch Box', description: 'Packed meal for corporate', price: 350, unit: 'per_plate', isPopular: true }
        ]
    },

    // --- DECOR ---
    {
        id: 'd1',
        name: 'Dreamy Vows Decor',
        category: 'decor',
        city: 'Mumbai',
        rating: 4.7,
        reviewCount: 95,
        startPrice: 50000,
        description: 'Specialists in floral arrangements and theme-based wedding decor.',
        imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
        images: [],
        features: ['Floral Mandap', 'Entrance Arch', 'Photo Booths', 'Lighting'],
        contact: { phone: '+91 98765 00005', email: 'design@dreamyvows.com' },
        services: [
            { id: 's10', name: 'Haldi Decor Package', description: 'Marigold theme + Swing', price: 35000, unit: 'fixed' },
            { id: 's11', name: 'Wedding Mandap (Floral)', description: 'Premium fresh flowers', price: 150000, unit: 'fixed', isPopular: true },
            { id: 's12', name: 'Reception Stage', description: 'Backdrop + Sofa + Lights', price: 80000, unit: 'fixed' }
        ]
    },

    // --- PHOTOGRAPHY ---
    {
        id: 'p1',
        name: 'Candid Tales Studio',
        category: 'photography',
        city: 'Pune',
        rating: 4.9,
        reviewCount: 300,
        startPrice: 75000,
        description: 'Award-winning team capturing timeless moments. Experts in candid and cinematic films.',
        imageUrl: 'https://images.unsplash.com/photo-1537905569824-f89f14cceb68?q=80&w=800&auto=format&fit=crop',
        images: [],
        features: ['Candid Photography', 'Cinematic Video', 'Drone', 'Same Day Edit'],
        contact: { phone: '+91 98765 00006', email: 'shoot@candidtales.com' },
        services: [
            { id: 's13', name: 'Traditional Photography', description: 'Standard coverage', price: 40000, unit: 'per_day' },
            { id: 's14', name: 'Wedding Package (Photo + Video)', description: 'Candid + Traditional + Teaser', price: 150000, unit: 'fixed', isPopular: true },
            { id: 's15', name: 'Pre-Wedding Shoot', description: '4 hour session', price: 25000, unit: 'fixed' }
        ]
    },

    // --- ENTERTAINMENT ---
    {
        id: 'e1',
        name: 'DJ Rakesh & Troupe',
        category: 'entertainment',
        city: 'Mumbai',
        rating: 4.5,
        reviewCount: 200,
        startPrice: 25000,
        description: 'High energy Bollywood DJ and Dhol players for Baraat and Sangeet.',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop',
        images: [],
        features: ['Bollywood DJ', 'Punjabi Dhol', 'Sound System', 'LED Floor'],
        contact: { phone: '+91 98765 00007', email: 'bookings@djrakesh.com' },
        services: [
            { id: 's16', name: 'Sangeet DJ Night', description: 'DJ + Sound + Lights', price: 35000, unit: 'fixed', isPopular: true },
            { id: 's17', name: 'Baraat Dhol', description: '4 Dhol Players', price: 15000, unit: 'fixed' }
        ]
    }
];
