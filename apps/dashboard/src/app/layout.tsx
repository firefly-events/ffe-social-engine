import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { PostHogProvider } from '@/providers/posthog'
import { ConvexClientProvider } from '@/providers/convex'
import { SentryErrorBoundary } from '@/components/error-boundary'
import { ThemeProvider } from '@/providers/theme'
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
      <body className="m-0 bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ClerkProvider
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/dashboard"
            afterSignUpUrl="/dashboard"
          >
            <PostHogProvider>
              <ConvexClientProvider>
                <SentryErrorBoundary>
                  {children}
                </SentryErrorBoundary>
              </ConvexClientProvider>
            </PostHogProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
