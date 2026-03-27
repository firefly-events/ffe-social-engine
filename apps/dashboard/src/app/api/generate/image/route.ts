import { auth } from "@clerk/nextjs/server";
import { convexClient } from "@/lib/convex-client";
import { api } from "@convex/_generated/api";
import { NextResponse } from "next/server";

/**
 * POST /api/generate/image
 *
 * Generates an image from a text prompt using available providers.
 * Primary: Together AI / Replicate (FLUX model)
 * Fallback: Returns a placeholder with job tracking when no API key configured
 *
 * Body:
 *   prompt: string (required)
 *   aspectRatio: "1:1" | "16:9" | "9:16" | "4:3" (default: "1:1")
 *   style: "realistic" | "artistic" | "cartoon" | "professional" (default: "realistic")
 *   platforms: string[] (optional, for platform-optimized sizing)
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      prompt,
      aspectRatio = "1:1",
      style = "realistic",
      platforms = [],
    } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Map aspect ratio to width/height
    const dimensions: Record<string, { width: number; height: number }> = {
      "1:1":  { width: 1024, height: 1024 },
      "16:9": { width: 1344, height: 768 },
      "9:16": { width: 768,  height: 1344 },
      "4:3":  { width: 1152, height: 896 },
    };
    const { width, height } = dimensions[aspectRatio] ?? dimensions["1:1"];

    // Create pending job in Convex
    const jobId = await convexClient.mutation(api.generations.createJob, {
      userId,
      type: "image",
      topic: prompt,
      model: process.env.IMAGE_GENERATION_MODEL ?? "flux-schnell",
      platform: platforms[0] ?? "general",
    });

    try {
      let imageUrl: string;
      let provider: string;
      let estimatedCost = 0;

      const togetherApiKey = process.env.TOGETHER_API_KEY;
      const replicateApiKey = process.env.REPLICATE_API_TOKEN;

      if (togetherApiKey) {
        // Together AI - FLUX.1-schnell
        provider = "together-ai";
        const response = await fetch("https://api.together.xyz/v1/images/generations", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${togetherApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "black-forest-labs/FLUX.1-schnell-Free",
            prompt: `${prompt}. Style: ${style}. High quality, social media optimized.`,
            width,
            height,
            steps: 4,
            n: 1,
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          throw new Error(`Together AI error: ${err}`);
        }

        const data = await response.json();
        imageUrl = data.data?.[0]?.url;
        if (!imageUrl) throw new Error("No image URL in Together AI response");
        estimatedCost = 0.0; // FLUX.1-schnell-Free is free

      } else if (replicateApiKey) {
        // Replicate - FLUX schnell
        provider = "replicate";
        const createRes = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${replicateApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: {
              prompt: `${prompt}. Style: ${style}.`,
              aspect_ratio: aspectRatio,
              output_format: "webp",
              output_quality: 80,
              num_outputs: 1,
            },
          }),
        });

        if (!createRes.ok) throw new Error("Replicate API error");
        const prediction = await createRes.json();

        // Poll for completion (up to 30s)
        let result = prediction;
        let attempts = 0;
        while (result.status !== "succeeded" && result.status !== "failed" && attempts < 30) {
          await new Promise(r => setTimeout(r, 1000));
          const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
            headers: { "Authorization": `Bearer ${replicateApiKey}` },
          });
          result = await pollRes.json();
          attempts++;
        }

        if (result.status !== "succeeded" || !result.output?.[0]) {
          throw new Error("Replicate generation failed or timed out");
        }

        imageUrl = result.output[0];
        estimatedCost = 0.003; // ~$0.003 per image for flux-schnell on Replicate

      } else {
        // No API key — return a placeholder for development
        provider = "placeholder";
        imageUrl = `https://placehold.co/${width}x${height}/1a1a2e/8B5CF6?text=${encodeURIComponent(prompt.slice(0, 20))}`;
        estimatedCost = 0;
      }

      // Update Convex job with success
      await convexClient.mutation(api.generations.completeJob, {
        id: jobId,
        result: {
          imageUrl,
          provider,
          width,
          height,
          aspectRatio,
          style,
          estimatedCost,
        },
      });

      return NextResponse.json({
        jobId,
        imageUrl,
        provider,
        width,
        height,
        aspectRatio,
        style,
        estimatedCost,
      });

    } catch (error: any) {
      console.error("Image generation error:", error);
      await convexClient.mutation(api.generations.failJob, {
        id: jobId,
        error: error.message ?? "Image generation failed",
      });
      return NextResponse.json(
        { error: "Image generation failed", details: error.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
