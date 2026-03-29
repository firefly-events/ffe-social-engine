import { auth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { convexClient } from "@/lib/convex-client";
import { api } from "@convex/_generated/api";
import { NextResponse } from "next/server";

const FALLBACK_SYSTEM_PROMPT = (topic: string, style: string) =>
  `You are an expert social media manager. Generate high-quality content about "${topic}" in a ${style} tone.
   Output must be a valid JSON object with the following structure:
   {
     "short": "A catchy, concise social media caption (1-2 sentences).",
     "long": "A detailed, informative long-form post or a multi-part thread.",
     "hashtags": "A string containing 10-15 relevant and trending hashtags."
   }`;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, style = "professional", templateId, platforms = [] } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // 1. Create Convex job: status='pending'.
    const jobId = await convexClient.mutation(api.generationJobs.create, {
      userId,
      type: "single",
      topic,
      template: templateId,
      model: "gemini-1.5-flash",
      platform: Array.isArray(platforms) && platforms.length > 0 ? platforms[0] : "general",
      status: "pending",
    });

    try {
      // 2. Generate content with AI
      const systemPrompt = FALLBACK_SYSTEM_PROMPT(topic, style);

      const { text, usage } = await generateText({
        model: google("gemini-1.5-flash"),
        system: systemPrompt,
        prompt: `Create content for the topic: "${topic}". Target platforms: ${platforms.join(", ")}. Ensure the output is strictly valid JSON.`,
      });

      // Try to parse the JSON output
      let variations;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : text;
        variations = JSON.parse(jsonStr);
      } catch {
        console.error("Failed to parse AI response as JSON:", text);
        throw new Error("AI generated an invalid response format.");
      }

      // 3. Update Convex job with success
      if (jobId?._id) {
        await convexClient.mutation(api.generationJobs.update, {
          id: jobId._id,
          status: "completed",
          result: variations,
          completedAt: Date.now(),
        });
      }

      return NextResponse.json({
        jobId: jobId?._id,
        variations,
        usage: {
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens
        }
      });

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to generate text content";
      console.error("Generation error:", error);

      // Update Convex job with failure
      if (jobId?._id) {
        await convexClient.mutation(api.generationJobs.update, {
          id: jobId._id,
          status: "failed",
          error: message,
        });
      }

      return NextResponse.json({ error: "Generation failed", details: message }, { status: 500 });
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
