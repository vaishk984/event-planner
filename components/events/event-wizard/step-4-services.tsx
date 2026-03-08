'use client'

import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Package, Settings2, Check } from 'lucide-react'

interface Step4Props {
    data: any
    updateData: (data: any) => void
}

export function Step4Services({ data, updateData }: Step4Props) {
    const serviceMode = data.serviceMode || null

    const handleModeSelect = (mode: 'packages' | 'custom') => {
        updateData({ ...data, serviceMode: mode })
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Service Planning
                </h3>
                <p className="text-sm text-gray-500">
                    Choose a pre-designed package for speed, or build a custom plan.
                </p>
            </div>

            {/* Mode Selection */}
            <div className="grid gap-6 md:grid-cols-2">
                <div
                    onClick={() => handleModeSelect('packages')}
                    className={cn(
                        "cursor-pointer relative overflow-hidden rounded-xl border-2 p-6 transition-all hover:border-green-500 hover:bg-green-50/30",
                        serviceMode === 'packages' ? "border-green-600 bg-green-50" : "border-gray-200 bg-white"
                    )}
                >
                    <div className="flex items-start gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-colors shrink-0",
                            serviceMode === 'packages' ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500"
                        )}>
                            📦
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg">Combo Packages</h4>
                            <p className="text-sm text-gray-500 mt-1">Pre-bundled services for quick estimation. Good, Better, Best options.</p>
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => handleModeSelect('custom')}
                    className={cn(
                        "cursor-pointer relative overflow-hidden rounded-xl border-2 p-6 transition-all hover:border-blue-500 hover:bg-blue-50/30",
                        serviceMode === 'custom' ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"
                    )}
                >
                    <div className="flex items-start gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-colors shrink-0",
                            serviceMode === 'custom' ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                        )}>
                            🛠️
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg">Custom Builder</h4>
                            <p className="text-sm text-gray-500 mt-1">Power mode. Select specific vendors and services one by one.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Package Options */}
            {serviceMode === 'packages' && (
                <div className="grid gap-4 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {['Good', 'Better', 'Best'].map((tier) => (
                        <Card
                            key={tier}
                            onClick={() => updateData({ ...data, selectedPackage: tier })}
                            className={cn(
                                "cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 relative overflow-hidden",
                                data.selectedPackage === tier ? "ring-2 ring-green-600 ring-offset-2" : ""
                            )}
                        >
                            <div className={cn(
                                "h-2 w-full",
                                tier === 'Good' ? "bg-gray-400" : tier === 'Better' ? "bg-indigo-500" : "bg-amber-400"
                            )} />
                            <div className="p-6">
                                <h4 className="font-bold text-lg mb-2">{tier} Plan</h4>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Standard Decor</div>
                                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Buffey Catering</div>
                                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Basic Photography</div>
                                    {tier !== 'Good' && <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> DJ & Sound</div>}
                                    {tier === 'Best' && <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Drone Coverage</div>}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Custom Builder Placeholder */}
            {serviceMode === 'custom' && (
                <Card className="p-8 border-blue-100 bg-blue-50/30 animate-in fade-in zoom-in-95 duration-300 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <Settings2 className="w-12 h-12 text-blue-300" />
                        <h4 className="font-semibold text-blue-900">Custom Service Builder</h4>
                        <p className="text-sm text-blue-600 max-w-md mx-auto">
                            This advanced module will allow you to browse the vendor catalog and build a line-item quote. (Coming in next update)
                        </p>
                    </div>
                </Card>
            )}
        </div>
    )
}
