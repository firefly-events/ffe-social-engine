import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_dummy";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    "STRIPE_SECRET_KEY is not defined in the environment variables, using dummy key for build"
  );
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});

// Map tier+interval keys to Stripe price IDs
export const TIER_PRICE_MAP: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRICE_PRO_MONTHLY,
  "pro-annual": process.env.STRIPE_PRICE_PRO_ANNUAL,
  agency: process.env.STRIPE_PRICE_AGENCY_MONTHLY,
  "agency-annual": process.env.STRIPE_PRICE_AGENCY_ANNUAL,
};

// Reverse map: Stripe price ID → tier name (built at module load time)
export const PRICE_TIER_MAP: Record<string, string> = {};
if (process.env.STRIPE_PRICE_PRO_MONTHLY)
  PRICE_TIER_MAP[process.env.STRIPE_PRICE_PRO_MONTHLY] = "pro";
if (process.env.STRIPE_PRICE_PRO_ANNUAL)
  PRICE_TIER_MAP[process.env.STRIPE_PRICE_PRO_ANNUAL] = "pro";
if (process.env.STRIPE_PRICE_AGENCY_MONTHLY)
  PRICE_TIER_MAP[process.env.STRIPE_PRICE_AGENCY_MONTHLY] = "agency";
if (process.env.STRIPE_PRICE_AGENCY_ANNUAL)
  PRICE_TIER_MAP[process.env.STRIPE_PRICE_AGENCY_ANNUAL] = "agency";

export const TIER_LIMITS = {
  free: { captions: 5, videos: 1, posts: 0, voiceClones: 0 },
  pro: { captions: 500, videos: 25, posts: 100, voiceClones: 5 },
  agency: { captions: 5000, videos: 250, posts: 2500, voiceClones: 50 },
  enterprise: {
    captions: Infinity,
    videos: Infinity,
    posts: Infinity,
    voiceClones: Infinity,
  },
} as const;

export type TierName = keyof typeof TIER_LIMITS;
export type UsageField = "captions" | "videos" | "posts" | "voiceClones";
