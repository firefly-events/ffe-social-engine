import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { PostHogProvider } from '@/providers/posthog'
import { ConvexClientProvider } from '@/providers/convex'
import { ThemeProviderWrapper } from '@/providers/theme'
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
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <title>FFE Social Engine Dashboard</title>
      </head>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <ThemeProviderWrapper>
          <PostHogProvider>
            <ClerkProvider>
              <ConvexClientProvider>
                <SentryErrorBoundary>
                  {children}
                </SentryErrorBoundary>
              </ConvexClientProvider>
            </ClerkProvider>
          </PostHogProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  )
}
