import { auth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { convexClient } from "@/lib/convex-client";
import { api } from "@convex/_generated/api";
import { NextResponse } from "next/server";

// Fallback templates in case we can't easily import from packages/core/src/templates.js
// Ideally, we'd have shared types and constants.
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
    const jobId = await convexClient.mutation(api.generations.createJob, {
      userId,
      type: "single", // "single" is what's in the schema for single generation
      topic,
      template: templateId,
      model: "gemini-1.5-flash",
      platform: Array.isArray(platforms) && platforms.length > 0 ? platforms[0] : "general",
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
        // Find JSON in the response if it's wrapped in markdown blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : text;
        variations = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", text);
        throw new Error("AI generated an invalid response format.");
      }

      // 3. Update Convex job with success
      await convexClient.mutation(api.generations.completeJob, {
        id: jobId,
        result: {
          variations,
          usage: {
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
            totalTokens: usage.totalTokens,
            // Estimated cost for gemini-1.5-flash: $0.075 / 1M input, $0.3 / 1M output
            // This is a simple approximation
            estimatedCost: (usage.promptTokens * 0.000000075) + (usage.completionTokens * 0.0000003)
          },
        },
      });

      return NextResponse.json({ 
        jobId, 
        variations, 
        usage: {
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens
        }
      });

    } catch (error: any) {
      console.error("Generation error:", error);
      
      // Update Convex job with failure
      await convexClient.mutation(api.generations.failJob, {
        id: jobId,
        error: error.message || "Failed to generate text content",
      });

      return NextResponse.json({ error: "Generation failed", details: error.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
