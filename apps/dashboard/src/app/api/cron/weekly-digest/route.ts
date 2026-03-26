import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { fetchEvents } from "../../../../lib/event-api";
import { generateEventContent } from "../../../../lib/event-content-generator";
import { sendEmail, renderNewsletterHtml } from "../../../../lib/resend";

function getConvexClient() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all pending digest queue items
    const convex = getConvexClient();
    const rules = await convex.query(api.automations.listEnabledRulesByType, {
      type: "weekly-digest",
    });

    let processed = 0;
    for (const rule of rules) {
      try {
        // Fetch events based on rule filters
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const eventsResponse = await fetchEvents({
          categories: rule.config.eventFilters?.categories,
          location: rule.config.eventFilters?.location,
          startDate: now.toISOString(),
          endDate: nextWeek.toISOString(),
          limit: 10,
        });

        if (eventsResponse.events.length === 0) continue;

        // Generate content
        const content = await generateEventContent(
          eventsResponse.events,
          rule.config.platforms || [],
          true
        );

        // Send newsletter if configured
        if (rule.config.newsletterConfig?.recipientListId) {
          const sections = eventsResponse.events.map((event, i) => ({
            title: content.newsletterSection?.title || event.title,
            body: content.newsletterSection?.body || event.description,
            imageUrl: event.imageUrl,
            ctaUrl: event.ticketUrl,
            ctaText: content.newsletterSection?.ctaText || "Get Tickets",
          }));

          const html = renderNewsletterHtml({
            subject: rule.config.newsletterConfig.subject || "Weekly Event Digest",
            preheader: `${eventsResponse.events.length} events this week`,
            sections,
          });

          await sendEmail({
            to: rule.config.newsletterConfig.recipientListId,
            subject: rule.config.newsletterConfig.subject || "Weekly Event Digest",
            html,
          });
        }

        // Update rule last run
        await convex.mutation(api.automations.updateRule, {
          ruleId: rule._id,
        });

        processed++;
      } catch (err) {
        console.error(`Failed to process rule ${rule._id}:`, err);
      }
    }

    return NextResponse.json({ success: true, processed });
  } catch (error) {
    console.error("Weekly digest cron error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
