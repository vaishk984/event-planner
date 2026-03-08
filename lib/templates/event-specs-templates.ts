// Event-type specific specification templates
// Each event type has relevant categories with sensible defaults

import {
    Building2, UtensilsCrossed, Camera, Sparkles, Music, Brush, Car,
    Users, Gift, Shield, Hotel, FileText, Heart, Wine, Armchair,
    Presentation, Mic, Cake, Gamepad2, Baby, PartyPopper, Palette,
    Trophy, Lightbulb, Tent, Utensils
} from 'lucide-react'

export interface SpecItem {
    id: string
    name: string
    quantity: number
    unit: string
    unitPrice?: number
    notes?: string
}

export interface CategorySpec {
    id: string
    name: string
    icon: any
    color: string
    vendor: string
    items: SpecItem[]
}

export interface EventTypeTemplate {
    type: string
    label: string
    categories: CategorySpec[]
}

// ===== WEDDING TEMPLATE =====
const WEDDING_SPECS: CategorySpec[] = [
    {
        id: 'venue',
        name: 'Venue',
        icon: Building2,
        color: 'blue',
        vendor: 'To be selected',
        items: [
            { id: 'v1', name: 'Main Hall Booking', quantity: 1, unit: 'day', unitPrice: 500000 },
            { id: 'v2', name: 'Garden/Lawn Area', quantity: 1, unit: 'day', unitPrice: 200000 },
            { id: 'v3', name: 'Bridal Suite', quantity: 1, unit: 'room', unitPrice: 50000 },
            { id: 'v4', name: 'Parking Slots', quantity: 100, unit: 'cars', unitPrice: 500 },
            { id: 'v5', name: 'Generator Backup', quantity: 2, unit: 'units', notes: 'Included' },
        ]
    },
    {
        id: 'catering',
        name: 'Catering',
        icon: UtensilsCrossed,
        color: 'amber',
        vendor: 'To be selected',
        items: [
            { id: 'c1', name: 'Guest Plates (Veg)', quantity: 250, unit: 'plates', unitPrice: 850 },
            { id: 'c2', name: 'Guest Plates (Non-Veg)', quantity: 100, unit: 'plates', unitPrice: 1100 },
            { id: 'c3', name: 'Live Counters', quantity: 3, unit: 'counters', unitPrice: 15000 },
            { id: 'c4', name: 'Servers', quantity: 25, unit: 'staff', unitPrice: 1500 },
            { id: 'c5', name: 'Welcome Drinks', quantity: 2, unit: 'stations', unitPrice: 10000 },
        ]
    },
    {
        id: 'bar',
        name: 'Bar & Beverages',
        icon: Wine,
        color: 'purple',
        vendor: 'To be selected',
        items: [
            { id: 'b1', name: 'Bartenders', quantity: 4, unit: 'staff', unitPrice: 3000 },
            { id: 'b2', name: 'Bar Setup', quantity: 2, unit: 'counters', unitPrice: 15000 },
            { id: 'b3', name: 'Premium Spirits', quantity: 10, unit: 'bottles', unitPrice: 5000 },
        ]
    },
    {
        id: 'decor',
        name: 'Decor & Flowers',
        icon: Sparkles,
        color: 'pink',
        vendor: 'To be selected',
        items: [
            { id: 'd1', name: 'Stage Decoration', quantity: 1, unit: 'setup', unitPrice: 50000 },
            { id: 'd2', name: 'Entrance Decor', quantity: 1, unit: 'setup', unitPrice: 25000 },
            { id: 'd3', name: 'Table Centerpieces', quantity: 25, unit: 'tables', unitPrice: 1500 },
            { id: 'd4', name: 'Floral Arrangements', quantity: 30, unit: 'pieces', unitPrice: 800 },
            { id: 'd5', name: 'Lighting Setup', quantity: 1, unit: 'setup', unitPrice: 40000 },
        ]
    },
    {
        id: 'mandap',
        name: 'Mandap & Rituals',
        icon: Heart,
        color: 'red',
        vendor: 'To be selected',
        items: [
            { id: 'm1', name: 'Mandap Structure', quantity: 1, unit: 'setup', unitPrice: 75000 },
            { id: 'm2', name: 'Pandit Ji', quantity: 1, unit: 'person', unitPrice: 21000 },
            { id: 'm3', name: 'Havan Samagri', quantity: 1, unit: 'kit', unitPrice: 5000 },
            { id: 'm4', name: 'Phera Setup', quantity: 1, unit: 'setup', unitPrice: 15000 },
        ]
    },
    {
        id: 'photography',
        name: 'Photography & Video',
        icon: Camera,
        color: 'slate',
        vendor: 'To be selected',
        items: [
            { id: 'p1', name: 'Lead Photographer', quantity: 1, unit: 'person', unitPrice: 50000 },
            { id: 'p2', name: 'Videographer', quantity: 1, unit: 'person', unitPrice: 40000 },
            { id: 'p3', name: 'Drone Coverage', quantity: 1, unit: 'session', unitPrice: 15000 },
            { id: 'p4', name: 'Photo Album', quantity: 1, unit: 'album', unitPrice: 25000 },
        ]
    },
    {
        id: 'entertainment',
        name: 'Music & Entertainment',
        icon: Music,
        color: 'rose',
        vendor: 'To be selected',
        items: [
            { id: 'e1', name: 'DJ Setup', quantity: 1, unit: 'setup', unitPrice: 30000 },
            { id: 'e2', name: 'Sound System', quantity: 1, unit: 'system', unitPrice: 20000 },
            { id: 'e3', name: 'Dhol Players', quantity: 3, unit: 'persons', unitPrice: 5000 },
        ]
    },
    {
        id: 'makeup',
        name: 'Makeup & Styling',
        icon: Brush,
        color: 'fuchsia',
        vendor: 'To be selected',
        items: [
            { id: 'mk1', name: 'Bridal Makeup', quantity: 1, unit: 'session', unitPrice: 25000 },
            { id: 'mk2', name: 'Groom Makeup', quantity: 1, unit: 'session', unitPrice: 5000 },
            { id: 'mk3', name: 'Family Makeup', quantity: 5, unit: 'persons', unitPrice: 3000 },
        ]
    },
    {
        id: 'transport',
        name: 'Transportation',
        icon: Car,
        color: 'emerald',
        vendor: 'To be selected',
        items: [
            { id: 't1', name: 'Wedding Car', quantity: 1, unit: 'car', unitPrice: 15000 },
            { id: 't2', name: 'Baraat Horse', quantity: 1, unit: 'horse', unitPrice: 20000 },
            { id: 't3', name: 'Guest Buses', quantity: 2, unit: 'buses', unitPrice: 12000 },
        ]
    },
    {
        id: 'staff',
        name: 'Event Staff',
        icon: Shield,
        color: 'gray',
        vendor: 'To be selected',
        items: [
            { id: 's1', name: 'Event Coordinator', quantity: 2, unit: 'persons', unitPrice: 10000 },
            { id: 's2', name: 'Security', quantity: 6, unit: 'persons', unitPrice: 2000 },
            { id: 's3', name: 'Ushers', quantity: 6, unit: 'persons', unitPrice: 1500 },
        ]
    },
]

