/**
 * env.ts — Critical environment variable validation
 *
 * Called at startup via instrumentation.ts (Node.js runtime only).
 * Logs clear warnings for missing or placeholder values so deploy
 * misconfigurations are immediately visible in Vercel / server logs.
 *
 * Does NOT throw — a missing optional key should never crash the server.
 * The one hard requirement is NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY; without it
 * the entire auth layer is inoperative and we log an explicit error.
 */

interface EnvVar {
  name: string;
  /** If true, absence is an error. If false, just a warning. */
  required: boolean;
  /** Substring patterns that indicate an unfilled placeholder value. */
  placeholderPatterns?: string[];
}

const REQUIRED_VARS: EnvVar[] = [
  {
    name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    required: true,
    placeholderPatterns: ['pk_test_your-', 'your-clerk-publishable-key'],
  },
  {
    name: 'CLERK_SECRET_KEY',
    required: true,
    placeholderPatterns: ['sk_test_your-', 'your-clerk-secret-key'],
  },
  {
    name: 'NEXT_PUBLIC_CONVEX_URL',
    required: true,
    placeholderPatterns: ['your-deployment', 'dummy.convex'],
  },
];

const OPTIONAL_VARS: EnvVar[] = [
  {
    name: 'CLERK_WEBHOOK_SECRET',
    required: false,
    placeholderPatterns: ['whsec_your-'],
  },
  {
    name: 'CLERK_JWT_ISSUER_DOMAIN',
    required: false,
    placeholderPatterns: ['your-clerk-instance'],
  },
];

function isPlaceholder(value: string, patterns: string[] = []): boolean {
  return patterns.some((p) => value.includes(p));
}

function isDevKey(value: string): boolean {
  // pk_test_* and sk_test_* are Clerk development-instance keys.
  // They are intentional for local dev but must not appear in production.
  return value.startsWith('pk_test_') || value.startsWith('sk_test_');
}

export function validateEnv(): void {
  const isProduction = process.env.NODE_ENV === 'production';

  for (const envVar of [...REQUIRED_VARS, ...OPTIONAL_VARS]) {
    const value = process.env[envVar.name] ?? '';

    if (!value) {
      const level = envVar.required ? 'ERROR' : 'WARN';
      console[envVar.required ? 'error' : 'warn'](
        `[env] ${level}: ${envVar.name} is not set. ` +
          (envVar.required
            ? 'This is required — auth will not work correctly.'
            : 'This optional variable is missing.')
      );
      continue;
    }

    if (isPlaceholder(value, envVar.placeholderPatterns)) {
      console.error(
        `[env] ERROR: ${envVar.name} contains a placeholder value. ` +
          'Replace it with a real credential before deploying.'
      );
      continue;
    }

    // Warn when a Clerk dev key is found in a production build.
    if (isProduction && isDevKey(value)) {
      console.error(
        `[env] ERROR: ${envVar.name} is a Clerk development key (pk_test_* / sk_test_*) ` +
          'but NODE_ENV=production. Protected routes will redirect to /sign-in and auth ' +
          'will fail for users. Set production Clerk keys (pk_live_* / sk_live_*) in ' +
          'Vercel → Settings → Environment Variables → Production.'
      );
    }
  }
}
