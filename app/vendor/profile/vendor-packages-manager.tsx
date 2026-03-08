'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Plus, Trash2, Edit2, Check, X, Package, DollarSign, Clock, List
} from 'lucide-react'
import { toast } from 'sonner'
import { createVendorPackage, updateVendorPackage, deleteVendorPackage } from '@/lib/actions/vendor-actions'
import type { VendorPackage } from '@/types/domain'

interface VendorPackagesManagerProps {
    packages: VendorPackage[]
}

export function VendorPackagesManager({ packages: initialPackages }: VendorPackagesManagerProps) {
    const [packages, setPackages] = useState<VendorPackage[]>(initialPackages)
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // Form state for creating/editing
    const [formData, setFormData] = useState<Partial<VendorPackage>>({
        name: '',
        description: '',
        price: 0,
        duration: '',
        inclusions: [],
        isPopular: false
    })

    const [newInclusion, setNewInclusion] = useState('')

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: 0,
            duration: '',
            inclusions: [],
            isPopular: false
        })
        setNewInclusion('')
        setIsAdding(false)
        setEditingId(null)
    }

    const handleAddInclusion = () => {
        if (!newInclusion.trim()) return
        setFormData(prev => ({
            ...prev,
            inclusions: [...(prev.inclusions || []), newInclusion.trim()]
        }))
        setNewInclusion('')
    }

    const handleRemoveInclusion = (index: number) => {
        setFormData(prev => ({
            ...prev,
            inclusions: (prev.inclusions || []).filter((_, i) => i !== index)
        }))
    }

    const startEdit = (pkg: VendorPackage) => {
        setEditingId(pkg.id)
        setFormData({
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
            duration: pkg.duration,
            inclusions: pkg.inclusions || [],
            isPopular: pkg.isPopular
        })
        setIsAdding(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this package?')) return

        setLoading(true)
        try {
            const result = await deleteVendorPackage(id)
            if (result.success) {
                toast.success('Package deleted')
                setPackages(prev => prev.filter(p => p.id !== id))
            } else {
                toast.error(result.error || 'Failed to delete package')
            }
        } catch (error) {
            toast.error('Error deleting package')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!formData.name || !formData.price) {
            toast.error('Name and Price are required')
            return
        }

        setLoading(true)
        try {
            if (isAdding) {
                const result = await createVendorPackage(formData)
                if (result.success) {
                    toast.success('Package created')
                    setPackages(prev => [...prev, result.data!])
                    resetForm()
                } else {
                    toast.error(result.error || 'Failed to create package')
                }
            } else if (editingId) {
                const result = await updateVendorPackage(editingId, formData)
                if (result.success) {
                    toast.success('Package updated')
                    setPackages(prev => prev.map(p => p.id === editingId ? result.data! : p))
                    resetForm()
                } else {
                    toast.error(result.error || 'Failed to update package')
                }
            }
        } catch (error) {
            toast.error('Error saving package')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Services & Pricing Packages</CardTitle>
                        <CardDescription>Define your service offerings for clients to choose from</CardDescription>
                    </div>
                    {!isAdding && !editingId && (
                        <Button onClick={() => setIsAdding(true)} size="sm">
                            <Plus className="w-4 h-4 mr-2" /> Add Package
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {/* Form for Add/Edit */}
                {(isAdding || editingId) && (
                    <div className="mb-8 p-4 border rounded-lg bg-gray-50 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">{isAdding ? 'New Package' : 'Edit Package'}</h3>
                            <Button variant="ghost" size="sm" onClick={resetForm}><X className="w-4 h-4" /></Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Package Name *</label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. Gold Package"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Price (₹) *</label>
                                <Input
                                    type="number"
                                    value={formData.price}
                                    onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={formData.description || ''}
                                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                placeholder="Describe what makes this package special..."
                                rows={2}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Duration</label>
                                <Input
                                    value={formData.duration || ''}
                                    onChange={e => setFormData(p => ({ ...p, duration: e.target.value }))}
                                    placeholder="e.g. 1 Day, 4 Hours"
                                />
                            </div>
                            <div className="flex items-center space-x-2 pt-6">
                                <input
                                    type="checkbox"
                                    id="isPopular"
                                    checked={formData.isPopular}
                                    onChange={e => setFormData(p => ({ ...p, isPopular: e.target.checked }))}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <label htmlFor="isPopular" className="text-sm font-medium cursor-pointer">Mark as "Client Favorite"</label>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Inclusions (What's included?)</label>
                            <div className="flex gap-2 mt-1 mb-2">
                                <Input
                                    value={newInclusion}
                                    onChange={e => setNewInclusion(e.target.value)}
                                    placeholder="Add an item (e.g. 'Decor setup')"
                                    onKeyDown={e => e.key === 'Enter' && handleAddInclusion()}
                                />
                                <Button type="button" variant="outline" onClick={handleAddInclusion}>Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.inclusions?.map((inc, i) => (
                                    <Badge key={i} variant="secondary" className="flex items-center gap-1">
                                        {inc}
                                        <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => handleRemoveInclusion(i)} />
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={resetForm}>Cancel</Button>
                            <Button onClick={handleSave} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Package'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* List of Packages */}
                <div className="space-y-4">
                    {packages.length === 0 && !isAdding && (
                        <div className="text-center py-8 text-gray-500">
                            <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No packages added yet.</p>
                        </div>
                    )}

                    {packages.map(pkg => (
                        <div key={pkg.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-lg">{pkg.name}</h4>
                                        {pkg.isPopular && (
                                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
                                                Popular
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mt-1">{pkg.description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold">₹{pkg.price.toLocaleString()}</div>
                                    {pkg.duration && <div className="text-sm text-gray-500">{pkg.duration}</div>}
                                </div>
                            </div>

                            {pkg.inclusions && pkg.inclusions.length > 0 && (
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Includes:</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        {pkg.inclusions.map((inc, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <Check className="w-3 h-3 text-green-500" />
                                                <span>{inc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => startEdit(pkg)}>
                                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(pkg.id)}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