// ===== CORPORATE EVENT TEMPLATE =====
const CORPORATE_SPECS: CategorySpec[] = [
    {
        id: 'venue',
        name: 'Venue',
        icon: Building2,
        color: 'blue',
        vendor: 'To be selected',
        items: [
            { id: 'v1', name: 'Conference Hall', quantity: 1, unit: 'day', unitPrice: 150000 },
            { id: 'v2', name: 'Breakout Rooms', quantity: 3, unit: 'rooms', unitPrice: 20000 },
            { id: 'v3', name: 'Lobby/Registration Area', quantity: 1, unit: 'area', unitPrice: 30000 },
            { id: 'v4', name: 'Parking Slots', quantity: 50, unit: 'cars', unitPrice: 500 },
        ]
    },
    {
        id: 'av',
        name: 'AV & Technology',
        icon: Presentation,
        color: 'indigo',
        vendor: 'To be selected',
        items: [
            { id: 'av1', name: 'LED Screen', quantity: 1, unit: 'screen', unitPrice: 50000 },
            { id: 'av2', name: 'Projectors', quantity: 2, unit: 'units', unitPrice: 15000 },
            { id: 'av3', name: 'Microphones (Wireless)', quantity: 5, unit: 'units', unitPrice: 3000 },
            { id: 'av4', name: 'Sound System', quantity: 1, unit: 'system', unitPrice: 25000 },
            { id: 'av5', name: 'Laptop/Clicker', quantity: 2, unit: 'sets', unitPrice: 2000 },
            { id: 'av6', name: 'Video Recording', quantity: 1, unit: 'session', unitPrice: 30000 },
            { id: 'av7', name: 'Live Streaming Setup', quantity: 1, unit: 'setup', unitPrice: 25000 },
        ]
    },
    {
        id: 'catering',
        name: 'Catering',
        icon: UtensilsCrossed,
        color: 'amber',
        vendor: 'To be selected',
        items: [
            { id: 'c1', name: 'Breakfast/Tea', quantity: 100, unit: 'pax', unitPrice: 250 },
            { id: 'c2', name: 'Lunch Buffet', quantity: 100, unit: 'pax', unitPrice: 600 },
            { id: 'c3', name: 'High Tea', quantity: 100, unit: 'pax', unitPrice: 200 },
            { id: 'c4', name: 'Water Bottles', quantity: 200, unit: 'bottles', unitPrice: 20 },
            { id: 'c5', name: 'Coffee Station', quantity: 2, unit: 'stations', unitPrice: 8000 },
        ]
    },
    {
        id: 'seating',
        name: 'Seating & Furniture',
        icon: Armchair,
        color: 'orange',
        vendor: 'To be selected',
        items: [
            { id: 'f1', name: 'Conference Chairs', quantity: 100, unit: 'chairs', unitPrice: 100 },
            { id: 'f2', name: 'Tables (Classroom)', quantity: 25, unit: 'tables', unitPrice: 500 },
            { id: 'f3', name: 'Stage/Podium', quantity: 1, unit: 'setup', unitPrice: 20000 },
            { id: 'f4', name: 'Registration Desk', quantity: 2, unit: 'desks', unitPrice: 5000 },
        ]
    },
    {
        id: 'branding',
        name: 'Branding & Signage',
        icon: Palette,
        color: 'cyan',
        vendor: 'To be selected',
        items: [
            { id: 'br1', name: 'Backdrop Banner', quantity: 1, unit: 'banner', unitPrice: 25000 },
            { id: 'br2', name: 'Standees', quantity: 4, unit: 'pieces', unitPrice: 3000 },
            { id: 'br3', name: 'Directional Signs', quantity: 6, unit: 'signs', unitPrice: 1000 },
            { id: 'br4', name: 'Table Tents', quantity: 25, unit: 'pieces', unitPrice: 100 },
            { id: 'br5', name: 'Name Badges', quantity: 100, unit: 'badges', unitPrice: 50 },
        ]
    },
    {
        id: 'kits',
        name: 'Delegate Kits',
        icon: Gift,
        color: 'purple',
        vendor: 'To be selected',
        items: [
            { id: 'k1', name: 'Folder/Bag', quantity: 100, unit: 'pieces', unitPrice: 150 },
            { id: 'k2', name: 'Notepad', quantity: 100, unit: 'pieces', unitPrice: 50 },
            { id: 'k3', name: 'Pen (Branded)', quantity: 100, unit: 'pieces', unitPrice: 30 },
            { id: 'k4', name: 'Agenda Printout', quantity: 100, unit: 'copies', unitPrice: 20 },
        ]
    },
    {
        id: 'photography',
        name: 'Photography',
        icon: Camera,
        color: 'slate',
        vendor: 'To be selected',
        items: [
            { id: 'p1', name: 'Event Photographer', quantity: 1, unit: 'person', unitPrice: 25000 },
            { id: 'p2', name: 'Photo Booth', quantity: 1, unit: 'booth', unitPrice: 15000 },
        ]
    },
    {
        id: 'staff',
        name: 'Event Staff',
        icon: Users,
        color: 'gray',
        vendor: 'To be selected',
        items: [
            { id: 's1', name: 'Event Manager', quantity: 1, unit: 'person', unitPrice: 15000 },
            { id: 's2', name: 'Registration Staff', quantity: 3, unit: 'persons', unitPrice: 3000 },
            { id: 's3', name: 'AV Technician', quantity: 2, unit: 'persons', unitPrice: 5000 },
            { id: 's4', name: 'Hostesses', quantity: 4, unit: 'persons', unitPrice: 3000 },
        ]
    },
]

