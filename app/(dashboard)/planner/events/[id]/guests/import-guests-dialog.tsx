'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createGuestsBulk } from '@/actions/guests'
import { Download, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'

interface ImportGuestsDialogProps {
    eventId: string
}

export function ImportGuestsDialog({ eventId }: ImportGuestsDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState<{ total: number, valid: number } | null>(null)
    const [csvContent, setCsvContent] = useState('')
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const SAMPLE_CSV = `name,email,phone,category,rsvp_status
John Doe,john@email.com,9876543210,friends,confirmed
Jane Smith,jane@email.com,,family,pending
Rahul Kumar,,9988776655,work,maybe`

    const parseCSV = (content: string) => {
        const lines = content.trim().split('\n')
        if (lines.length < 2) return []

        const headers = lines[0].toLowerCase().split(',').map(h => h.trim())

        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim())
            const obj: any = {}
            headers.forEach((h, i) => {
                obj[h] = values[i]
            })
            // Map keys to API expected keys
            return {
                name: obj.name,
                email: obj.email,
                phone: obj.phone,
                category: obj.category || 'other',
                rsvpStatus: obj.rsvp_status || 'pending',
                dietaryPreferences: obj.dietary_preferences || '',
                plusOne: false, // Simple import doesn't handle complex relations yet
            }
        }).filter(r => r.name) // Filter empty rows
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target?.result as string
            setCsvContent(text)
            const parsed = parseCSV(text)
            setStats({ total: parsed.length, valid: parsed.length })
            setError(null)
        }
        reader.readAsText(file)
    }

    const handleImport = async () => {
        if (!csvContent) return

        setLoading(true)
        setError(null)

        try {
            const parsedData = parseCSV(csvContent)
            if (parsedData.length === 0) {
                setError("No valid guests found in CSV")
                setLoading(false)
                return
            }

            const result = await createGuestsBulk(eventId, parsedData)

            if (result.success) {
                setOpen(false)
                setCsvContent('')
                setStats(null)
                router.refresh()
                alert(`Successfully imported ${result.count} guests!`)
            } else {
                setError(result.error || 'Failed to import guests')
            }
        } catch (err) {
            console.error(err)
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" /> Import CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Import Guests from CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file with headers: name, email, phone, category
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* File Upload Area */}
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                        <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <div className="text-sm text-gray-600 mb-4">
                            Drag and drop your CSV here, or click to browse
                        </div>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100
                            "
                        />
                    </div>

                    {/* Stats & Error */}
                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {stats && !error && (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
                            <CheckCircle2 className="w-4 h-4" />
                            Ready to import {stats.total} guests
                        </div>
                    )}

                    {/* Text Area backup */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700">Or paste CSV content:</label>
                        <Textarea
                            value={csvContent}
                            onChange={(e) => {
                                setCsvContent(e.target.value)
                                const parsed = parseCSV(e.target.value)
                                setStats({ total: parsed.length, valid: parsed.length })
                            }}
                            placeholder="name,email,phone..."
                            className="font-mono text-xs h-32"
                        />
                    </div>

                    {/* Sample Template */}
                    <div className="bg-gray-50 p-3 rounded-md text-xs font-mono text-gray-500 overflow-x-auto">
                        <div className="font-semibold mb-1">Sample Format:</div>
                        {SAMPLE_CSV}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleImport} disabled={loading || !csvContent || stats?.total === 0}>
                            {loading ? 'Importing...' : 'Import Guests'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
