import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/health',
  '/api/webhooks/(.*)',
  '/api/health',
]);

/**
 * Returns true when the Clerk publishable key is missing or is clearly a
 * placeholder / example value.  In that state Clerk cannot initialise, so we
 * redirect protected routes to /sign-in ourselves rather than letting the
 * middleware throw a 500 or return a 404.
 */
function clerkKeyIsDevOrMissing(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
  if (key === '' || key.startsWith('pk_test_your-')) return true;
  // Dev keys (pk_test_*) on a production domain cause 404s because
  // Clerk dev instances reject CORS from non-localhost origins.
  // We validate in dev by running locally; prod needs pk_live_*.
  if (key.startsWith('pk_test_') && process.env.NODE_ENV === 'production') return true;
  return false;
}

export default clerkMiddleware(async (auth, req) => {
  // If Clerk is not configured (missing / placeholder key) redirect all
  // protected routes to /sign-in so the user sees a meaningful page instead
  // of a 404 or an uncaught Clerk error.
  if (clerkKeyIsDevOrMissing()) {
    if (!isPublicRoute(req)) {
      const signInUrl = new URL('/sign-in', req.url);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