// ===== BIRTHDAY PARTY TEMPLATE =====
const BIRTHDAY_SPECS: CategorySpec[] = [
    {
        id: 'venue',
        name: 'Venue',
        icon: Building2,
        color: 'blue',
        vendor: 'To be selected',
        items: [
            { id: 'v1', name: 'Party Hall', quantity: 1, unit: 'session', unitPrice: 25000 },
            { id: 'v2', name: 'Outdoor Area (if any)', quantity: 1, unit: 'session', unitPrice: 15000 },
        ]
    },
    {
        id: 'catering',
        name: 'Food & Beverages',
        icon: UtensilsCrossed,
        color: 'amber',
        vendor: 'To be selected',
        items: [
            { id: 'c1', name: 'Snacks/Starters', quantity: 50, unit: 'pax', unitPrice: 200 },
            { id: 'c2', name: 'Main Course', quantity: 50, unit: 'pax', unitPrice: 400 },
            { id: 'c3', name: 'Soft Drinks', quantity: 60, unit: 'bottles', unitPrice: 40 },
            { id: 'c4', name: 'Mocktails', quantity: 50, unit: 'glasses', unitPrice: 100 },
        ]
    },
    {
        id: 'cake',
        name: 'Cake & Desserts',
        icon: Cake,
        color: 'pink',
        vendor: 'To be selected',
        items: [
            { id: 'ck1', name: 'Birthday Cake', quantity: 1, unit: 'cake', unitPrice: 5000, notes: '3 kg' },
            { id: 'ck2', name: 'Cup Cakes', quantity: 50, unit: 'pieces', unitPrice: 80 },
            { id: 'ck3', name: 'Candy Bar', quantity: 1, unit: 'setup', unitPrice: 5000 },
        ]
    },
    {
        id: 'decor',
        name: 'Decor & Theme',
        icon: PartyPopper,
        color: 'purple',
        vendor: 'To be selected',
        items: [
            { id: 'd1', name: 'Theme Decoration', quantity: 1, unit: 'setup', unitPrice: 15000 },
            { id: 'd2', name: 'Balloon Arch', quantity: 1, unit: 'piece', unitPrice: 5000 },
            { id: 'd3', name: 'Photo Backdrop', quantity: 1, unit: 'setup', unitPrice: 8000 },
            { id: 'd4', name: 'Table Decoration', quantity: 5, unit: 'tables', unitPrice: 500 },
            { id: 'd5', name: 'Party Props', quantity: 1, unit: 'set', unitPrice: 2000 },
        ]
    },
    {
        id: 'entertainment',
        name: 'Entertainment',
        icon: Gamepad2,
        color: 'green',
        vendor: 'To be selected',
        items: [
            { id: 'e1', name: 'Anchor/Host', quantity: 1, unit: 'person', unitPrice: 10000 },
            { id: 'e2', name: 'DJ/Music', quantity: 1, unit: 'session', unitPrice: 15000 },
            { id: 'e3', name: 'Games Coordinator', quantity: 1, unit: 'person', unitPrice: 5000 },
            { id: 'e4', name: 'Magic Show', quantity: 1, unit: 'show', unitPrice: 8000 },
            { id: 'e5', name: 'Tattoo Artist', quantity: 1, unit: 'person', unitPrice: 3000 },
            { id: 'e6', name: 'Balloon Artist', quantity: 1, unit: 'person', unitPrice: 3000 },
        ]
    },
    {
        id: 'return',
        name: 'Return Gifts',
        icon: Gift,
        color: 'orange',
        vendor: 'To be selected',
        items: [
            { id: 'r1', name: 'Gift Bags', quantity: 50, unit: 'bags', unitPrice: 100 },
            { id: 'r2', name: 'Chocolates', quantity: 50, unit: 'boxes', unitPrice: 50 },
            { id: 'r3', name: 'Small Toys', quantity: 50, unit: 'pieces', unitPrice: 80 },
        ]
    },
    {
        id: 'photography',
        name: 'Photography',
        icon: Camera,
        color: 'slate',
        vendor: 'To be selected',
        items: [
            { id: 'p1', name: 'Photographer', quantity: 1, unit: 'person', unitPrice: 15000 },
            { id: 'p2', name: 'Photo Booth', quantity: 1, unit: 'booth', unitPrice: 10000 },
        ]
    },
]

