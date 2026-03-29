import { auth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { convexClient } from "@/lib/convex-client";
import { api } from "@convex/_generated/api";
import { NextResponse } from "next/server";



const SYSTEM_PROMPT = (style: string, platform: string, aspectRatio: string) =>
  `You are an expert at creating prompts for image generation models.
A user wants to generate an image for the ${platform} platform with a ${style} style and an aspect ratio of ${aspectRatio}.
Your task is to take their input and generate two things:
1. A detailed, rich "description" that an image generation AI can use to create a visually stunning and accurate image. This should be a few sentences long.
2. A concise, improved "suggestedPrompt" that captures the essence of the user's request in a more effective way.

Output must be a valid JSON object with the following structure:
{
  "description": "A detailed, descriptive paragraph for the image generation model.",
  "suggestedPrompt": "A short, refined prompt for the user."
}`;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, style = "photorealistic", platform = "instagram", aspectRatio = "1:1" } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 1. Create a pending job in Convex
    const jobId = await convexClient.mutation(api.generationJobs.create, {
      userId,
      type: "image",
      topic: prompt, // Map prompt to topic
      model: "gemini-1.5-flash",
      platform,
      status: "pending",
    });

    if (!jobId) {
      throw new Error("Failed to create a new job in Convex.");
    }

    try {
      // 2. Generate content with AI
      const systemPrompt = SYSTEM_PROMPT(style, platform, aspectRatio);

      const { text } = await generateText({
        model: google("gemini-1.5-flash"),
        system: systemPrompt,
        prompt: `User's idea: "${prompt}".`,
      });

      let generatedContent;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : text;
        generatedContent = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse AI response as JSON:", text);
        throw new Error("AI generated an invalid response format.");
      }

      const { description, suggestedPrompt } = generatedContent;

      if (!description || !suggestedPrompt) {
        throw new Error("AI response is missing required fields.");
      }

      // 3. Update the job with the result
      await convexClient.mutation(api.generationJobs.update, {
        id: jobId._id,
        status: "completed",
        result: { description, suggestedPrompt, style, aspectRatio },
        completedAt: Date.now(),
      });

      // 4. Return the response
      return NextResponse.json({
        jobId: jobId._id,
        description,
        suggestedPrompt,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to generate content";
      console.error("Generation error:", error);

      // Update Convex job with failure
      await convexClient.mutation(api.generationJobs.update, {
        id: jobId._id,
        status: "failed",
        error: message,
      });

      return NextResponse.json({ error: "Generation failed", details: message }, { status: 500 });
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("API error in /api/generate/image:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
