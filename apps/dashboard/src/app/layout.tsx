import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { PostHogProvider } from '@/providers/posthog'
import { ConvexClientProvider } from '@/providers/convex'
import { SentryErrorBoundary } from '@/components/error-boundary'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <title>FFE Social Engine Dashboard</title>
      </head>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#f5f5f5' }}>
        <PostHogProvider>
          <ClerkProvider>
            <ConvexClientProvider>
              <SentryErrorBoundary>
                {children}
              </SentryErrorBoundary>
            </ConvexClientProvider>
          </ClerkProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
