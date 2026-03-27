import { auth } from "@clerk/nextjs/server";
import { convexClient } from "@/lib/convex-client";
import { api } from "@convex/_generated/api";
import { NextResponse } from "next/server";

/**
 * PATCH /api/reminders/[id]
 * Confirm or cancel a reminder.
 * Body: { action: "confirm" | "cancel" }
 *
 * DELETE /api/reminders/[id]
 * Cancel a reminder.
 */

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const action = body.action ?? "cancel";

    if (action === "confirm") {
      await convexClient.mutation(api.reminders.confirmPosted, {
        externalId: id,
        userId,
      });
      return NextResponse.json({ success: true, status: "confirmed" });
    }

    if (action === "cancel") {
      await convexClient.mutation(api.reminders.cancelReminder, {
        externalId: id,
        userId,
      });
      return NextResponse.json({ success: true, status: "cancelled" });
    }

    return NextResponse.json({ error: "Invalid action. Use confirm or cancel." }, { status: 400 });
  } catch (error: unknown) {
    console.error("PATCH /api/reminders/[id] error:", error);
    const message = error instanceof Error ? error.message : "";
    if (message === "Reminder not found") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await convexClient.mutation(api.reminders.cancelReminder, {
      externalId: id,
      userId,
    });

    return NextResponse.json({ success: true, status: "cancelled" });
  } catch (error: unknown) {
    console.error("DELETE /api/reminders/[id] error:", error);
    const message = error instanceof Error ? error.message : "";
    if (message === "Reminder not found") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
