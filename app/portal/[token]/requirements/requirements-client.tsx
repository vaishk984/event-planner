'use client'

import {
    Calendar, MapPin, Users, DollarSign,
    UtensilsCrossed, Palette, Music, Camera,
    Sparkles, Heart
} from 'lucide-react'

interface RequirementsClientProps {
    event: any
    specs: any
    intake: any
}

export function RequirementsClient({ event, specs, intake }: RequirementsClientProps) {
    const requirements = intake?.requirements || {}

    const sections = [
        {
            icon: Calendar,
            title: 'Event Details',
            color: 'bg-blue-50 text-blue-600',
            items: [
                { label: 'Event Type', value: event.event_type || requirements.eventType || '—' },
                { label: 'Date', value: event.date ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                { label: 'Venue', value: event.venue || requirements.venue || '—' },
                { label: 'Guest Count', value: event.guest_count || requirements.guestCount || '—' },
            ]
        },
        {
            icon: UtensilsCrossed,
            title: 'Culinary Preferences',
            color: 'bg-orange-50 text-orange-600',
            items: [
                { label: 'Cuisine Type', value: requirements.cuisineType || specs?.cuisine_type || '—' },
                { label: 'Food Style', value: requirements.foodStyle || specs?.food_style || '—' },
                { label: 'Dietary Restrictions', value: requirements.dietaryRestrictions || specs?.dietary || '—' },
                { label: 'Special Requests', value: requirements.foodNotes || specs?.food_notes || '—' },
            ]
        },
        {
            icon: Palette,
            title: 'Ambience & Decor',
            color: 'bg-purple-50 text-purple-600',
            items: [
                { label: 'Theme', value: requirements.decorTheme || specs?.decor_theme || '—' },
                { label: 'Color Palette', value: requirements.colorPalette || specs?.color_palette || '—' },
                { label: 'Floral Style', value: requirements.floralStyle || specs?.floral_style || '—' },
                { label: 'Decor Notes', value: requirements.decorNotes || specs?.decor_notes || '—' },
            ]
        },
        {
            icon: Music,
            title: 'Entertainment',
            color: 'bg-green-50 text-green-600',
            items: [
                { label: 'Music Type', value: requirements.musicType || specs?.music_type || '—' },
                { label: 'Entertainment Style', value: requirements.entertainmentStyle || specs?.entertainment || '—' },
                { label: 'Special Acts', value: requirements.specialActs || '—' },
            ]
        },
        {
            icon: Camera,
            title: 'Memory Capture',
            color: 'bg-pink-50 text-pink-600',
            items: [
                { label: 'Photography Style', value: requirements.photoStyle || specs?.photo_style || '—' },
                { label: 'Videography', value: requirements.videography || specs?.videography || '—' },
                { label: 'Drone Coverage', value: requirements.droneCoverage || specs?.drone || '—' },
            ]
        },
        {
            icon: Heart,
            title: 'Special Services',
            color: 'bg-red-50 text-red-600',
            items: [
                { label: 'Makeup & Styling', value: requirements.makeup || specs?.makeup || '—' },
                { label: 'Mehendi', value: requirements.mehendi || specs?.mehendi || '—' },
                { label: 'Transport', value: requirements.transport || specs?.transport || '—' },
                { label: 'Other', value: requirements.other || specs?.other || '—' },
            ]
        },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Requirements</h1>
                <p className="text-gray-500">Your event preferences and specifications</p>
            </div>

            {/* Budget Card */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3">
                    <DollarSign className="w-8 h-8 opacity-80" />
                    <div>
                        <p className="text-orange-100 text-sm">Budget Range</p>
                        <p className="text-2xl font-bold">
                            {event.budget_max ? `₹${Number(event.budget_max).toLocaleString('en-IN')}` : 'Not specified'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section) => (
                    <div key={section.title} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${section.color}`}>
                                <section.icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-gray-900">{section.title}</h3>
                        </div>
                        <div className="p-4 space-y-3">
                            {section.items.map((item) => (
                                <div key={item.label} className="flex justify-between items-start">
                                    <span className="text-sm text-gray-500">{item.label}</span>
                                    <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Note */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
                <Sparkles className="w-4 h-4 inline mr-2" />
                To update your preferences, please contact your planner via the Messages section.
            </div>
        </div>
    )
}
