import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

type ContentItem = Doc<"generationJobs"> | Doc<"posts"> | Doc<"mediaFiles">;

export const list = query({
  args: {
    userId: v.string(),
    filter: v.optional(v.string()),
  },
  handler: async (ctx, { userId, filter }) => {
    const generationJobs = await ctx.db
      .query("generationJobs")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const mediaFiles = await ctx.db
      .query("mediaFiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    let allContent: (ContentItem & { _tableName: string })[] = [
      ...generationJobs.map((item) => ({ ...item, _tableName: "generationJobs" as const })),
      ...posts.map((item) => ({ ...item, _tableName: "posts" as const })),
      ...mediaFiles.map((item) => ({ ...item, _tableName: "mediaFiles" as const })),
    ];

    if (filter) {
        allContent = allContent.filter(item => {
            if (filter === 'all') return true;
            if (item._tableName === 'posts' && filter === 'text') return true;
            if (item._tableName === 'generationJobs' && filter === 'text') {
                const job = item as Doc<"generationJobs">;
                return ['single', 'batch', 'thread', 'hashtags'].includes(job.type);
            }
            if (item._tableName === 'mediaFiles' && filter === 'image') {
                const file = item as Doc<"mediaFiles">;
                return file.mimeType.startsWith('image/');
            }
            if (item._tableName === 'generationJobs' && filter === 'image') {
                const job = item as Doc<"generationJobs">;
                return job.type === 'image';
            }
            if (item._tableName === 'mediaFiles' && filter === 'video') {
                const file = item as Doc<"mediaFiles">;
                return file.mimeType.startsWith('video/');
            }
            if (item._tableName === 'generationJobs' && filter === 'video') {
                const job = item as Doc<"generationJobs">;
                return job.type === 'video';
            }
            return false;
        });
    }

    return allContent.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const get = query({
    args: {
        _id: v.any(),
        tableName: v.string(),
    },
    handler: async (ctx, { _id, tableName }) => {
        return await ctx.db.get(_id as Id<any>);
    }
})

export const deleteItem = mutation({
    args: {
        _id: v.any(),
        _tableName: v.string(),
    },
    handler: async (ctx, { _id, _tableName }) => {
        await ctx.db.delete(_id as Id<any>);
    }
})
