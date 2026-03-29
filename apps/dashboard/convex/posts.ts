import { query } from "./_generated/server";

export const getRecentPosts = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const allPosts = await ctx.db.query("posts").order("desc").take(50);
    return allPosts.filter((p) => p.userId === identity.subject).slice(0, 10);
  },
});
