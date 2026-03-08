// Invoice Store - manages invoices for the planner

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface InvoiceItem {
    id: string
    description: string
    quantity: number
    rate: number
    amount: number
}

export interface Invoice {
    id: string
    invoiceNumber: string
    eventId: string
    eventName: string
    eventDate: string
    clientName: string
    clientEmail: string
    clientPhone: string
    status: InvoiceStatus
    items: InvoiceItem[]
    subtotal: number
    platformFee: number
    taxes: number
    total: number
    paidAmount: number
    createdAt: string
    dueDate: string
    paidAt?: string
    sentAt?: string
    notes?: string
}

// Mock invoices data
const invoices: Invoice[] = [
    {
        id: 'inv-001',
        invoiceNumber: 'INV-2025-001',
        eventId: 'e1',
        eventName: 'Mehta Sangeet Night',
        eventDate: '2025-02-15',
        clientName: 'Priya Mehta',
        clientEmail: 'priya.mehta@email.com',
        clientPhone: '+91 98765 43210',
        status: 'sent',
        items: [
            { id: '1', description: 'Venue - Grand Hyatt Ballroom', quantity: 1, rate: 300000, amount: 300000 },
            { id: '2', description: 'Bloom Florals - Standard Decor', quantity: 1, rate: 150000, amount: 150000 },
            { id: '3', description: 'DJ Aman - DJ Services', quantity: 1, rate: 75000, amount: 75000 },
        ],
        subtotal: 525000,
        platformFee: 10500,
        taxes: 0,
        total: 535500,
        paidAmount: 200000,
        createdAt: '2024-12-28',
        dueDate: '2025-01-15',
        sentAt: '2024-12-28',
        notes: 'Advance payment received',
    },
    {
        id: 'inv-002',
        invoiceNumber: 'INV-2025-002',
        eventId: 'e2',
        eventName: 'Sharma Anniversary',
        eventDate: '2025-03-10',
        clientName: 'Rakesh Sharma',
        clientEmail: 'rakesh.sharma@email.com',
        clientPhone: '+91 99887 76655',
        status: 'paid',
        items: [
            { id: '1', description: 'Taj Lands End - Venue + Catering', quantity: 1, rate: 450000, amount: 450000 },
            { id: '2', description: 'Click Studios - Photography', quantity: 1, rate: 125000, amount: 125000 },
        ],
        subtotal: 575000,
        platformFee: 11500,
        taxes: 0,
        total: 586500,
        paidAmount: 586500,
        createdAt: '2024-12-22',
        dueDate: '2025-01-10',
        paidAt: '2025-01-05',
        sentAt: '2024-12-22',
    },
    {
        id: 'inv-003',
        invoiceNumber: 'INV-2025-003',
        eventId: 'e3',
        eventName: 'Kapoor Wedding Reception',
        eventDate: '2025-04-20',
        clientName: 'Ankit Kapoor',
        clientEmail: 'ankit.kapoor@email.com',
        clientPhone: '+91 88776 65544',
        status: 'draft',
        items: [
            { id: '1', description: 'ITC Grand Maratha - Grand Ballroom', quantity: 1, rate: 500000, amount: 500000 },
            { id: '2', description: 'Royal Caterers - 400 Pax', quantity: 400, rate: 1200, amount: 480000 },
            { id: '3', description: 'Dreamz Decor - Premium Package', quantity: 1, rate: 250000, amount: 250000 },
            { id: '4', description: 'Lens Story - Photo + Video', quantity: 1, rate: 175000, amount: 175000 },
        ],
        subtotal: 1405000,
        platformFee: 28100,
        taxes: 0,
        total: 1433100,
        paidAmount: 0,
        createdAt: '2025-01-02',
        dueDate: '2025-02-15',
    },
    {
        id: 'inv-004',
        invoiceNumber: 'INV-2024-045',
        eventId: 'e4',
        eventName: 'Patel Engagement',
        eventDate: '2024-12-15',
        clientName: 'Riya Patel',
        clientEmail: 'riya.patel@email.com',
        clientPhone: '+91 77665 54433',
        status: 'overdue',
        items: [
            { id: '1', description: 'Hotel Leela - Venue', quantity: 1, rate: 200000, amount: 200000 },
            { id: '2', description: 'Chef Catering - 150 Pax', quantity: 150, rate: 800, amount: 120000 },
        ],
        subtotal: 320000,
        platformFee: 6400,
        taxes: 0,
        total: 326400,
        paidAmount: 100000,
        createdAt: '2024-11-25',
        dueDate: '2024-12-10',
        sentAt: '2024-11-25',
        notes: 'Partial payment made, balance overdue',
    },
]

// Get all invoices
export function getAllInvoices(): Invoice[] {
    return [...invoices]
}

// Get invoice by ID
export function getInvoiceById(id: string): Invoice | undefined {
    return invoices.find(inv => inv.id === id)
}

// Get invoices by status
export function getInvoicesByStatus(status: InvoiceStatus): Invoice[] {
    return invoices.filter(inv => inv.status === status)
}

// Get invoice stats
export function getInvoiceStats() {
    const total = invoices.length
    const draft = invoices.filter(inv => inv.status === 'draft').length
    const sent = invoices.filter(inv => inv.status === 'sent').length
    const paid = invoices.filter(inv => inv.status === 'paid').length
    const overdue = invoices.filter(inv => inv.status === 'overdue').length

    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0)
    const paidAmount = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0)
    const pendingAmount = totalAmount - paidAmount

    return { total, draft, sent, paid, overdue, totalAmount, paidAmount, pendingAmount }
}

// Update invoice status
export function updateInvoiceStatus(id: string, status: InvoiceStatus): Invoice | null {
    const invoice = invoices.find(inv => inv.id === id)
    if (invoice) {
        invoice.status = status
        if (status === 'paid') {
            invoice.paidAmount = invoice.total
            invoice.paidAt = new Date().toISOString().split('T')[0]
        }
        if (status === 'sent' && !invoice.sentAt) {
            invoice.sentAt = new Date().toISOString().split('T')[0]
        }
        return invoice
    }
    return null
}

// Record payment
export function recordPayment(id: string, amount: number): Invoice | null {
    const invoice = invoices.find(inv => inv.id === id)
    if (invoice) {
        invoice.paidAmount += amount
        if (invoice.paidAmount >= invoice.total) {
            invoice.status = 'paid'
            invoice.paidAt = new Date().toISOString().split('T')[0]
        }
        return invoice
    }
    return null
}
