import { getAllVendors, getVendorsByCategory } from "@/lib/services/vendor-service"
import { VendorCategory } from "@/lib/types/vendor"
import { VendorBrowser } from "@/components/showroom/vendor-browser"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function BrowseCategoryPage({
    params,
}: {
    params: Promise<{ category: string }>
}) {
    const { category } = await params
    const vendors = await getVendorsByCategory(category as VendorCategory)

    // Capitalize category for display
    const title = category.charAt(0).toUpperCase() + category.slice(1)

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <Link href="/showroom" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{title} Specialists</h1>
                    <p className="text-gray-500">Curated Selection</p>
                </div>
            </div>

            {/* Interactive Browser */}
            <VendorBrowser initialVendors={vendors} categoryLabel={title} />
        </div>
    )
}
