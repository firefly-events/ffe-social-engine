import { ClerkProvider } from '@clerk/nextjs'
import { PostHogProvider } from '@/providers/posthog'
import { ConvexClientProvider } from '@/providers/convex'
import { SentryErrorBoundary } from '@/components/error-boundary'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>FFE Social Engine Dashboard</title>
      </head>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#f5f5f5' }}>
        <ClerkProvider>
          <PostHogProvider>
            <ConvexClientProvider>
              <SentryErrorBoundary>
                {children}
              </SentryErrorBoundary>
            </ConvexClientProvider>
          </PostHogProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
