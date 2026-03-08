import { getVendorById } from '@/lib/services/vendor-service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Star, MapPin, Share2, Heart } from 'lucide-react'
import { IndianRupee } from 'lucide-react'
import { AddToPlanCard } from '@/components/showroom/add-to-plan-card'

export default async function VendorDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const vendor = await getVendorById(id)

    if (!vendor) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <h2 className="text-2xl font-bold mb-4">Vendor not found</h2>
                <Link href="/showroom">
                    <Button>Return to Showroom</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <Link href={`/showroom/browse/${vendor.category}`} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    Back to {vendor.category}
                </Link>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-full">
                        <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                        <Heart className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                <img
                    src={vendor.imageUrl}
                    alt={vendor.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
                                    {vendor.category}
                                </span>
                                <div className="flex items-center gap-1 bg-amber-400/90 text-black px-2 py-1 rounded-full text-xs font-bold">
                                    <Star className="w-3 h-3 fill-black" />
                                    {vendor.rating} ({vendor.reviewCount} reviews)
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">{vendor.name}</h1>
                            <div className="flex items-center gap-2 text-gray-200">
                                <MapPin className="w-4 h-4" />
                                {vendor.city}
                            </div>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="text-gray-300 text-sm">Starting from</p>
                            <div className="flex items-center justify-end text-3xl font-bold">
                                <IndianRupee className="w-6 h-6" />
                                {vendor.startPrice.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column: Details & Services */}
                <div className="md:col-span-2 space-y-8">
                    {/* About */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">About</h2>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            {vendor.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {vendor.features.map((feature) => (
                                <span key={feature} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                                    {feature}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* Services */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Services & Packages</h2>
                        <div className="grid gap-4">
                            {vendor.services.map((service) => (
                                <Card key={service.id} className="p-6 flex items-center justify-between hover:border-indigo-200 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">{service.name}</h3>
                                            {service.isPopular && (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full">
                                                    Popular
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-500 text-sm mt-1">{service.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-xl flex items-center justify-end">
                                            <IndianRupee className="w-4 h-4" />
                                            {service.price.toLocaleString()}
                                        </div>
                                        <span className="text-xs text-gray-400 capitalize">
                                            {service.unit.replace('_', ' ')}
                                        </span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Mock Gallery */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative group cursor-pointer">
                                    <img
                                        src={`${vendor.imageUrl}&sig=${i}`} // Mock different images
                                        alt={`Portfolio ${i}`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Actions (Sanitized for Client View) */}
                <div className="space-y-6">
                    <AddToPlanCard vendor={vendor} />
                </div>
            </div>
        </div>
    )
}