// ===== BABY SHOWER / GODH BHARAI TEMPLATE =====
const BABYSHOWER_SPECS: CategorySpec[] = [
    {
        id: 'venue',
        name: 'Venue',
        icon: Building2,
        color: 'blue',
        vendor: 'To be selected',
        items: [
            { id: 'v1', name: 'Banquet Hall', quantity: 1, unit: 'session', unitPrice: 40000 },
        ]
    },
    {
        id: 'catering',
        name: 'Catering',
        icon: UtensilsCrossed,
        color: 'amber',
        vendor: 'To be selected',
        items: [
            { id: 'c1', name: 'Lunch/Dinner Plates', quantity: 60, unit: 'pax', unitPrice: 600 },
            { id: 'c2', name: 'Welcome Drinks', quantity: 60, unit: 'glasses', unitPrice: 80 },
            { id: 'c3', name: 'Desserts', quantity: 60, unit: 'pax', unitPrice: 100 },
        ]
    },
    {
        id: 'decor',
        name: 'Decor & Theme',
        icon: Baby,
        color: 'pink',
        vendor: 'To be selected',
        items: [
            { id: 'd1', name: 'Theme Decoration', quantity: 1, unit: 'setup', unitPrice: 25000 },
            { id: 'd2', name: 'Balloon Arrangement', quantity: 1, unit: 'setup', unitPrice: 8000 },
            { id: 'd3', name: 'Photo Frame Setup', quantity: 1, unit: 'piece', unitPrice: 5000 },
            { id: 'd4', name: 'Floral Arrangements', quantity: 10, unit: 'pieces', unitPrice: 500 },
            { id: 'd5', name: 'Mom-to-be Chair Decor', quantity: 1, unit: 'setup', unitPrice: 5000 },
        ]
    },
    {
        id: 'ceremony',
        name: 'Ceremony Setup',
        icon: Heart,
        color: 'red',
        vendor: 'To be selected',
        items: [
            { id: 'ce1', name: 'Pooja Setup', quantity: 1, unit: 'setup', unitPrice: 8000 },
            { id: 'ce2', name: 'Chunri/Clothes Set', quantity: 1, unit: 'set', unitPrice: 5000 },
            { id: 'ce3', name: 'Bangles Set', quantity: 1, unit: 'set', unitPrice: 2000 },
        ]
    },
    {
        id: 'entertainment',
        name: 'Entertainment',
        icon: Music,
        color: 'purple',
        vendor: 'To be selected',
        items: [
            { id: 'e1', name: 'Mehendi Artist', quantity: 1, unit: 'person', unitPrice: 5000 },
            { id: 'e2', name: 'Games Coordinator', quantity: 1, unit: 'person', unitPrice: 5000 },
            { id: 'e3', name: 'Music/DJ', quantity: 1, unit: 'session', unitPrice: 10000 },
        ]
    },
    {
        id: 'photography',
        name: 'Photography',
        icon: Camera,
        color: 'slate',
        vendor: 'To be selected',
        items: [
            { id: 'p1', name: 'Photographer', quantity: 1, unit: 'person', unitPrice: 15000 },
        ]
    },
    {
        id: 'gifts',
        name: 'Gifts & Favors',
        icon: Gift,
        color: 'orange',
        vendor: 'To be selected',
        items: [
            { id: 'g1', name: 'Return Gifts', quantity: 60, unit: 'pieces', unitPrice: 100 },
        ]
    },
]

