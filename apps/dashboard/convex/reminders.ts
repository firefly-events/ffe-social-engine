import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createReminder = mutation({
  args: {
    externalId: v.string(),
    userId: v.string(),
    contentId: v.optional(v.string()),
    platform: v.string(),
    title: v.string(),
    body: v.string(),
    scheduledFor: v.number(),
    reminderType: v.string(),
    exportUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reminders", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getUserReminders = query({
  args: {
    userId: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("reminders")
        .withIndex("by_userId_status", (q) =>
          q.eq("userId", args.userId).eq("status", args.status!)
        )
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("reminders")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reminders")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .first();
  },
});

export const confirmPosted = mutation({
  args: { externalId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const reminder = await ctx.db
      .query("reminders")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .first();
    if (!reminder) throw new Error("Reminder not found");
    if (reminder.userId !== args.userId) throw new Error("Forbidden");
    await ctx.db.patch(reminder._id, {
      status: "confirmed",
      confirmedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const cancelReminder = mutation({
  args: { externalId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const reminder = await ctx.db
      .query("reminders")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .first();
    if (!reminder) throw new Error("Reminder not found");
    if (reminder.userId !== args.userId) throw new Error("Forbidden");
    if (reminder.status === "confirmed") throw new Error("Cannot cancel a confirmed reminder");
    await ctx.db.patch(reminder._id, {
      status: "cancelled",
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});
