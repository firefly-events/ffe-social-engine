import { Request, Response, NextFunction } from 'express';
import { createClerkClient, verifyToken } from '@clerk/express';

// Extend Express Request to carry Clerk userId and role
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

// clerkClient is used for admin operations (user metadata updates, sign-in tokens)
export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY ?? '',
});

/**
 * Verifies the Clerk session JWT in the Authorization header.
 * Populates req.userId and req.userRole on success.
 * Returns 401 if the token is missing or invalid.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    // verifyToken validates the JWT signature and expiry against Clerk's JWKS
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY ?? '',
    });

    req.userId = payload.sub;

    // Clerk stores custom metadata in publicMetadata.
    // Role is typically stored as publicMetadata.role by the Clerk dashboard or backend.
    const meta = payload as unknown as { publicMetadata?: { role?: string } };
    req.userRole = meta?.publicMetadata?.role;

    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

/**
 * Guard that ensures the authenticated user has the 'admin' role.
 * Must be used AFTER authMiddleware.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.userRole !== 'admin') {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return;
  }
  next();
}
