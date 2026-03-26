import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

function getConvexClient() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get("x-webhook-signature") || "";
    const body = await request.text();

    const webhookSecret = process.env.EVENT_WEBHOOK_SECRET || "";
    if (webhookSecret && !verifySignature(body, signature, webhookSecret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const { type, data } = payload;

    if (type === "event.created" || type === "event.updated") {
      // Find automation rules that match this event
      // Note: We query all enabled rules and filter on server since
      // this is a webhook handler (no user auth context)
      const eventCategories = data.categories || [data.category].filter(Boolean);
      const eventLocation = data.location || "";

      // Enqueue matching rules - the queue processor handles generation
      const convex = getConvexClient();
      const rules = await convex.query(api.automations.listEnabledRulesByType, {
        type: "event-to-social",
      });

      let matched = 0;
      for (const rule of rules) {
        const filters = rule.config.eventFilters;
        if (filters) {
          if (filters.categories?.length) {
            const hasMatch = filters.categories.some((c: string) =>
              eventCategories.includes(c)
            );
            if (!hasMatch) continue;
          }
          if (filters.location && !eventLocation.toLowerCase().includes(filters.location.toLowerCase())) {
            continue;
          }
        }

        await convex.mutation(api.automations.enqueueJob, {
          ruleId: rule._id,
          triggerData: {
            eventIds: [data.id],
            source: `webhook:${type}`,
            triggeredAt: Date.now(),
          },
        });
        matched++;
      }

      return NextResponse.json({ received: true, matched });
    }

    return NextResponse.json({ received: true, matched: 0 });
  } catch (error) {
    console.error("Event webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function verifySignature(body: string, signature: string, secret: string): boolean {
  // Simple HMAC verification - in production use crypto.subtle
  // For now, accept if no secret configured (dev mode)
  if (!secret) return true;
  // TODO: Implement proper HMAC-SHA256 verification
  return signature.length > 0;
}
