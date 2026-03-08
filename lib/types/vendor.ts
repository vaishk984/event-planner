export type VendorCategory =
    | 'venue'
    | 'catering'
    | 'decor'
    | 'photography'
    | 'entertainment'
    | 'makeup'
    | 'transport'

export interface ServiceItem {
    id: string
    name: string
    description: string
    price: number
    unit: 'per_plate' | 'per_day' | 'fixed' | 'per_hour' | 'per_guest'
    isPopular?: boolean
}

export interface Vendor {
    id: string
    name: string
    category: VendorCategory
    city: string
    rating: number
    reviewCount: number
    startPrice: number
    description: string
    imageUrl: string
    images: string[]
    services: ServiceItem[]
    features: string[]
    contact: {
        phone: string
        email: string
        website?: string
    }
}
