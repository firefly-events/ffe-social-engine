import { query } from "./_generated/server";

export const getRecentPosts = query({
  handler: async (ctx) => {
    return await ctx.db.query("posts").order("desc").take(10);
  },
});
