'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Eraser, Check, RotateCcw } from 'lucide-react'

interface SignaturePadProps {
    onSave: (signatureData: string, timestamp: string) => void
    onCancel?: () => void
    clientName?: string
}

export function SignaturePad({ onSave, onCancel, clientName }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [hasSignature, setHasSignature] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * 2
        canvas.height = rect.height * 2
        ctx.scale(2, 2)

        // Set drawing style
        ctx.strokeStyle = '#1a1a1a'
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        // Fill white background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw signature line
        ctx.strokeStyle = '#e5e5e5'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(20, rect.height - 40)
        ctx.lineTo(rect.width - 20, rect.height - 40)
        ctx.stroke()

        // Draw "Sign here" text
        ctx.fillStyle = '#9ca3af'
        ctx.font = '14px sans-serif'
        ctx.fillText('Sign here', 20, rect.height - 20)

        // Reset style
        ctx.strokeStyle = '#1a1a1a'
        ctx.lineWidth = 2.5
    }, [])

    const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }

        const rect = canvas.getBoundingClientRect()

        if ('touches' in e) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top,
            }
        }

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        }
    }

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault()
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!ctx) return

        setIsDrawing(true)
        const { x, y } = getPosition(e)
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault()
        if (!isDrawing) return

        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!ctx) return

        const { x, y } = getPosition(e)
        ctx.lineTo(x, y)
        ctx.stroke()
        setHasSignature(true)
    }

    const stopDrawing = () => {
        setIsDrawing(false)
    }

    const clear = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        const rect = canvas.getBoundingClientRect()

        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Redraw signature line
        ctx.strokeStyle = '#e5e5e5'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(20, rect.height - 40)
        ctx.lineTo(rect.width - 20, rect.height - 40)
        ctx.stroke()

        ctx.fillStyle = '#9ca3af'
        ctx.font = '14px sans-serif'
        ctx.fillText('Sign here', 20, rect.height - 20)

        ctx.strokeStyle = '#1a1a1a'
        ctx.lineWidth = 2.5

        setHasSignature(false)
    }

    const save = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const signatureData = canvas.toDataURL('image/png')
        const timestamp = new Date().toISOString()
        onSave(signatureData, timestamp)
    }

    return (
        <Card className="overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b">
                <h3 className="font-semibold text-gray-900">Digital Signature</h3>
                {clientName && (
                    <p className="text-sm text-gray-500">I, {clientName}, confirm the above requirements.</p>
                )}
            </div>

            <div className="p-4 bg-white">
                <canvas
                    ref={canvasRef}
                    className="w-full h-40 border-2 border-dashed border-gray-200 rounded-lg cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>

            <div className="p-4 bg-gray-50 flex justify-between">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={clear} className="gap-2">
                        <Eraser className="w-4 h-4" /> Clear
                    </Button>
                    {onCancel && (
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                </div>
                <Button
                    onClick={save}
                    disabled={!hasSignature}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                >
                    <Check className="w-4 h-4" /> Confirm & Sign
                </Button>
            </div>

            <div className="px-4 pb-4 bg-gray-50 text-xs text-gray-400 text-center">
                By signing, you confirm the accuracy of the requirements provided.
            </div>
        </Card>
    )
}
