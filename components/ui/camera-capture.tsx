'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Camera, X, RotateCcw, Check, Upload, ImagePlus } from 'lucide-react'

interface CameraCaptureProps {
    onCapture: (imageData: string) => void
    onCancel?: () => void
    aspectRatio?: '16:9' | '4:3' | '1:1'
}

export function CameraCapture({ onCapture, onCancel, aspectRatio = '16:9' }: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')

    // Start camera
    const startCamera = useCallback(async () => {
        try {
            setError(null)
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
                audio: false,
            })
            setStream(mediaStream)
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
            }
        } catch (err) {
            setError('Unable to access camera. Please allow camera permissions.')
            console.error('Camera error:', err)
        }
    }, [facingMode])

    // Stop camera
    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
    }, [stream])

    // Take photo
    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current
            const canvas = canvasRef.current
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.drawImage(video, 0, 0)
                const imageData = canvas.toDataURL('image/jpeg', 0.8)
                setCapturedImage(imageData)
                stopCamera()
            }
        }
    }

    // Retake photo
    const retake = () => {
        setCapturedImage(null)
        startCamera()
    }

    // Confirm and use photo
    const confirm = () => {
        if (capturedImage) {
            onCapture(capturedImage)
        }
    }

    // Switch camera
    const switchCamera = () => {
        stopCamera()
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    }

    useEffect(() => {
        startCamera()
        return () => stopCamera()
    }, [facingMode])

    // File upload fallback
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const result = reader.result as string
                setCapturedImage(result)
                stopCamera()
            }
            reader.readAsDataURL(file)
        }
    }

    const aspectClass = {
        '16:9': 'aspect-video',
        '4:3': 'aspect-[4/3]',
        '1:1': 'aspect-square',
    }[aspectRatio]

    return (
        <Card className="overflow-hidden">
            <div className={`relative bg-black ${aspectClass}`}>
                {/* Live camera feed */}
                {!capturedImage && (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        {error && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white text-center p-4">
                                <div>
                                    <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>{error}</p>
                                    <label className="mt-4 inline-block">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 rounded-lg cursor-pointer hover:bg-orange-600">
                                            <Upload className="w-4 h-4" /> Upload Photo
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Captured image preview */}
                {capturedImage && (
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                )}

                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="p-4 bg-gray-50 flex justify-center gap-3">
                {!capturedImage ? (
                    <>
                        {onCancel && (
                            <Button variant="outline" onClick={onCancel} size="icon">
                                <X className="w-5 h-5" />
                            </Button>
                        )}
                        <Button
                            onClick={capturePhoto}
                            className="w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-600"
                            size="icon"
                        >
                            <Camera className="w-8 h-8" />
                        </Button>
                        <Button variant="outline" onClick={switchCamera} size="icon">
                            <RotateCcw className="w-5 h-5" />
                        </Button>
                        <label>
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                            <Button variant="outline" size="icon" asChild>
                                <span><ImagePlus className="w-5 h-5" /></span>
                            </Button>
                        </label>
                    </>
                ) : (
                    <>
                        <Button variant="outline" onClick={retake} className="gap-2">
                            <RotateCcw className="w-4 h-4" /> Retake
                        </Button>
                        <Button onClick={confirm} className="gap-2 bg-green-600 hover:bg-green-700">
                            <Check className="w-4 h-4" /> Use Photo
                        </Button>
                    </>
                )}
            </div>
        </Card>
    )
}
