'use client'

import { useQuote } from "@/components/providers/quote-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, FileText, Send, IndianRupee, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function QuotesPage() {
    const { items, removeFromQuote, total, clearQuote } = useQuote()

    if (items.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="bg-indigo-50 p-6 rounded-full">
                    <FileText className="w-12 h-12 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Your Quote is Empty</h2>
                <p className="text-gray-500 max-w-sm">
                    Browse the Showroom to add vendors and services to your proposal draft.
                </p>
                <Link href="/showroom">
                    <Button variant="outline" className="mt-4">
                        Browse Showroom
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/planner/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Draft Proposal</h1>
                        <p className="text-gray-500">Event: Mehta Sangeet (Draft)</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={clearQuote} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                        Clear Draft
                    </Button>
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <Send className="w-4 h-4" />
                        Send to Client
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Line Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <Card key={item.vendorId} className="p-4 flex gap-4 items-start group">
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                <Image
                                    src={item.imageUrl}
                                    alt={item.vendorName}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{item.vendorName}</h3>
                                        <p className="text-sm text-gray-500">{item.serviceName}</p>
                                    </div>
                                    <h4 className="font-semibold text-lg flex items-center">
                                        <IndianRupee className="w-4 h-4" />
                                        {item.price.toLocaleString('en-IN')}
                                    </h4>
                                </div>

                                <div className="mt-4 flex justify-between items-center">
                                    <div className="flex gap-2 text-xs text-gray-400">
                                        <span className="bg-gray-50 px-2 py-1 rounded">Tentative</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFromQuote(item.vendorId)}
                                        className="text-gray-400 hover:text-red-600 -mr-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Right Column: Summary */}
                <div className="lg:col-span-1">
                    <Card className="p-6 sticky top-8 bg-gray-50/50 border-gray-200">
                        <h3 className="font-bold text-lg mb-4">Summary</h3>

                        <div className="space-y-3 text-sm border-b border-gray-200 pb-4 mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal ({items.length} items)</span>
                                <span className="font-medium">₹{total.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Platform Fee (2%)</span>
                                <span className="font-medium">₹{(total * 0.02).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>Draft Discount</span>
                                <span>- ₹0</span>
                            </div>
                        </div>

                        <div className="flex justify-between text-xl font-bold mb-6">
                            <span>Total</span>
                            <span className="flex items-center">
                                <IndianRupee className="w-5 h-5" />
                                {(total * 1.02).toLocaleString('en-IN')}
                            </span>
                        </div>

                        <Button className="w-full h-12 text-lg bg-gray-900 hover:bg-black text-white mb-3">
                            <FileText className="w-4 h-4 mr-2" />
                            Preview PDF
                        </Button>
                        <p className="text-xs text-center text-gray-400">
                            Valid for 7 days from generation.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    )
}
