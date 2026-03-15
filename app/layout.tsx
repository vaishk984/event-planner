import "./globals.css"
import { QuoteProvider } from "@/components/providers/quote-provider"
import { EventProvider } from "@/components/providers/event-provider"
import { Toaster } from "@/components/ui/toaster"

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata = {
  title: 'PlannerOS',
  description: 'The Operating System for Event Planners',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <EventProvider userId={null}>
          <QuoteProvider userId={null}>
            {children}
            <Toaster />
          </QuoteProvider>
        </EventProvider>
      </body>
    </html>
  )
}
