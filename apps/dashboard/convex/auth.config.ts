import { AuthConfig } from 'convex/server';

const domain = process.env.CLERK_JWT_ISSUER_DOMAIN;
if (!domain) {
  throw new Error('CLERK_JWT_ISSUER_DOMAIN is not set — add it to your Convex environment variables');
}

export default {
  providers: [
    {
      domain,
      applicationID: 'convex',
    },
  ],
} satisfies AuthConfig;
