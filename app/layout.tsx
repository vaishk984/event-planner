import "./globals.css"
import { BrowserSessionBridge } from "@/components/auth/browser-session-bridge"
import { QuoteProvider } from "@/components/providers/quote-provider"
import { EventProvider } from "@/components/providers/event-provider"
import { Toaster } from "@/components/ui/toaster"
import { getSession } from "@/lib/session"

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
  const session = await getSession()

  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <EventProvider userId={session?.userId || null}>
          <QuoteProvider userId={session?.userId || null}>
            <BrowserSessionBridge />
            {children}
            <Toaster />
          </QuoteProvider>
        </EventProvider>
      </body>
    </html>
  )
}
