import { query } from "./_generated/server";
import { useQuery } from "convex/react";
import { Id } from "./_generated/dataModel";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const sessions = await ctx.db.query("contentSessions").collect();
    return sessions;
  },
});
