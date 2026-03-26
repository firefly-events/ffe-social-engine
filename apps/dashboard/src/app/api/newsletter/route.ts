import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { fetchEvents } from "../../../lib/event-api";
import { generateEventContent } from "../../../lib/event-content-generator";
import { sendEmail, renderNewsletterHtml, NewsletterContent } from "../../../lib/resend";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      recipientEmails,
      subject,
      eventFilters,
      customSections,
    } = body;

    if (!recipientEmails?.length) {
      return NextResponse.json(
        { error: "recipientEmails is required" },
        { status: 400 }
      );
    }

    // Fetch events based on filters
    const eventsResponse = await fetchEvents({
      categories: eventFilters?.categories,
      location: eventFilters?.location,
      startDate: eventFilters?.startDate,
      endDate: eventFilters?.endDate,
      limit: eventFilters?.limit || 10,
    });

    // Generate AI content for events
    const content = await generateEventContent(
      eventsResponse.events,
      [],
      true
    );

    // Build newsletter sections
    const sections: NewsletterContent["sections"] = [];

    // Add AI-generated event sections
    for (const event of eventsResponse.events) {
      const aiSection = content.newsletterSection;
      sections.push({
        title: aiSection?.title || event.title,
        body: aiSection?.body || event.description,
        imageUrl: event.imageUrl,
        ctaUrl: event.ticketUrl,
        ctaText: aiSection?.ctaText || "Get Tickets",
      });
    }

    // Add any custom sections
    if (customSections?.length) {
      sections.push(...customSections);
    }

    const newsletterContent: NewsletterContent = {
      subject: subject || "This Week's Events from Firefly",
      preheader: `${eventsResponse.events.length} events you won't want to miss`,
      sections,
    };

    // Render and send
    const html = renderNewsletterHtml(newsletterContent);
    const result = await sendEmail({
      to: recipientEmails,
      subject: newsletterContent.subject,
      html,
      tags: [{ name: "type", value: "event-newsletter" }],
    });

    return NextResponse.json({
      success: true,
      emailId: result.id,
      eventsIncluded: eventsResponse.events.length,
    });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json(
      { error: "Failed to send newsletter" },
      { status: 500 }
    );
  }
}
