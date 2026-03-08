import { supabaseVendorRepository } from "@/lib/repositories/supabase-vendor-repository";
import { Vendor as UiVendor, VendorCategory, ServiceItem } from "@/lib/types/vendor";
import { Vendor as DbVendor } from "@/types/domain";

// Helper to map DB vendor to UI vendor
function mapToUiVendor(dbVendor: DbVendor): UiVendor {
    // Mock services based on category (since we don't fetch packages yet)
    const mockServices: ServiceItem[] = [
        {
            id: `svc-${dbVendor.id}-1`,
            name: 'Standard Package',
            description: 'Basic service package',
            price: dbVendor.basePrice,
            unit: 'per_day',
            isPopular: true
        },
        {
            id: `svc-${dbVendor.id}-2`,
            name: 'Premium Package',
            description: 'All inclusive premium service',
            price: dbVendor.basePrice * 1.5,
            unit: 'per_day'
        }
    ];

    return {
        id: dbVendor.id,
        name: dbVendor.name,
        category: dbVendor.category as VendorCategory,
        city: dbVendor.city,
        rating: dbVendor.rating,
        reviewCount: dbVendor.reviewCount,
        startPrice: dbVendor.basePrice,
        description: dbVendor.description,
        imageUrl: dbVendor.images?.[0] || dbVendor.portfolioUrl || '/placeholder-vendor.jpg',
        images: dbVendor.images || [],
        services: mockServices,
        features: ['Professional', 'Experienced', 'Verified'], // Mock features
        contact: {
            phone: dbVendor.phone,
            email: dbVendor.email,
            website: dbVendor.website
        }
    };
}

export async function getVendorsByCategory(category: VendorCategory): Promise<UiVendor[]> {
    const vendors = await supabaseVendorRepository.findByCategory(category as any);
    return vendors.map(mapToUiVendor);
}

export async function getAllVendors(): Promise<UiVendor[]> {
    const vendors = await supabaseVendorRepository.findMany({});
    return vendors.map(mapToUiVendor);
}

export async function getVendorById(id: string): Promise<UiVendor | undefined> {
    const vendor = await supabaseVendorRepository.findById(id);
    return vendor ? mapToUiVendor(vendor) : undefined;
}

export async function getPopularVendors(): Promise<UiVendor[]> {
    const vendors = await supabaseVendorRepository.findTopRated();
    return vendors.map(mapToUiVendor);
}
