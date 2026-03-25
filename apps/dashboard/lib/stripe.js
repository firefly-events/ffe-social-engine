import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not defined in the environment variables, using dummy key for build');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20', // Using latest version
});

export const TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    monthlyPriceId: null,
    annualPriceId: null,
    limits: {
      captions: 5,
      videos: 1,
      posts: 0,
      voices: 0
    }
  },
  STARTER: {
    id: 'starter',
    name: 'Starter',
    monthlyPriceId: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    annualPriceId: process.env.STRIPE_PRICE_STARTER_ANNUAL,
    limits: {
      captions: 50,
      videos: 5,
      posts: 0,
      voices: 0
    }
  },
  BASIC: {
    id: 'basic',
    name: 'Basic',
    monthlyPriceId: process.env.STRIPE_PRICE_BASIC_MONTHLY,
    annualPriceId: process.env.STRIPE_PRICE_BASIC_ANNUAL,
    limits: {
      captions: 100,
      videos: 10,
      posts: 30,
      voices: 0
    }
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    monthlyPriceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
    annualPriceId: process.env.STRIPE_PRICE_PRO_ANNUAL,
    limits: {
      captions: 500,
      videos: 25,
      posts: 100,
      voices: 5
    }
  },
  BUSINESS: {
    id: 'business',
    name: 'Business',
    monthlyPriceId: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
    annualPriceId: process.env.STRIPE_PRICE_BUSINESS_ANNUAL,
    limits: {
      captions: 2000,
      videos: 100,
      posts: 500,
      voices: 20
    }
  },
  AGENCY: {
    id: 'agency',
    name: 'Agency',
    monthlyPriceId: process.env.STRIPE_PRICE_AGENCY_MONTHLY,
    annualPriceId: process.env.STRIPE_PRICE_AGENCY_ANNUAL,
    limits: {
      captions: -1, // Unlimited
      videos: -1,
      posts: -1,
      voices: 50
    }
  }
};

export const getTierByPriceId = (priceId) => {
  return Object.values(TIERS).find(tier => 
    tier.monthlyPriceId === priceId || tier.annualPriceId === priceId
  );
};
