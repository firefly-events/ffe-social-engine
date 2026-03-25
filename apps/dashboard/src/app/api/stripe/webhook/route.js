import { NextResponse } from 'next/server';
import { stripe } from '../../../../../lib/stripe';
import { prisma } from '@ffe/db';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const session = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed':
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      await prisma.user.update({
        where: { id: session.metadata.userId },
        data: {
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          tier: session.metadata.tierId.toUpperCase(),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });
      break;

    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object;
      // You'd need a mapping from price ID to tier here if not using metadata in update
      // For now assume we use metadata on sub if we can
      await prisma.user.update({
        where: { stripeSubscriptionId: updatedSubscription.id },
        data: {
          currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
          // tier update logic based on price ID
        },
      });
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      await prisma.user.update({
        where: { stripeSubscriptionId: deletedSubscription.id },
        data: {
          tier: 'FREE',
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
        },
      });
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
