'use client'

import { Card } from "@/components/ui/card"
import { Vendor } from "@/lib/types/vendor"
import { Star, MapPin, IndianRupee } from "lucide-react"
import Link from 'next/link'

interface VendorCardProps {
    vendor: Vendor
}

export function VendorCard({ vendor }: VendorCardProps) {
    return (
        <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white">
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={vendor.imageUrl}
                    alt={vendor.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-gray-900">{vendor.rating}</span>
                    <span className="text-[10px] text-gray-500">({vendor.reviewCount})</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
                <div>
                    <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                        {vendor.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        {vendor.city}
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {vendor.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {vendor.features.slice(0, 3).map((feature) => (
                            <span key={feature} className="px-2 py-1 bg-gray-100 rounded text-[10px] font-medium text-gray-600">
                                {feature}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Starts from</span>
                        <div className="flex items-center font-bold text-gray-900">
                            <IndianRupee className="w-3 h-3" />
                            {vendor.startPrice.toLocaleString()}
                        </div>
                    </div>
                    <Link href={`/showroom/vendor/${vendor.id}`}>
                        <button className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors">
                            View Details
                        </button>
                    </Link>
                </div>
            </div>
        </Card>
    )
}
