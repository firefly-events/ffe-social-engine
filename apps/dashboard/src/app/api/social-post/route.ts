/**
 * POST /api/social-post — Generates social posts from events and optionally publishes via Zernio.
 *
 * Protected by CRON_SECRET header validation (fail-closed).
 */

import crypto from "crypto";
import { NextResponse } from "next/server";
import { getEvent } from "@/lib/event-api";
import { generateSocialPost } from "@/lib/event-content-generator";
import { zernio } from "@/lib/zernio";

export async function POST(req: Request) {
  try {
    // Validate CRON_SECRET — fail-closed: reject if not configured
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.error("[social-post] CRON_SECRET not configured");
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

    // Parse body
    let body: { eventId?: string; platform?: string; zernioProfileId?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { eventId, platform, zernioProfileId } = body;

    if (typeof body.eventId !== "string" || body.eventId.length === 0 || body.eventId.length > 256) {
      return NextResponse.json({ error: "Invalid eventId" }, { status: 400 });
    }
    if (!/^[\w-]+$/.test(body.eventId)) {
      return NextResponse.json({ error: "Invalid eventId format" }, { status: 400 });
    }
    if (typeof body.platform !== "string") {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }
    if (body.zernioProfileId && (typeof body.zernioProfileId !== "string" || body.zernioProfileId.length > 256)) {
      return NextResponse.json({ error: "Invalid zernioProfileId" }, { status: 400 });
    }

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 }
      );
    }

    const ALLOWED_PLATFORMS = ["twitter", "instagram", "facebook", "linkedin", "tiktok"];
    if (!platform || !ALLOWED_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        { error: "platform is required and must be one of: " + ALLOWED_PLATFORMS.join(", ") },
        { status: 400 }
      );
    }

    // Fetch event
    const event = await getEvent(eventId);
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Generate post content
    const content = await generateSocialPost(event, platform);

    // Optionally publish via Zernio
    let published = false;
    let zernioResult = undefined;

    if (zernioProfileId) {
      try {
        zernioResult = await zernio.createPost(zernioProfileId, content, [platform]);
        published = true;
      } catch (err) {
        console.error("[social-post] Zernio publish failed:", err);
        // Return the content even if publishing fails
        zernioResult = {
          error: err instanceof Error ? err.message : "Failed to publish",
        };
      }
    }

    return NextResponse.json({
      success: true,
      content,
      published,
      ...(zernioResult !== undefined && { zernioResult }),
    });
  } catch (err) {
    console.error("[social-post] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
