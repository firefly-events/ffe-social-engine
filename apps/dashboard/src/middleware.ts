import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/health',
  '/api/(.*)',
]);

const isSuperAdminRoute = createRouteMatcher([
  '/super-admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isSuperAdminRoute(req)) {
    const session = await auth();
    // In Clerk, role can be stored in publicMetadata
    const role = (session.sessionClaims?.metadata as any)?.role;
    
    if (role !== 'admin') {
      // Allow access if it's a specific admin email (hardcoded fallback for initial setup)
      // This is risky but helpful if metadata isn't set yet.
      // Better to just redirect to dashboard if not authorized.
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
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
