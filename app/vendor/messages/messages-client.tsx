
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Search, Send, Paperclip, MoreVertical,
    Check, CheckCheck, Clock, User, ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { getMessages, sendMessage, markAllAsRead, type Message } from '@/lib/actions/message-actions'
import type { BookingRequest } from '@/lib/repositories/supabase-booking-repository'

interface Props {
    bookings: BookingRequest[]
    currentUserId: string
}

export default function MessagesClient({ bookings, currentUserId }: Props) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // State
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputText, setInputText] = useState('')
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const scrollRef = useRef<HTMLDivElement>(null)

    // Derived state
    const filteredBookings = bookings.filter(b =>
        b.eventName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectedBooking = bookings.find(b => b.id === selectedId)

    // Initial load from URL
    useEffect(() => {
        const bookingId = searchParams.get('bookingId')
        if (bookingId && bookings.some(b => b.id === bookingId)) {
            setSelectedId(bookingId)
        } else if (bookings.length > 0 && !selectedId) {
            // Optional: Select first booking by default?
            // setSelectedId(bookings[0].id)
        }
    }, [searchParams, bookings])

    // Load messages when selection changes
    useEffect(() => {
        if (!selectedId) return

        loadMessages(selectedId)

        // Mark as read
        markAllAsRead(selectedId)
            .then(() => router.refresh())
            .catch(console.error)

    }, [selectedId])

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const loadMessages = async (id: string) => {
        setLoading(true)
        try {
            const data = await getMessages(id)
            setMessages(data)
        } catch (error) {
            console.error('Failed to load messages:', error)
            toast.error('Failed to load conversation')
        } finally {
            setLoading(false)
        }
    }

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!inputText.trim() || !selectedId || sending) return

        const content = inputText.trim()
        setInputText('') // Optimistic clear
        setSending(true)

        try {
            // Optimistic update
            const tempMessage: Message = {
                id: `temp-${Date.now()}`,
                bookingRequestId: selectedId,
                senderType: 'vendor', // Assumed, will be refined by backend
                senderId: currentUserId,
                type: 'text',
                content,
                attachments: [],
                isRead: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
            setMessages(prev => [...prev, tempMessage])

            const result = await sendMessage({
                bookingRequestId: selectedId,
                content
            })

            if (result.success && result.data) {
                // Replace temp message with real one
                setMessages(prev => prev.map(m => m.id === tempMessage.id ? result.data! : m))
            } else {
                throw new Error(result.error || 'Failed to send')
            }
        } catch (error) {
            console.error('Failed to send message:', error)
            toast.error('Failed to send message')
            // Revert optimistic update
            setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')))
            setInputText(content) // Restore text
        } finally {
            setSending(false)
        }
    }

    const handleSelect = (id: string) => {
        setSelectedId(id)
        // Update URL without refresh
        const url = new URL(window.location.href)
        url.searchParams.set('bookingId', id)
        window.history.pushState({}, '', url)
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] border rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Sidebar */}
            <div className={`w-full md:w-80 border-r flex flex-col ${selectedId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search conversations..."
                            className="pl-9 bg-gray-50 border-gray-200"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredBookings.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No conversations found
                        </div>
                    ) : (
                        filteredBookings.map(booking => (
                            <div
                                key={booking.id}
                                onClick={() => handleSelect(booking.id)}
                                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selectedId === booking.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-medium text-gray-900 truncate pr-2">{booking.eventName}</h4>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {new Date(booking.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 truncate">{booking.clientName || 'Client'}</span>
                                    {booking.status === 'pending' && <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">New</Badge>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
                {selectedId ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b flex items-center justify-between bg-white z-10">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden"
                                    onClick={() => setSelectedId(null)}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                    {selectedBooking?.plannerName ? selectedBooking.plannerName[0] : 'P'}
                                </div>
                                <div>
                                    <h3 className="font-semibold">{selectedBooking?.eventName}</h3>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        {selectedBooking?.plannerName || 'Planner'}
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="w-5 h-5 text-gray-500" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div
                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
                            ref={scrollRef}
                        >
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <p>No messages yet.</p>
                                    <p className="text-sm">Start the conversation with the planner!</p>
                                </div>
                            ) : (
                                messages.map(message => {
                                    const isMe = message.senderType === 'vendor'
                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${isMe
                                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                                    : 'bg-white text-gray-800 border rounded-tl-none'
                                                    }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {isMe && (
                                                        message.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t bg-white">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <Button type="button" variant="ghost" size="icon" className="shrink-0 text-gray-500">
                                    <Paperclip className="w-5 h-5" />
                                </Button>
                                <Input
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-50 border-gray-200"
                                    disabled={sending}
                                />
                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 shrink-0"
                                    disabled={!inputText.trim() || sending}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <User className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-600">Select a conversation</h3>
                        <p className="max-w-xs text-center mt-2 text-sm">
                            Choose a booking from the list to start messaging with the planner.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
