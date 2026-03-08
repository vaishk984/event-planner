'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, MessageSquare, User, PartyPopper } from 'lucide-react'
import { sendClientMessage, getClientMessages } from '@/actions/client-portal'
import { toast } from 'sonner'

interface Message {
    id: string
    event_id: string
    sender_type: 'client' | 'planner'
    message: string
    is_read: boolean
    created_at: string
}

interface ContactPageClientProps {
    token: string
    eventName: string
    initialMessages: Message[]
}

export function ContactPageClient({ token, eventName, initialMessages }: ContactPageClientProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        const interval = setInterval(async () => {
            const result = await getClientMessages(token)
            if (result.data) setMessages(result.data)
        }, 15000)
        return () => clearInterval(interval)
    }, [token])

    const handleSend = async () => {
        if (!newMessage.trim()) return
        setSending(true)
        const result = await sendClientMessage(token, newMessage.trim())
        if (result.error) {
            toast.error('Failed to send message')
        } else {
            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                event_id: '',
                sender_type: 'client',
                message: newMessage.trim(),
                is_read: false,
                created_at: new Date().toISOString()
            }])
            setNewMessage('')
        }
        setSending(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-500">Chat with your planner</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 bg-white rounded-xl border border-gray-100 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6">
                    {messages.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-50 flex items-center justify-center">
                                <MessageSquare className="w-8 h-8 text-green-300" />
                            </div>
                            <h3 className="font-semibold text-gray-600 mb-1">Start a conversation</h3>
                            <p className="text-sm text-gray-400">
                                Send a message to your planner — they'll reply here
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-2 max-w-[70%] ${msg.sender_type === 'client' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender_type === 'client' ? 'bg-orange-100' : 'bg-green-100'
                                            }`}>
                                            {msg.sender_type === 'client' ? (
                                                <User className="w-4 h-4 text-orange-600" />
                                            ) : (
                                                <PartyPopper className="w-4 h-4 text-green-600" />
                                            )}
                                        </div>
                                        <div className={`rounded-2xl px-4 py-2.5 ${msg.sender_type === 'client'
                                                ? 'bg-orange-500 text-white rounded-tr-none'
                                                : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                            }`}>
                                            <p className="text-sm">{msg.message}</p>
                                            <p className={`text-xs mt-1 ${msg.sender_type === 'client' ? 'text-orange-200' : 'text-gray-400'
                                                }`}>
                                                {new Date(msg.created_at).toLocaleTimeString('en-IN', {
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="border-t border-gray-100 p-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                            disabled={sending}
                        />
                        <button
                            onClick={handleSend}
                            disabled={sending || !newMessage.trim()}
                            className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl flex items-center justify-center hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 transition-all shadow-lg shadow-orange-200"
                        >
                            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
