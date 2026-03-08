'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    ChevronLeft, ChevronRight, Check,
    Calendar, MapPin, Palette, UtensilsCrossed,
    Music, FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EventPlan, DEFAULT_EVENT_PLAN } from '@/lib/types/event-plan'

// Import the NEW preference capture step components
import { Step1Basics } from './step-1-basics'
import { Step2VenuePrefs } from './step-2-venue-prefs'
import { Step3StylePrefs } from './step-3-style-prefs'
import { Step4FoodPrefs } from './step-4-food-prefs'
import { Step5ServicesPrefs } from './step-5-services-prefs'
import { Step6Summary } from './step-6-summary'

// 6 Steps for Requirements Capture (not design)
const WIZARD_STEPS = [
    { id: 1, name: 'Basics', icon: Calendar, description: 'Event details & budget' },
    { id: 2, name: 'Venue', icon: MapPin, description: 'Location preferences' },
    { id: 3, name: 'Style', icon: Palette, description: 'Theme & decor preferences' },
    { id: 4, name: 'Food', icon: UtensilsCrossed, description: 'Catering preferences' },
    { id: 5, name: 'Services', icon: Music, description: 'Entertainment & more' },
    { id: 6, name: 'Summary', icon: FileText, description: 'Review & estimate' },
]

export function WizardNavigation() {
    const [currentStep, setCurrentStep] = useState(1)
    const [eventPlan, setEventPlan] = useState<EventPlan>(DEFAULT_EVENT_PLAN)

    const updateEventPlan = <K extends keyof EventPlan>(section: K, data: Partial<EventPlan[K]>) => {
        setEventPlan(prev => {
            const currentSection = prev[section]
            const updatedSection = typeof currentSection === 'object' && currentSection !== null
                ? { ...currentSection, ...data }
                : data
            return {
                ...prev,
                [section]: updatedSection,
                updatedAt: new Date().toISOString()
            }
        })
    }

    const handleNext = () => {
        if (currentStep < WIZARD_STEPS.length) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const goToStep = (step: number) => {
        if (step <= currentStep || step === currentStep + 1) {
            setCurrentStep(step)
        }
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Client Requirements Capture</h1>
                <p className="text-gray-500">Capture what the client wants - you'll design the event after this</p>
            </div>

            {/* Step Indicator - Horizontal */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {WIZARD_STEPS.map((step, index) => {
                        const StepIcon = step.icon
                        const isCompleted = currentStep > step.id
                        const isCurrent = currentStep === step.id
                        const isClickable = step.id <= currentStep + 1

                        return (
                            <div key={step.id} className="flex-1 flex items-center">
                                <button
                                    onClick={() => isClickable && goToStep(step.id)}
                                    disabled={!isClickable}
                                    className={cn(
                                        "flex flex-col items-center gap-1 transition-all",
                                        isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                        isCompleted ? "bg-green-500 text-white" :
                                            isCurrent ? "bg-indigo-600 text-white ring-4 ring-indigo-100" :
                                                "bg-gray-100 text-gray-400"
                                    )}>
                                        {isCompleted ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <StepIcon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-xs font-medium",
                                        isCurrent ? "text-indigo-600" : "text-gray-500"
                                    )}>
                                        {step.name}
                                    </span>
                                </button>

                                {/* Connector Line */}
                                {index < WIZARD_STEPS.length - 1 && (
                                    <div className={cn(
                                        "flex-1 h-1 mx-2 rounded",
                                        isCompleted ? "bg-green-500" : "bg-gray-200"
                                    )} />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Current Step Info */}
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                    Step {currentStep}: {WIZARD_STEPS[currentStep - 1].name}
                </h2>
                <p className="text-gray-500 text-sm">{WIZARD_STEPS[currentStep - 1].description}</p>
            </div>

            {/* Step Content */}
            <Card className="min-h-[500px] shadow-lg border-none">
                <div className="p-6 md:p-8">
                    {currentStep === 1 && (
                        <Step1Basics
                            data={eventPlan.basics}
                            updateData={(data) => updateEventPlan('basics', data)}
                        />
                    )}
                    {currentStep === 2 && (
                        <Step2VenuePrefs
                            data={eventPlan.venue}
                            updateData={(data) => updateEventPlan('venue', data)}
                        />
                    )}
                    {currentStep === 3 && (
                        <Step3StylePrefs
                            data={eventPlan.themeDecor}
                            updateData={(data) => updateEventPlan('themeDecor', data)}
                        />
                    )}
                    {currentStep === 4 && (
                        <Step4FoodPrefs
                            data={eventPlan.catering}
                            updateData={(data) => updateEventPlan('catering', data)}
                        />
                    )}
                    {currentStep === 5 && (
                        <Step5ServicesPrefs
                            data={eventPlan.entertainment}
                            updateData={(data) => updateEventPlan('entertainment', data)}
                        />
                    )}
                    {currentStep === 6 && (
                        <Step6Summary
                            eventPlan={eventPlan}
                        />
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="p-6 bg-gray-50 border-t flex justify-between rounded-b-xl">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className="gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </Button>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        Step {currentStep} of {WIZARD_STEPS.length}
                    </div>

                    {currentStep < WIZARD_STEPS.length ? (
                        <Button
                            onClick={handleNext}
                            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <div className="w-24" /> // Placeholder - actions are in Summary step
                    )}
                </div>
            </Card>
        </div>
    )
}
