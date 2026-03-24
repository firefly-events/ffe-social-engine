import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-02-25.clover',
});

const TIERS = {
  free: { priceId: 'price_free', amount: 0 },
  starter: { priceId: 'price_999', amount: 999 },
  creator: { priceId: 'price_1499', amount: 1499 },
  pro: { priceId: 'price_2999', amount: 2999 },
  enterprise: { priceId: 'price_29900', amount: 29900 },
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tier } = body;

    if (!tier || !TIERS[tier as keyof typeof TIERS]) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const selectedTier = TIERS[tier as keyof typeof TIERS];

    if (selectedTier.amount === 0) {
      return NextResponse.json({ message: 'Free tier activated' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: selectedTier.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?canceled=true`,
      client_reference_id: userId,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe billing error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
