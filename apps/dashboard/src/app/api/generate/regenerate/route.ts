import { auth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { convexClient } from "@/lib/convex-client";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { NextResponse } from "next/server";

/**
 * POST /api/generate/regenerate
 *
 * Re-runs a generation for a specific asset type, linked to the original job.
 * Tracks regeneration count and logs cost for the usage dashboard.
 *
 * Body: { jobId, type, sessionId?, userId? }
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, type, sessionId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }
    if (!type || !["text", "image", "video"].includes(type)) {
      return NextResponse.json(
        { error: "type must be one of: text, image, video" },
        { status: 400 }
      );
    }

    // Fetch the original job to reuse its params
    const originalJob = await convexClient.query(api.generations.listJobs, {
      userId,
      limit: 50,
    });
    const job = originalJob.find((j: { _id: string }) => j._id === jobId);

    if (!job || (job as { userId: string }).userId !== userId) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const { topic, platform, template, model: originalModel } = job as {
      topic: string;
      platform?: string;
      template?: string;
      model: string;
    };

    // Create a new Convex job linked to the original
    const newJobId = await convexClient.mutation(api.generations.createJob, {
      userId,
      type: type,
      topic,
      platform,
      template,
      model: "gemini-1.5-flash",
    });

    try {
      // Re-run generation (text type only for now; image/video are stubs)
      if (type === "text") {
        const systemPrompt = `You are an expert social media manager. Regenerate high-quality content about "${topic}".
Output must be a valid JSON object with:
{
  "short": "A catchy, concise social media caption (1-2 sentences).",
  "long": "A detailed, informative long-form post.",
  "hashtags": "A string containing 10-15 relevant hashtags."
}`;

        const { text, usage } = await generateText({
          model: google("gemini-1.5-flash"),
          system: systemPrompt,
          prompt: `Regenerate content for: "${topic}". Platform: ${platform ?? "general"}. Produce fresh variations. Output strictly valid JSON.`,
        });

        let variations;
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          const jsonStr = jsonMatch ? jsonMatch[0] : text;
          variations = JSON.parse(jsonStr);
        } catch {
          throw new Error("AI generated an invalid response format.");
        }

        const estimatedCost =
          (usage.promptTokens * 0.000000075) + (usage.completionTokens * 0.0000003);

        await convexClient.mutation(api.generations.completeJob, {
          id: newJobId as Id<"generationJobs">,
          result: {
            variations,
            parentJobId: jobId,
            regenerated: true,
            usage: {
              promptTokens: usage.promptTokens,
              completionTokens: usage.completionTokens,
              totalTokens: usage.totalTokens,
              estimatedCost,
            },
          },
        });

        return NextResponse.json({
          jobId: newJobId,
          parentJobId: jobId,
          type,
          variations,
          usage: {
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
            totalTokens: usage.totalTokens,
            estimatedCost,
          },
        });
      }

      // Image/video regeneration: stub — mark completed with placeholder
      await convexClient.mutation(api.generations.completeJob, {
        id: newJobId as Id<"generationJobs">,
        result: {
          parentJobId: jobId,
          regenerated: true,
          stub: true,
          message: `${type} regeneration queued (pipeline integration pending)`,
        },
      });

      return NextResponse.json({
        jobId: newJobId,
        parentJobId: jobId,
        type,
        stub: true,
        message: `${type} regeneration queued`,
      });

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Regeneration failed";
      console.error("Regeneration error:", error);

      await convexClient.mutation(api.generations.failJob, {
        id: newJobId as Id<"generationJobs">,
        error: message,
      });

      return NextResponse.json({ error: "Regeneration failed", details: message }, { status: 500 });
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