// ===== ENGAGEMENT TEMPLATE =====
const ENGAGEMENT_SPECS: CategorySpec[] = [
    {
        id: 'venue',
        name: 'Venue',
        icon: Building2,
        color: 'blue',
        vendor: 'To be selected',
        items: [
            { id: 'v1', name: 'Banquet Hall', quantity: 1, unit: 'session', unitPrice: 80000 },
            { id: 'v2', name: 'Parking', quantity: 50, unit: 'cars', notes: 'Complimentary' },
        ]
    },
    {
        id: 'catering',
        name: 'Catering',
        icon: UtensilsCrossed,
        color: 'amber',
        vendor: 'To be selected',
        items: [
            { id: 'c1', name: 'Guest Plates', quantity: 150, unit: 'pax', unitPrice: 800 },
            { id: 'c2', name: 'Live Counters', quantity: 2, unit: 'counters', unitPrice: 15000 },
            { id: 'c3', name: 'Welcome Drinks', quantity: 1, unit: 'station', unitPrice: 8000 },
        ]
    },
    {
        id: 'decor',
        name: 'Decor',
        icon: Sparkles,
        color: 'pink',
        vendor: 'To be selected',
        items: [
            { id: 'd1', name: 'Stage Decoration', quantity: 1, unit: 'setup', unitPrice: 40000 },
            { id: 'd2', name: 'Ring Ceremony Setup', quantity: 1, unit: 'setup', unitPrice: 15000 },
            { id: 'd3', name: 'Table Centerpieces', quantity: 15, unit: 'tables', unitPrice: 1000 },
            { id: 'd4', name: 'Entrance Decor', quantity: 1, unit: 'setup', unitPrice: 15000 },
        ]
    },
    {
        id: 'photography',
        name: 'Photography',
        icon: Camera,
        color: 'slate',
        vendor: 'To be selected',
        items: [
            { id: 'p1', name: 'Photographer', quantity: 1, unit: 'person', unitPrice: 25000 },
            { id: 'p2', name: 'Videographer', quantity: 1, unit: 'person', unitPrice: 20000 },
        ]
    },
    {
        id: 'entertainment',
        name: 'Entertainment',
        icon: Music,
        color: 'rose',
        vendor: 'To be selected',
        items: [
            { id: 'e1', name: 'DJ/Music', quantity: 1, unit: 'session', unitPrice: 20000 },
            { id: 'e2', name: 'Sound System', quantity: 1, unit: 'system', unitPrice: 15000 },
        ]
    },
    {
        id: 'makeup',
        name: 'Makeup',
        icon: Brush,
        color: 'fuchsia',
        vendor: 'To be selected',
        items: [
            { id: 'mk1', name: 'Bride Makeup', quantity: 1, unit: 'session', unitPrice: 15000 },
            { id: 'mk2', name: 'Groom Makeup', quantity: 1, unit: 'session', unitPrice: 3000 },
        ]
    },
]

