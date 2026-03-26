/**
 * POST /api/newsletter — Generates and sends weekly newsletter digest.
 *
 * Protected by CRON_SECRET header validation (fail-closed).
 */

import crypto from "crypto";
import { NextResponse } from "next/server";
import { getUpcomingEvents } from "@/lib/event-api";
import { generateWeeklyDigest } from "@/lib/event-content-generator";
import { sendEmail } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    // Validate CRON_SECRET — fail-closed: reject if not configured
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.error("[newsletter] CRON_SECRET not configured");
      return NextResponse.json(
        { error: "CRON_SECRET not configured" },
        { status: 500 }
      );
    }

    const headerSecret = req.headers.get("x-cron-secret") ?? "";
    const secretBuffer = Buffer.from(cronSecret, "utf8");
    const headerBuffer = Buffer.from(headerSecret, "utf8");
    if (
      secretBuffer.length !== headerBuffer.length ||
      !crypto.timingSafeEqual(secretBuffer, headerBuffer)
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch upcoming events
    const events = await getUpcomingEvents(10);

    if (events.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No events to digest",
      });
    }

    // Generate digest HTML
    const html = await generateWeeklyDigest(events);

    // Get subscriber email from request body or use a default
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let to = "newsletter@fireflyevents.io";
    try {
      const body = await req.json();
      if (body.to && typeof body.to === "string" && body.to.length <= 320 && EMAIL_RE.test(body.to)) {
        to = body.to;
      }
    } catch {
      // Body may be empty for cron-triggered requests — use default
    }

    // Send via Resend
    const emailResult = await sendEmail({
      to,
      subject: "Weekly Event Digest",
      html,
    });

    if (emailResult && emailResult.success === false) {
      return NextResponse.json(
        { error: "Failed to send email", emailResult },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      eventsCount: events.length,
      emailResult,
    });
  } catch (err) {
    console.error("[newsletter] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
