import { Vendor } from "./vendor"

export interface QuoteItem {
    vendorId: string
    vendorName: string
    serviceName: string
    price: number
    imageUrl: string
}

export interface Quote {
    id: string
    eventId?: string
    clientName: string
    items: QuoteItem[]
    totalAmount: number
    status: 'DRAFT' | 'SENT' | 'ACCEPTED'
    createdAt: string
}
