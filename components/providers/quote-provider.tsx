'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { QuoteItem } from '@/lib/types/quote'
import { Vendor } from '@/lib/types/vendor'

interface QuoteContextType {
    items: QuoteItem[]
    addToQuote: (vendor: Vendor, serviceName?: string, price?: number) => void
    removeFromQuote: (vendorId: string) => void
    clearQuote: () => void
    total: number
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined)

function getQuoteStorageKey(userId?: string | null) {
    return `planner_quote_cart:${userId || 'guest'}`
}

export function QuoteProvider({
    children,
    userId,
}: {
    children: React.ReactNode
    userId?: string | null
}) {
    const [items, setItems] = useState<QuoteItem[]>([])
    const storageKey = getQuoteStorageKey(userId)

    // Load quote state for the active account
    useEffect(() => {
        setItems([])
        const saved = localStorage.getItem(storageKey)
        if (saved) {
            try {
                setItems(JSON.parse(saved))
            } catch (e) {
                console.error('Failed to parse quote cart', e)
            }
        }
    }, [storageKey])

    // Persist quote state per account
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(items))
    }, [items, storageKey])

    const addToQuote = (vendor: Vendor, serviceName: string = 'Standard Package', price: number = 0) => {
        setItems(prev => {
            if (prev.find(i => i.vendorId === vendor.id)) return prev // Prevent duplicates for this MVP
            return [...prev, {
                vendorId: vendor.id,
                vendorName: vendor.name,
                serviceName: serviceName,
                price: price || vendor.startPrice,
                imageUrl: vendor.imageUrl
            }]
        })
    }

    const removeFromQuote = (vendorId: string) => {
        setItems(prev => prev.filter(i => i.vendorId !== vendorId))
    }

    const clearQuote = () => setItems([])

    const total = items.reduce((sum, item) => sum + item.price, 0)

    return (
        <QuoteContext.Provider value={{ items, addToQuote, removeFromQuote, clearQuote, total }}>
            {children}
        </QuoteContext.Provider>
    )
}

export function useQuote() {
    const context = useContext(QuoteContext)
    if (context === undefined) {
        throw new Error('useQuote must be used within a QuoteProvider')
    }
    return context
}
