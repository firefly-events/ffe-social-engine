import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/about',
  '/api/health',
  '/api/webhooks/(.*)',
  '/(auth)/sign-in(.*)',
  '/(auth)/sign-up(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

const isAdminRoute = createRouteMatcher([
  '/(dashboard)/admin(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) {
    return NextResponse.next()
  }

  // Protect all non-public routes
  const session = await auth()

  if (!session.userId) {
    return session.redirectToSignIn()
  }

  // Admin routes: require org admin role or specific metadata
  if (isAdminRoute(request)) {
    const sessionClaims = session.sessionClaims as {
      metadata?: { role?: string }
    } | null

    if (sessionClaims?.metadata?.role !== 'admin') {
      const url = new URL('/(dashboard)', request.url)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
