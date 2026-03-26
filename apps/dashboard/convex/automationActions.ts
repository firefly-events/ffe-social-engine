import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

function isPrivateHostname(hostname: string): boolean {
  // Strip IPv6 brackets
  const h = hostname.replace(/^\[|\]$/g, "");
  if (h === "::1" || h === "0.0.0.0" || h === "localhost") return true;
  // Check IPv4 private ranges
  const ipv4Match = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    if (a === 127) return true;                         // 127.x.x.x
    if (a === 10) return true;                          // 10.x.x.x
    if (a === 172 && b >= 16 && b <= 31) return true;   // 172.16-31.x.x
    if (a === 192 && b === 168) return true;            // 192.168.x.x
    if (a === 169 && b === 254) return true;            // 169.254.x.x (link-local + metadata)
    if (a === 0) return true;                           // 0.x.x.x
  }
  return false;
}

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  // Validate URL format
  try {
    const parsed = new URL(url);
    if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
      throw new Error("NEXT_PUBLIC_APP_URL must use HTTPS in production");
    }
    // SSRF protection: block private IPs in production
    if (process.env.NODE_ENV === "production" && isPrivateHostname(parsed.hostname)) {
      throw new Error("NEXT_PUBLIC_APP_URL must not point to a private IP in production");
    }
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error(`Invalid NEXT_PUBLIC_APP_URL: ${url}`);
    }
    throw e;
  }
  return url;
}

export const processQueue = internalAction({
  args: {},
  handler: async (ctx) => {
    const pendingItems = await ctx.runQuery(
      internal.automationActions._getPendingItems,
      {}
    );

    for (const item of pendingItems) {
      await ctx.runMutation(internal.automations.updateQueueItem, {
        id: item._id,
        status: "processing",
      });

      try {
        const rule = await ctx.runQuery(
          internal.automationActions._getRule,
          { id: item.ruleId }
        );

        if (!rule) {
          await ctx.runMutation(internal.automations.updateQueueItem, {
            id: item._id,
            status: "failed",
            error: "Rule not found",
          });
          continue;
        }

        const baseUrl = getBaseUrl();
        let result: unknown = null;

                const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret) {
          throw new Error("CRON_SECRET environment variable is not configured");
        }
        for (const action of rule.actions) {
          if (action === "generate_post" || action === "publish_post") {
            const res = await fetch(`${baseUrl}/api/social-post`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-cron-secret": cronSecret,
              },
              body: JSON.stringify({
                userId: item.userId,
                triggerData: item.triggerData,
                platforms: rule.platforms,
                action,
              }),
            });
            if (!res.ok) {
              throw new Error(`social-post API returned ${res.status}`);
            }
            result = await res.json();
            if (typeof result !== "object" || result === null) {
              throw new Error("social-post API returned an invalid response");
            }
          } else if (action === "send_newsletter") {
            const res = await fetch(`${baseUrl}/api/newsletter`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-cron-secret": cronSecret,
              },
              body: JSON.stringify({
                userId: item.userId,
                triggerData: item.triggerData,
              }),
            });
            if (!res.ok) {
              throw new Error(`newsletter API returned ${res.status}`);
            }
            result = await res.json();
            if (typeof result !== "object" || result === null) {
              throw new Error("newsletter API returned an invalid response");
            }
          }
        }

        await ctx.runMutation(internal.automations.updateQueueItem, {
          id: item._id,
          status: "completed",
          result,
        });
      } catch (error) {
        await ctx.runMutation(internal.automations.updateQueueItem, {
          id: item._id,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  },
});

export const processWeeklyDigest = internalAction({
  args: {},
  handler: async (ctx) => {
    const rules = await ctx.runQuery(
      internal.automationActions._getWeeklyDigestRules,
      {}
    );

    for (const rule of rules) {
      await ctx.runMutation(internal.automations.enqueueItem, {
        ruleId: rule._id,
        userId: rule.userId,
        triggerData: { type: "weekly_digest", timestamp: Date.now() },
      });
    }

    // Make one call to process the newly enqueued items
    const baseUrl = getBaseUrl();
            const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret) {
          throw new Error("CRON_SECRET environment variable is not configured");
        }
    try {
      await fetch(`${baseUrl}/api/newsletter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cron-secret": cronSecret,
        },
        body: JSON.stringify({ type: "weekly_digest" }),
      });
    } catch (error) {
      console.error("Failed to trigger newsletter processing:", error);
    }
  },
});

// Internal queries used by the actions above

import { internalQuery } from "./_generated/server";

export const _getPendingItems = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("automationQueue")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .take(10);
  },
});

export const _getRule = internalQuery({
  args: { id: v.id("automationRules") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const _getWeeklyDigestRules = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("automationRules")
      .withIndex("by_triggerType", (q) => q.eq("triggerType", "weekly_digest"))
      .filter((q) => q.eq(q.field("enabled"), true))
      .collect();
  },
});