// ===== SOCIAL GATHERING TEMPLATE =====
const SOCIAL_SPECS: CategorySpec[] = [
    {
        id: 'venue',
        name: 'Venue',
        icon: Building2,
        color: 'blue',
        vendor: 'To be selected',
        items: [
            { id: 'v1', name: 'Hall/Space Rental', quantity: 1, unit: 'session', unitPrice: 30000 },
        ]
    },
    {
        id: 'catering',
        name: 'Food & Beverages',
        icon: UtensilsCrossed,
        color: 'amber',
        vendor: 'To be selected',
        items: [
            { id: 'c1', name: 'Buffet/Plates', quantity: 50, unit: 'pax', unitPrice: 500 },
            { id: 'c2', name: 'Beverages', quantity: 50, unit: 'pax', unitPrice: 100 },
        ]
    },
    {
        id: 'decor',
        name: 'Basic Decor',
        icon: Sparkles,
        color: 'pink',
        vendor: 'To be selected',
        items: [
            { id: 'd1', name: 'Simple Decoration', quantity: 1, unit: 'setup', unitPrice: 10000 },
            { id: 'd2', name: 'Table Setup', quantity: 5, unit: 'tables', unitPrice: 500 },
        ]
    },
    {
        id: 'entertainment',
        name: 'Entertainment',
        icon: Music,
        color: 'purple',
        vendor: 'To be selected',
        items: [
            { id: 'e1', name: 'Music System', quantity: 1, unit: 'system', unitPrice: 8000 },
        ]
    },
    {
        id: 'photography',
        name: 'Photography',
        icon: Camera,
        color: 'slate',
        vendor: 'To be selected',
        items: [
            { id: 'p1', name: 'Photographer (Optional)', quantity: 1, unit: 'person', unitPrice: 10000 },
        ]
    },
]

// ===== EXPORT ALL TEMPLATES =====
export const EVENT_TYPE_TEMPLATES: Record<string, CategorySpec[]> = {
    wedding: WEDDING_SPECS,
    corporate: CORPORATE_SPECS,
    birthday: BIRTHDAY_SPECS,
    baby_shower: BABYSHOWER_SPECS,
    engagement: ENGAGEMENT_SPECS,
    reception: WEDDING_SPECS, // Similar to wedding
    sangeet: WEDDING_SPECS,   // Similar to wedding
    mehendi: BABYSHOWER_SPECS, // Smaller scale
    anniversary: ENGAGEMENT_SPECS, // Similar scale
    social: SOCIAL_SPECS,
    other: SOCIAL_SPECS,
}

export const getSpecsForEventType = (eventType: string): CategorySpec[] => {
    const type = eventType?.toLowerCase().replace(/[^a-z_]/g, '_') || 'wedding'
    return EVENT_TYPE_TEMPLATES[type] || EVENT_TYPE_TEMPLATES.wedding
}
