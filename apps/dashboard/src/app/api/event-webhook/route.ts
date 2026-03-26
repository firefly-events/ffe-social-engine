/**
 * POST /api/event-webhook — Receives event webhooks with HMAC-SHA256 signature validation.
 */

import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET;

    // Fail-closed in production: reject if no secret configured
    if (!webhookSecret && process.env.NODE_ENV === "production") {
      console.error("[event-webhook] WEBHOOK_SECRET not configured in production");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const signature = req.headers.get("x-webhook-signature");
    const body = await req.text();

    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json(
          { error: "Missing x-webhook-signature header" },
          { status: 401 }
        );
      }

      // Compute HMAC-SHA256
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

      // Timing-safe comparison — check lengths first to avoid Buffer mismatch
      const sigBuffer = Buffer.from(signature, "utf-8");
      const expectedBuffer = Buffer.from(expectedSignature, "utf-8");

      if (
        sigBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
      ) {
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 401 }
        );
      }
    } else {
      // Development mode without secret — log warning but continue
      console.warn(
        "[event-webhook] WEBHOOK_SECRET not set — processing without signature verification"
      );
    }

    // Parse the event payload
    let payload: { type?: string; data?: unknown };
    try {
      const parsed = JSON.parse(body);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return NextResponse.json(
          { error: "Payload must be a JSON object" },
          { status: 400 }
        );
      }
      payload = parsed;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const eventType = payload.type;

    if (!eventType) {
      return NextResponse.json(
        { error: "Missing event type" },
        { status: 400 }
      );
    }

    // Handle known event types
    switch (eventType) {
      case "event.created":
        console.log("[event-webhook] Received event.created", payload.data);
        break;
      case "event.updated":
        console.log("[event-webhook] Received event.updated", payload.data);
        break;
      default:
        console.log(`[event-webhook] Received unknown event type: ${eventType}`);
    }

    return NextResponse.json({ received: true, eventType }, { status: 200 });
  } catch (err) {
    console.error("[event-webhook] Error processing webhook:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
