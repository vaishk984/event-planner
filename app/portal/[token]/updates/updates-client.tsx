'use client'

import { useState, useEffect } from 'react'
import {
    Camera, CheckCircle2, MessageSquare,
    MapPin, Zap, RefreshCw, Image as ImageIcon
} from 'lucide-react'
import { getClientUpdates } from '@/actions/client-portal'

interface Update {
    id: string
    type: string
    message: string | null
    photoUrl: string | null
    statusTag: string | null
    createdAt: string
    sender: string
}

interface UpdatesPageClientProps {
    token: string
    eventName: string
    initialUpdates: Update[]
}

const statusLabels: Record<string, { label: string; emoji: string }> = {
    'arrived': { label: 'Team arrived', emoji: '📍' },
    'setup_started': { label: 'Setup started', emoji: '🔧' },
    'setup_complete': { label: 'Setup complete', emoji: '✅' },
    'in_progress': { label: 'In progress', emoji: '🎯' },
    'completed': { label: 'All done', emoji: '🏁' },
    'issue': { label: 'Attention needed', emoji: '⚠️' },
    'departed': { label: 'Wrapped up', emoji: '👋' },
}

export function UpdatesPageClient({ token, eventName, initialUpdates }: UpdatesPageClientProps) {
    const [updates, setUpdates] = useState<Update[]>(initialUpdates)
    const [refreshing, setRefreshing] = useState(false)

    const handleRefresh = async () => {
        setRefreshing(true)
        const result = await getClientUpdates(token)
        setUpdates(result.data || [])
        setRefreshing(false)
    }

    useEffect(() => {
        const interval = setInterval(handleRefresh, 30000)
        return () => clearInterval(interval)
    }, [token])

    const getUpdateIcon = (type: string) => {
        switch (type) {
            case 'photo': return <Camera className="w-4 h-4 text-blue-500" />
            case 'arrival': return <MapPin className="w-4 h-4 text-green-500" />
            case 'status': return <Zap className="w-4 h-4 text-purple-500" />
            case 'note': return <MessageSquare className="w-4 h-4 text-orange-500" />
            default: return <Zap className="w-4 h-4 text-gray-500" />
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Live Updates</h1>
                    <p className="text-gray-500">Real-time photos and progress from your event</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {updates.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-blue-300" />
                    </div>
                    <h3 className="font-semibold text-gray-600 mb-1">No updates yet</h3>
                    <p className="text-sm text-gray-400">
                        Updates and photos from your event will appear here in real-time
                    </p>
                </div>
            ) : (
                <>
                    {/* Photo Grid */}
                    {updates.filter(u => u.photoUrl).length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-100 p-6">
                            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-orange-500" /> Event Photos
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {updates.filter(u => u.photoUrl).map(u => (
                                    <div key={u.id} className="rounded-xl overflow-hidden border border-gray-100 shadow-sm group hover:shadow-md transition-shadow">
                                        <img
                                            src={u.photoUrl!}
                                            alt={u.message || 'Event photo'}
                                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none'
                                            }}
                                        />
                                        {u.message && (
                                            <p className="p-2 text-xs text-gray-500">{u.message}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-purple-500" /> Activity Timeline
                        </h3>
                        <div className="space-y-4">
                            {updates.map((update) => (
                                <div key={update.id} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                                            {getUpdateIcon(update.type)}
                                        </div>
                                        <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700">
                                                    {update.sender}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(update.createdAt).toLocaleTimeString('en-IN', {
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            {update.statusTag && statusLabels[update.statusTag] && (
                                                <div className="text-sm mb-1">
                                                    <span className="mr-1">{statusLabels[update.statusTag].emoji}</span>
                                                    <span className="font-medium text-gray-800">{statusLabels[update.statusTag].label}</span>
                                                </div>
                                            )}
                                            {update.message && (
                                                <p className="text-sm text-gray-600">{update.message}</p>
                                            )}
                                            {update.photoUrl && (
                                                <div className="mt-2 rounded-lg overflow-hidden max-w-[250px]">
                                                    <img src={update.photoUrl} alt="" className="w-full h-auto object-cover"
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
