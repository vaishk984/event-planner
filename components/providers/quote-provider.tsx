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

export function QuoteProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<QuoteItem[]>([])

    // Load from local storage on mount (Simulation)
    useEffect(() => {
        const saved = localStorage.getItem('planner_quote_cart')
        if (saved) {
            try {
                setItems(JSON.parse(saved))
            } catch (e) {
                console.error('Failed to parse quote cart', e)
            }
        }
    }, [])

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('planner_quote_cart', JSON.stringify(items))
    }, [items])

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
