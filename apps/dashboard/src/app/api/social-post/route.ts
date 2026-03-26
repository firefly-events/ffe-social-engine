import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { fetchEvents, fetchEventById } from "../../../lib/event-api";
import { generateEventContent } from "../../../lib/event-content-generator";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, eventFilters, platforms, publish } = body;

    if (!platforms?.length) {
      return NextResponse.json(
        { error: "platforms is required" },
        { status: 400 }
      );
    }

    // Get events - either a specific event or filtered list
    let events;
    if (eventId) {
      const event = await fetchEventById(eventId);
      events = [event];
    } else if (eventFilters) {
      const response = await fetchEvents({
        categories: eventFilters.categories,
        location: eventFilters.location,
        startDate: eventFilters.startDate,
        endDate: eventFilters.endDate,
        limit: eventFilters.limit || 5,
      });
      events = response.events;
    } else {
      return NextResponse.json(
        { error: "eventId or eventFilters is required" },
        { status: 400 }
      );
    }

    // Generate AI content
    const content = await generateEventContent(events, platforms);

    // Optionally publish via Zernio
    const results = [];
    if (publish) {
      // Dynamic import to avoid loading Zernio when not needed
      const { zernio } = await import("../../../lib/zernio");
      for (const post of content.socialPosts) {
        try {
          const result = await zernio.createPost(
            userId,
            `${post.text}\n\n${post.hashtags.map((h) => `#${h}`).join(" ")}`,
            [post.platform]
          );
          results.push({ platform: post.platform, status: "published", ...result });
        } catch (err) {
          results.push({
            platform: post.platform,
            status: "failed",
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      posts: content.socialPosts,
      publishResults: publish ? results : undefined,
      eventsProcessed: events.length,
    });
  } catch (error) {
    console.error("Social post error:", error);
    return NextResponse.json(
      { error: "Failed to generate social posts" },
      { status: 500 }
    );
  }
}
