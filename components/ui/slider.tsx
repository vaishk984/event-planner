"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
    min: number
    max: number
    step?: number
    value: number
    onValueChange: (value: number) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, min, max, step = 1, value, onValueChange, ...props }, ref) => {

        // Calculate percentage for background gradient
        const percentage = ((value - min) / (max - min)) * 100

        return (
            <div className="relative w-full h-6 flex items-center">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-600 transition-all duration-150 ease-out"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onValueChange(Number(e.target.value))}
                    className={cn(
                        "absolute inset-0 w-full h-full opacity-0 cursor-pointer",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                <div
                    className="absolute h-5 w-5 bg-white border-2 border-indigo-600 rounded-full shadow-md pointer-events-none transition-all duration-150 ease-out"
                    style={{ left: `calc(${percentage}% - 10px)` }}
                />
            </div>
        )
    }
)
Slider.displayName = "Slider"

export { Slider }
