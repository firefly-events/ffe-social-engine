import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe, TIERS } from '../../../../../lib/stripe';

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { tierId, interval } = await req.json();
    
    const tierKey = tierId.toUpperCase();
    const tier = TIERS[tierKey];
    
    if (!tier) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const priceId = interval === 'annual' ? tier.annualPriceId : tier.monthlyPriceId;
    
    if (!priceId) {
      return NextResponse.json({ error: 'Price not found for this interval' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
        tierId: tierId
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
