'use client'

import { useState, useEffect } from 'react'
import { Guest, deleteGuest, updateGuest } from '@/actions/guests'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Search, Users, CheckCircle2, HelpCircle,
    Utensils, Table, Trash2
} from 'lucide-react'
import { AddGuestDialog } from './add-guest-dialog'
import { ImportGuestsDialog } from './import-guests-dialog'
import { SeatingChart } from './seating-chart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

interface GuestsClientProps {
    guests: Guest[]
    eventId: string
}

export function GuestsClient({ guests, eventId }: GuestsClientProps) {
    const [view, setView] = useState<'list' | 'seating'>('list')
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [updatingRsvpId, setUpdatingRsvpId] = useState<string | null>(null)
    const storageKey = `seating-tables-${eventId}`
    const [tables, setTables] = useState<number[]>(() => {
        // Read from localStorage on mount to persist across tab navigation
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(storageKey)
            if (saved) return JSON.parse(saved)
        }
        return [1, 2, 3, 4, 5, 6]
    })
    const router = useRouter()
    const { toast } = useToast()

    // Persist tables to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(tables))
    }, [tables, storageKey])

    async function handleDelete(guestId: string, guestName: string) {
        if (!confirm(`Remove "${guestName}" from the guest list?`)) return
        setDeletingId(guestId)
        const result = await deleteGuest(guestId, eventId)
        setDeletingId(null)
        if (result.error) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' })
        } else {
            toast({ title: 'Guest removed', description: `${guestName} has been removed.` })
            router.refresh()
        }
    }

    async function handleRsvpChange(guest: Guest, newStatus: string) {
        setUpdatingRsvpId(guest.id)
        const formData = new FormData()
        formData.append('id', guest.id)
        formData.append('eventId', eventId)
        formData.append('rsvpStatus', newStatus)
        const result = await updateGuest(formData)
        setUpdatingRsvpId(null)
        if (result.error) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' })
        } else {
            toast({ title: 'RSVP updated', description: `${guest.name} marked as ${newStatus}.` })
            router.refresh()
        }
    }

    // Stats
    const totalGuests = guests.length
    const confirmed = guests.filter(g => g.rsvp_status === 'confirmed').length
    const declined = guests.filter(g => g.rsvp_status === 'declined').length
    const pending = guests.filter(g => g.rsvp_status === 'pending').length
    const dietaryCount = guests.filter(g => g.dietary_preferences).length

    // Calculate total attendees (including plus ones)
    const confirmedAttendees = guests
        .filter(g => g.rsvp_status === 'confirmed')
        .reduce((sum, g) => sum + 1 + (g.plus_one ? 1 : 0), 0)

    // Filtering
    const filteredGuests = guests.filter(guest => {
        const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (guest.email && guest.email.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesStatus = statusFilter === 'all' || guest.rsvp_status === statusFilter

        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-6">
            {/* Header Steps */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Guest List</h2>
                    <p className="text-muted-foreground">Manage invites, RSVPs, and seating arrangements.</p>
                </div>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <Button
                        variant={view === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setView('list')}
                        className={view === 'list' ? 'bg-white shadow-sm' : ''}
                    >
                        List View
                    </Button>
                    <Button
                        variant={view === 'seating' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setView('seating')}
                        className={view === 'seating' ? 'bg-white shadow-sm' : ''}
                    >
                        Seating Chart
                    </Button>
                </div>
                <div className="flex gap-2">
                    <ImportGuestsDialog eventId={eventId} />
                    <AddGuestDialog eventId={eventId} />
                </div>
            </div>

            {view === 'seating' ? (
                <SeatingChart guests={guests} eventId={eventId} tables={tables} onTablesChange={setTables} />
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-4 bg-blue-50 border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">Total Confirmed</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-700">{confirmedAttendees}</div>
                            <div className="text-xs text-blue-600">Attendees (incl. +1s)</div>
                        </Card>
                        <Card className="p-4 bg-orange-50 border-orange-100">
                            <div className="flex items-center gap-2 mb-2">
                                <HelpCircle className="w-4 h-4 text-orange-600" />
                                <span className="text-sm font-medium text-orange-900">Pending RSVP</span>
                            </div>
                            <div className="text-2xl font-bold text-orange-700">{pending}</div>
                            <div className="text-xs text-orange-600">{pending} invites</div>
                        </Card>
                        <Card className="p-4 bg-green-50 border-green-100">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-900">Accepted</span>
                            </div>
                            <div className="text-2xl font-bold text-green-700">{confirmed}</div>
                            <div className="text-xs text-green-600">Primary guests</div>
                        </Card>
                        <Card className="p-4 bg-gray-50 border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Utensils className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-900">Dietary Req.</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-700">{dietaryCount}</div>
                            <div className="text-xs text-gray-600">Special meals needed</div>
                        </Card>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-4 items-center bg-white p-1 rounded-lg border">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search guests by name or email..."
                                className="pl-9 border-0 focus-visible:ring-0"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="w-[200px] border-l pl-4">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="border-0 focus:ring-0">
                                    <SelectValue placeholder="Filter Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="declined">Declined</SelectItem>
                                    <SelectItem value="maybe">Maybe</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Guest List Table */}
                    <div className="rounded-md border bg-white">
                        <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                            <div className="col-span-4">Guest Name</div>
                            <div className="col-span-2">Category</div>
                            <div className="col-span-2">RSVP</div>
                            <div className="col-span-2">Table</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        <div className="divide-y max-h-[600px] overflow-y-auto">
                            {filteredGuests.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No guests found. Try adjusting your search.
                                </div>
                            ) : (
                                filteredGuests.map((guest) => (
                                    <div key={guest.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
                                        <div className="col-span-4">
                                            <div className="font-medium text-gray-900">{guest.name}</div>
                                            <div className="text-xs text-gray-500 flex gap-2">
                                                {guest.email && <span>{guest.email}</span>}
                                                {guest.phone && <span>• {guest.phone}</span>}
                                            </div>
                                            {guest.plus_one && (
                                                <div className="text-xs text-indigo-600 mt-1 flex items-center gap-1">
                                                    +1: {guest.plus_one_name || 'Guest'}
                                                </div>
                                            )}
                                            {guest.dietary_preferences && (
                                                <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                                    <Utensils className="w-3 h-3" /> {guest.dietary_preferences}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-span-2">
                                            <Badge variant="outline" className="capitalize font-normal text-gray-600">
                                                {guest.category?.replace('_', ' ') || 'Other'}
                                            </Badge>
                                        </div>

                                        <div className="col-span-2">
                                            <Select
                                                value={guest.rsvp_status}
                                                onValueChange={(val) => handleRsvpChange(guest, val)}
                                                disabled={updatingRsvpId === guest.id}
                                            >
                                                <SelectTrigger className={`h-7 text-xs border-0 shadow-none px-2 font-medium w-full ${guest.rsvp_status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                    guest.rsvp_status === 'declined' ? 'bg-red-100 text-red-700' :
                                                        guest.rsvp_status === 'maybe' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">🕐 Pending</SelectItem>
                                                    <SelectItem value="confirmed">✅ Confirmed</SelectItem>
                                                    <SelectItem value="declined">❌ Declined</SelectItem>
                                                    <SelectItem value="maybe">🤔 Maybe</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="col-span-2">
                                            {guest.table_number ? (
                                                <div className="flex items-center gap-1 text-sm text-gray-700">
                                                    <Table className="w-4 h-4 text-gray-400" />
                                                    Table {guest.table_number}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Unassigned</span>
                                            )}
                                        </div>

                                        <div className="col-span-2 flex justify-end">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(guest.id, guest.name)}
                                                disabled={deletingId === guest.id}
                                                title="Remove guest"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
