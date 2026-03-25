import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { fetchMutation } from 'convex/nextjs';
import { api } from '../../../../../convex/_generated/api';

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
      // Handled via Convex HTTP Action or Clerk webhooks in full implementation
      console.log('checkout.session.completed', session.metadata?.userId);
      break;

    case 'customer.subscription.updated':
      console.log('customer.subscription.updated', event.data.object.id);
      break;

    case 'customer.subscription.deleted':
      console.log('customer.subscription.deleted', event.data.object.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
