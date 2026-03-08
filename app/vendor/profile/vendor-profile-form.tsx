'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    ArrowLeft, Save, Camera, Plus, Trash2, Star, MapPin,
    Phone, Mail, Globe, Instagram, Building2, CreditCard, Banknote
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { updateVendorProfile } from '@/lib/actions/vendor-actions'
import type { Vendor } from '@/types/domain'

interface VendorProfileFormProps {
    vendor: Vendor
}

export function VendorProfileForm({ vendor }: VendorProfileFormProps) {
    const [profile, setProfile] = useState<Vendor>(vendor)
    const [saving, setSaving] = useState(false)

    // Helper to safely update nested payment details
    const updatePayment = (field: string, value: string) => {
        setProfile(prev => ({
            ...prev,
            paymentDetails: {
                ...prev.paymentDetails,
                [field]: value
            }
        }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const result = await updateVendorProfile(profile)
            if (result.success) {
                toast.success('Profile updated successfully!')
            } else {
                toast.error(result.error || 'Failed to update profile')
            }
        } catch (error) {
            toast.error('An error occurred while saving')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/vendor">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Business Profile</h2>
                        <p className="text-gray-500">Manage your profile visible to planners</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            {/* Profile Header Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-start gap-6">
                        {/* Logo */}
                        <div className="relative">
                            {profile.images && profile.images.length > 0 ? (
                                <img
                                    src={profile.images[0]}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-xl object-cover bg-gray-100"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center">
                                    <Camera className="w-10 h-10 text-orange-400" />
                                </div>
                            )}
                            <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full border shadow-sm hover:bg-gray-50" title="Upload Logo (Coming Soon)">
                                <Camera className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Business Name</label>
                                    <Input
                                        value={profile.name}
                                        onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Category</label>
                                    <Input
                                        value={profile.category}
                                        disabled
                                        className="mt-1 bg-gray-50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <Textarea
                                    value={profile.description}
                                    onChange={e => setProfile(p => ({ ...p, description: e.target.value }))}
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 mt-6 pt-6 border-t">
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                            <span className="text-xl font-bold">{profile.rating || 0}</span>
                            <span className="text-gray-500">({profile.reviewCount || 0} reviews)</span>
                        </div>
                        <Badge variant={profile.isActive ? 'default' : 'secondary'}>
                            {profile.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {profile.isVerified && (
                            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                                Verified Business
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>How planners and clients can reach you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Phone className="w-4 h-4" /> Phone
                            </label>
                            <Input
                                value={profile.phone}
                                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Email
                            </label>
                            <Input
                                value={profile.email}
                                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Globe className="w-4 h-4" /> Website
                            </label>
                            <Input
                                value={profile.website || ''}
                                onChange={e => setProfile(p => ({ ...p, website: e.target.value }))}
                                className="mt-1"
                                placeholder="https://"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Instagram className="w-4 h-4" /> Instagram Hub
                            </label>
                            <Input
                                value={profile.instagram || ''}
                                onChange={e => setProfile(p => ({ ...p, instagram: e.target.value }))}
                                className="mt-1"
                                placeholder="@username"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Location / City
                        </label>
                        <Input
                            value={profile.city || ''}
                            onChange={e => setProfile(p => ({ ...p, city: e.target.value }))}
                            className="mt-1"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                    <CardDescription>Details for receiving payouts (Not visible to public)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Building2 className="w-4 h-4" /> Bank Name
                            </label>
                            <Input
                                value={profile.paymentDetails?.bankName || ''}
                                onChange={e => updatePayment('bankName', e.target.value)}
                                className="mt-1"
                                placeholder="e.g. HDFC Bank"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <CreditCard className="w-4 h-4" /> Account Number
                            </label>
                            <Input
                                value={profile.paymentDetails?.accountNumber || ''}
                                onChange={e => updatePayment('accountNumber', e.target.value)}
                                className="mt-1"
                                type="password"
                                placeholder="•••• •••• ••••"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Banknote className="w-4 h-4" /> IFSC Code
                            </label>
                            <Input
                                value={profile.paymentDetails?.ifsc || ''}
                                onChange={e => updatePayment('ifsc', e.target.value)}
                                className="mt-1"
                                placeholder="HDFC0001234"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <CreditCard className="w-4 h-4" /> UPI ID
                            </label>
                            <Input
                                value={profile.paymentDetails?.upiId || ''}
                                onChange={e => updatePayment('upiId', e.target.value)}
                                className="mt-1"
                                placeholder="username@upi"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Hint for future features */}
            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                <p className="font-medium">✨ Upcoming Features:</p>
                <ul className="list-disc ml-5 mt-1 space-y-1 text-blue-700">
                    <li>Advanced Portfolio Manager</li>
                    <li>Services & Price Packages Configuration</li>
                    <li>Calendar Availability Sync</li>
                </ul>
            </div>
        </div>
    )
}
