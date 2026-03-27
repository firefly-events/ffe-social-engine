import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { api } from './_generated/api';
import { Webhook } from 'svix';

const http = httpRouter();

http.route({
  path: '/api/webhooks/clerk',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return new Response('Missing CLERK_WEBHOOK_SECRET', { status: 500 });
    }

    // Read svix signature headers
    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response('Missing svix headers', { status: 400 });
    }

    // Read raw body for signature verification
    const body = await request.text();

    // Verify the webhook signature
    const wh = new Webhook(webhookSecret);
    let event: {
      type: string;
      data: Record<string, any>;
    };

    try {
      event = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as typeof event;
    } catch (err) {
      console.error('Svix webhook verification failed:', err);
      return new Response('Invalid webhook signature', { status: 400 });
    }

    const { type, data } = event;

    if (type === 'user.created' || type === 'user.updated') {
      const email = data.email_addresses?.[0]?.email_address;
      if (!email) {
        return new Response('No email address in payload', { status: 400 });
      }

      const nameParts = [data.first_name, data.last_name].filter(Boolean);
      const name = nameParts.length > 0 ? nameParts.join(' ') : undefined;

      await ctx.runMutation(api.users.syncUser, {
        clerkId: data.id,
        email,
        name,
        imageUrl: data.image_url,
      });
    } else if (type === 'user.deleted') {
      await ctx.runMutation(api.users.softDeleteUser, {
        clerkId: data.id,
      });
    } else if (type === 'subscription.created' || type === 'subscription.updated') {
      const clerkId = data.user_id || data.metadata?.user_id;
      const plan = (data.plan?.name ?? data.plan_name ?? 'free').toLowerCase();

      if (clerkId) {
        await ctx.runMutation(api.users.updatePlan, {
          clerkId,
          plan,
        });
      }
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
