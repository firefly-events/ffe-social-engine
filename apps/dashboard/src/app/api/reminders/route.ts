import { auth } from "@clerk/nextjs/server";
import { convexClient } from "@/lib/convex-client";
import { api } from "@convex/_generated/api";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

/**
 * GET /api/reminders
 * List the authenticated user's reminders.
 * Query params: status (optional filter)
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;

    const reminders = await convexClient.query(api.reminders.getUserReminders, {
      userId,
      status,
    });

    return NextResponse.json({ reminders });
  } catch (error: unknown) {
    console.error("GET /api/reminders error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/reminders
 * Create a new reminder for a manual-post platform.
 *
 * Body:
 *   platform: string (e.g. "nextdoor", "yelp")
 *   title: string
 *   body: string (the content to post manually)
 *   scheduledFor: number (Unix ms timestamp)
 *   reminderType: "email" | "push" | "in-app" (default: "in-app")
 *   contentId: string (optional)
 *   exportUrl: string (optional)
 *
 * Tier gating:
 *   - free: returns 402 (export only, no reminders)
 *   - starter+: reminders allowed
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Tier check: get user plan from Convex
    const user = await convexClient.query(api.users.getUser, { clerkId: userId });
    const plan = user?.plan ?? "free";

    if (plan === "free") {
      return NextResponse.json(
        {
          error: "Upgrade required",
          message: "Reminders are available on Starter and above. Free plan supports export only.",
          upgradeUrl: "/pricing",
        },
        { status: 402 }
      );
    }

    const {
      platform,
      title,
      body,
      scheduledFor,
      reminderType = "in-app",
      contentId,
      exportUrl,
    } = await req.json();

    if (!platform || !title || !body || !scheduledFor) {
      return NextResponse.json(
        { error: "platform, title, body, and scheduledFor are required" },
        { status: 400 }
      );
    }

    if (!["email", "push", "in-app"].includes(reminderType)) {
      return NextResponse.json(
        { error: "reminderType must be email, push, or in-app" },
        { status: 400 }
      );
    }

    const externalId = randomUUID();

    await convexClient.mutation(api.reminders.createReminder, {
      externalId,
      userId,
      contentId,
      platform,
      title,
      body,
      scheduledFor,
      reminderType,
      exportUrl,
    });

    return NextResponse.json(
      {
        id: externalId,
        status: "pending",
        platform,
        scheduledFor,
        reminderType,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/reminders error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
