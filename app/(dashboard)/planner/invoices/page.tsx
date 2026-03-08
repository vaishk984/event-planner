'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    FileText, Download, Send, Printer,
    IndianRupee, Calendar, User, Building2,
    CheckCircle2, Clock, AlertCircle, Search,
    CreditCard, Receipt, Loader2, Plus, X, Trash2
} from 'lucide-react'
import { getInvoices, updateInvoiceStatus, createInvoice } from '@/actions/invoices-tasks'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

function getStatusColor(status: string) {
    switch (status) {
        case 'draft': return 'bg-gray-100 text-gray-700'
        case 'sent': return 'bg-blue-100 text-blue-700'
        case 'paid': return 'bg-green-100 text-green-700'
        case 'overdue': return 'bg-red-100 text-red-700'
        case 'cancelled': return 'bg-gray-100 text-gray-500'
        default: return 'bg-gray-100 text-gray-700'
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case 'draft': return 'Draft'
        case 'sent': return 'Sent'
        case 'paid': return 'Paid ✓'
        case 'overdue': return 'Overdue'
        case 'cancelled': return 'Cancelled'
        default: return status
    }
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [sending, setSending] = useState(false)
    const [showCreateDialog, setShowCreateDialog] = useState(false)

    useEffect(() => {
        fetchInvoices()
    }, [])

    const fetchInvoices = async () => {
        const result = await getInvoices()
        setInvoices(result.data || [])
        setLoading(false)
    }

    // Stats
    const totalCount = invoices.length
    const pendingAmount = invoices
        .filter(i => i.status === 'sent' || i.status === 'overdue')
        .reduce((sum, i) => sum + ((i.total || 0) - (i.paid_amount || 0)), 0)
    const paidAmount = invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + (i.total || 0), 0)
    const overdueCount = invoices.filter(i => i.status === 'overdue').length

    const filteredInvoices = invoices.filter(i =>
        (i.client_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.invoice_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.events?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    )

    async function handleSendInvoice() {
        if (!selectedInvoice) return
        setSending(true)
        const result = await updateInvoiceStatus(selectedInvoice.id, 'sent')
        if (result.success) {
            toast.success(`Invoice sent to ${selectedInvoice.client_email || 'client'}`)
            await fetchInvoices()
            setSelectedInvoice({ ...selectedInvoice, status: 'sent' })
        }
        setSending(false)
    }

    async function handleMarkPaid() {
        if (!selectedInvoice) return
        const result = await updateInvoiceStatus(selectedInvoice.id, 'paid')
        if (result.success) {
            toast.success('Invoice marked as paid')
            await fetchInvoices()
            setSelectedInvoice({ ...selectedInvoice, status: 'paid', paid_amount: selectedInvoice.total })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-gray-500">Manage client invoices and payments</p>
                </div>
                <Button
                    className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                    onClick={() => setShowCreateDialog(true)}
                >
                    <Plus className="w-4 h-4" />
                    Create Invoice
                </Button>
            </div>

            {/* Create Invoice Dialog */}
            {showCreateDialog && (
                <CreateInvoiceDialog
                    onClose={() => setShowCreateDialog(false)}
                    onCreated={() => { setShowCreateDialog(false); fetchInvoices() }}
                />
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Receipt className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-700">{totalCount}</p>
                                <p className="text-sm text-blue-600">Total Invoices</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-700">₹{(pendingAmount / 100000).toFixed(1)}L</p>
                                <p className="text-sm text-amber-600">Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-700">₹{(paidAmount / 100000).toFixed(1)}L</p>
                                <p className="text-sm text-green-600">Collected</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-700">{overdueCount}</p>
                                <p className="text-sm text-red-600">Overdue</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search by invoice #, event or client..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Invoices List */}
                <div className="lg:col-span-1 space-y-3">
                    <h2 className="font-semibold text-gray-700">All Invoices</h2>
                    {filteredInvoices.length === 0 ? (
                        <Card className="p-8 text-center">
                            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No invoices yet</p>
                            <p className="text-sm text-gray-400 mt-1">Invoices will appear here when created</p>
                        </Card>
                    ) : (
                        filteredInvoices.map((invoice) => (
                            <Card
                                key={invoice.id}
                                className={`cursor-pointer transition-all hover:shadow-md hover:border-indigo-300 ${selectedInvoice?.id === invoice.id ? 'ring-2 ring-indigo-500 border-indigo-400' : ''}`}
                                onClick={() => setSelectedInvoice(invoice)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="text-sm font-medium text-indigo-600">{invoice.invoice_number}</p>
                                            <h3 className="font-semibold text-gray-900">{invoice.events?.name || 'Event'}</h3>
                                            <p className="text-sm text-gray-500">{invoice.client_name}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                                            {getStatusLabel(invoice.status)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t">
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <Calendar className="w-3 h-3" />
                                            Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                                        </div>
                                        <div className="font-semibold text-gray-900">
                                            ₹{((invoice.total || 0) / 100000).toFixed(2)}L
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Invoice Detail */}
                <div className="lg:col-span-2">
                    {selectedInvoice ? (
                        <Card className="overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <span className="text-2xl font-bold">INVOICE</span>
                                        </div>
                                        <div className="text-indigo-100 text-sm">{selectedInvoice.invoice_number}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                            <Printer className="w-4 h-4 mr-1" /> Print
                                        </Button>
                                        <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                            <Download className="w-4 h-4 mr-1" /> PDF
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Bill To</h3>
                                        <div className="flex items-center gap-2 text-gray-900 font-medium">
                                            <User className="w-4 h-4 text-gray-400" />
                                            {selectedInvoice.client_name}
                                        </div>
                                        {selectedInvoice.client_email && (
                                            <div className="text-gray-600 text-sm">{selectedInvoice.client_email}</div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Event</h3>
                                        <div className="flex items-center gap-2 justify-end text-gray-900 font-medium">
                                            <Building2 className="w-4 h-4 text-gray-400" />
                                            {selectedInvoice.events?.name || 'Event'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-6 mb-6 text-sm p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <span className="text-gray-500">Created:</span>
                                        <span className="ml-2 font-medium">{new Date(selectedInvoice.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Due:</span>
                                        <span className={`ml-2 font-medium ${selectedInvoice.status === 'overdue' ? 'text-red-600' : ''}`}>
                                            {selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedInvoice.status)}`}>
                                        {getStatusLabel(selectedInvoice.status)}
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="flex justify-end mb-6">
                                    <div className="w-72 space-y-2">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span>₹{(selectedInvoice.subtotal || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Platform Fee (2%)</span>
                                            <span>₹{(selectedInvoice.platform_fee || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between text-xl font-bold text-gray-900">
                                                <span>Total</span>
                                                <span>₹{(selectedInvoice.total || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                        {selectedInvoice.paid_amount > 0 && (
                                            <>
                                                <div className="flex justify-between text-green-600">
                                                    <span>Paid</span>
                                                    <span>- ₹{(selectedInvoice.paid_amount || 0).toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="flex justify-between font-semibold text-gray-900">
                                                    <span>Balance Due</span>
                                                    <span>₹{((selectedInvoice.total || 0) - (selectedInvoice.paid_amount || 0)).toLocaleString('en-IN')}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    {selectedInvoice.status === 'draft' && (
                                        <Button onClick={handleSendInvoice} disabled={sending} className="bg-indigo-600 hover:bg-indigo-700">
                                            <Send className="w-4 h-4 mr-2" />
                                            {sending ? 'Sending...' : 'Send Invoice'}
                                        </Button>
                                    )}
                                    {(selectedInvoice.status === 'sent' || selectedInvoice.status === 'overdue') && (
                                        <>
                                            <Button variant="outline" onClick={handleSendInvoice} disabled={sending}>
                                                <Send className="w-4 h-4 mr-2" />
                                                {sending ? 'Sending...' : 'Send Reminder'}
                                            </Button>
                                            <Button onClick={handleMarkPaid} className="bg-green-600 hover:bg-green-700">
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                Mark as Paid
                                            </Button>
                                        </>
                                    )}
                                    {selectedInvoice.status === 'paid' && (
                                        <div className="flex items-center gap-2 text-green-600">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span className="font-medium">Paid on {selectedInvoice.paid_at ? new Date(selectedInvoice.paid_at).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="h-full flex items-center justify-center min-h-[500px]">
                            <div className="text-center text-gray-500">
                                <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>Select an invoice to view details</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// CREATE INVOICE DIALOG
// ============================================================================

function CreateInvoiceDialog({
    onClose,
    onCreated
}: {
    onClose: () => void
    onCreated: () => void
}) {
    const [events, setEvents] = useState<any[]>([])
    const [selectedEventId, setSelectedEventId] = useState('')
    const [clientName, setClientName] = useState('')
    const [clientEmail, setClientEmail] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [items, setItems] = useState<{ description: string; quantity: number; rate: number }[]>([
        { description: '', quantity: 1, rate: 0 }
    ])
    const [loadingEvents, setLoadingEvents] = useState(true)
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        loadEvents()
    }, [])

    useEffect(() => {
        if (selectedEventId) {
            loadVendorItems(selectedEventId)
        }
    }, [selectedEventId])

    const loadEvents = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from('events')
            .select('id, name, client_name, client_email, date')
            .order('created_at', { ascending: false })
        setEvents(data || [])
        if (data && data.length > 0) {
            setSelectedEventId(data[0].id)
            setClientName(data[0].client_name || '')
            setClientEmail(data[0].client_email || '')
        }
        setLoadingEvents(false)
    }

    const loadVendorItems = async (eventId: string) => {
        const supabase = createClient()
        const { data: bookings } = await supabase
            .from('booking_requests')
            .select('service, budget, quoted_amount, vendors(company_name)')
            .eq('event_id', eventId)
            .in('status', ['accepted', 'confirmed'])

        if (bookings && bookings.length > 0) {
            const autoItems = bookings.map((b: any) => ({
                description: `${(b as any).vendors?.company_name || 'Vendor'} — ${b.service || 'Service'}`,
                quantity: 1,
                rate: b.quoted_amount || b.budget || 0
            }))
            setItems(autoItems)
        }

        // Auto-fill client info from event
        const evt = events.find(e => e.id === eventId)
        if (evt) {
            if (evt.client_name) setClientName(evt.client_name)
            if (evt.client_email) setClientEmail(evt.client_email)
        }
    }

    const addItem = () => setItems([...items, { description: '', quantity: 1, rate: 0 }])
    const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx))
    const updateItem = (idx: number, field: string, value: any) => {
        const updated = [...items]
            ; (updated[idx] as any)[field] = value
        setItems(updated)
    }

    const subtotal = items.reduce((sum, i) => sum + (i.quantity * i.rate), 0)

    const handleSubmit = async () => {
        if (!selectedEventId || !clientName.trim() || items.length === 0) {
            toast.error('Event, client name, and at least one item are required')
            return
        }

        setCreating(true)
        const result = await createInvoice({
            eventId: selectedEventId,
            clientName: clientName.trim(),
            clientEmail: clientEmail.trim(),
            dueDate: dueDate || undefined,
            items: items.filter(i => i.description.trim()),
        })

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Invoice created!')
            onCreated()
        }
        setCreating(false)
    }

    if (loadingEvents) {
        return (
            <Card className="border-indigo-200">
                <CardContent className="p-6 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-indigo-200 shadow-lg">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Create Invoice</CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Event *</label>
                        <select
                            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                            value={selectedEventId}
                            onChange={e => setSelectedEventId(e.target.value)}
                        >
                            {events.map(evt => (
                                <option key={evt.id} value={evt.id}>{evt.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Client Name *</label>
                        <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client name" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Client Email</label>
                        <Input value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="client@email.com" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Due Date</label>
                        <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                    </div>
                </div>

                {/* Line Items */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Line Items</label>
                        <Button variant="outline" size="sm" onClick={addItem}>
                            <Plus className="w-3 h-3 mr-1" /> Add Item
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                                <Input
                                    className="flex-1"
                                    value={item.description}
                                    onChange={e => updateItem(idx, 'description', e.target.value)}
                                    placeholder="Description"
                                />
                                <Input
                                    className="w-20"
                                    type="number"
                                    value={item.quantity}
                                    onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                                    placeholder="Qty"
                                />
                                <Input
                                    className="w-28"
                                    type="number"
                                    value={item.rate}
                                    onChange={e => updateItem(idx, 'rate', Number(e.target.value))}
                                    placeholder="Rate (₹)"
                                />
                                <span className="text-sm font-medium w-24 text-right">
                                    ₹{(item.quantity * item.rate).toLocaleString('en-IN')}
                                </span>
                                {items.length > 1 && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(idx)}>
                                        <Trash2 className="w-3 h-3 text-red-500" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end mt-2 text-sm font-semibold">
                        Subtotal: ₹{subtotal.toLocaleString('en-IN')}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={handleSubmit}
                        disabled={creating || !clientName.trim() || !selectedEventId}
                    >
                        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Invoice'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
