import "./globals.css"
import { QuoteProvider } from "@/components/providers/quote-provider"
import { EventProvider } from "@/components/providers/event-provider"
import { Toaster } from "@/components/ui/toaster"



export const metadata = {
  title: 'PlannerOS',
  description: 'The Operating System for Event Planners',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <EventProvider>
          <QuoteProvider>
            {children}
            <Toaster />
          </QuoteProvider>

        </EventProvider>
      </body>
    </html>
  )
}

