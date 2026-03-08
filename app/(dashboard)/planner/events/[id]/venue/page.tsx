import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Camera, Upload, Home, Building2, Users, Car, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { getEvent } from '@/lib/actions/event-actions'
import { getEventVendors } from '@/lib/actions/event-vendor-actions'
import { notFound } from 'next/navigation'

export default async function VenuePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    // 1. Fetch Event & Vendors
    const event = await getEvent(id)
    if (!event) notFound()

    const eventVendors = await getEventVendors(id)
    const selectedVenue = eventVendors.find(v => v.category === 'venue')

    // 2. Determine State
    const hasPersonalVenue = event.venueType === 'personal'

    // 3. Fallback for Personal Venue Data (from Event)
    const personalVenue = hasPersonalVenue ? {
        name: event.venueName || 'Personal Venue',
        address: event.venueAddress || event.city,
        capacity: event.guestCount || 0,
        type: 'personal', // could be mapped if we had specific type
        parking: true, // assumption or need new field
        photos: [], // need new field or separate table for photos
    } : null

    return (
        <div className="space-y-6">
            {/* Status Banner */}
            {hasPersonalVenue ? (
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <Home className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-green-800">Client has their own venue</h3>
                            <p className="text-sm text-green-600">No venue booking needed from showroom</p>
                        </div>
                        <Badge className="bg-green-200 text-green-800">✓ Personal Venue</Badge>
                    </CardContent>
                </Card>
            ) : selectedVenue ? (
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-blue-800">Venue Selected</h3>
                            <p className="text-sm text-blue-600">Booking confirmation pending</p>
                        </div>
                        <Badge className="bg-blue-200 text-blue-800">Confirmed</Badge>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-amber-800">No venue selected</h3>
                            <p className="text-sm text-amber-600">Browse showroom to find the perfect venue</p>
                        </div>
                        <Link href="/showroom/browse/venue">
                            <Button className="bg-amber-500 hover:bg-amber-600">Browse Venues</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Personal Venue Details */}
            {hasPersonalVenue && personalVenue && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Home className="w-5 h-5 text-orange-500" /> Personal Venue Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <span className="text-sm text-gray-500">Venue Name</span>
                                    <p className="font-medium text-lg">{personalVenue.name}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Address</span>
                                    <p className="font-medium">{personalVenue.address}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500">Capacity</p>
                                            <p className="font-medium">{personalVenue.capacity}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                        <Car className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500">Parking</p>
                                            <p className="font-medium">{personalVenue.parking ? 'Available' : 'Limited'}</p>
                                        </div>
                                    </div>
                                </div>
                                <Badge variant="outline" className="capitalize">{personalVenue.type}</Badge>
                            </div>

                            {/* Photos Grid - Placeholder for now as we don't have this data in Event yet */}
                            <div>
                                <span className="text-sm text-gray-500 block mb-2">Venue Photos</span>
                                <div className="grid grid-cols-2 gap-2">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Camera className="w-8 h-8 text-gray-300" />
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" className="w-full mt-3 gap-2">
                                    <Upload className="w-4 h-4" /> Upload More Photos
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Selected Venue Details (Showroom) — hidden when client has own venue */}
            {!hasPersonalVenue && selectedVenue && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-500" /> Selected Venue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <span className="text-sm text-gray-500">Venue Name</span>
                                <p className="font-medium text-lg">{selectedVenue.vendorName || 'Unknown Venue'}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Status</span>
                                <Badge className="capitalize ml-2">{selectedVenue.status}</Badge>
                            </div>
                            {/* We can expand this with more vendor details if we fetch them */}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Venue Recommendations (if needs venue) */}
            {!hasPersonalVenue && !selectedVenue && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Recommended Venues</CardTitle>
                            <Link href="/showroom/browse/venue">
                                <Button variant="outline" size="sm">View All</Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-gray-500">
                            <p>Visit the showroom to explore and add venues to your plan.</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Venue Checklist */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" /> Venue Checklist
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[
                            { task: 'Venue confirmed', done: !!selectedVenue || hasPersonalVenue },
                            { task: 'Site visit completed', done: false },
                            { task: 'Floor plan received', done: false },
                            { task: 'Catering restrictions noted', done: true },
                            { task: 'Decor access arranged', done: false },
                            { task: 'Sound/DJ permissions', done: false },
                        ].map((item, i) => (
                            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${item.done ? 'bg-green-50' : 'bg-gray-50'}`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? 'bg-green-500 text-white' : 'border-2 border-gray-300'}`}>
                                    {item.done && <CheckCircle2 className="w-3 h-3" />}
                                </div>
                                <span className={item.done ? 'text-green-700' : 'text-gray-600'}>{item.task}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
