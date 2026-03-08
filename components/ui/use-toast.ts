'use client'

import { toast as sonnerToast } from "sonner"

export function useToast() {
    return {
        toast: ({ title, description, variant }: { title?: string, description?: string, variant?: "default" | "destructive" }) => {
            // Setup minimal toast
            if (variant === "destructive") {
                sonnerToast.error(title, {
                    description,
                })
            } else {
                sonnerToast.success(title, {
                    description,
                })
            }
        },
        dismiss: (toastId?: string) => {
            if (toastId) sonnerToast.dismiss(toastId)
            else sonnerToast.dismiss()
        }
    }
}
