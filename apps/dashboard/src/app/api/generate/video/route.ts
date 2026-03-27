import { auth } from "@clerk/nextjs/server";
import { convexClient } from "@/lib/convex-client";
import { api } from "@convex/_generated/api";
import { NextResponse } from "next/server";

/**
 * POST /api/generate/video
 * Initiates async video generation. Returns jobId for polling.
 *
 * GET /api/generate/video?jobId=xxx
 * Polls job status and returns video URL when complete.
 *
 * Body (POST):
 *   prompt: string (required)
 *   duration: 5 | 6 | 10 (seconds, default: 6)
 *   aspectRatio: "16:9" | "9:16" | "1:1" (default: "16:9")
 *   imageUrl: string (optional, for image-to-video)
 */

const POLL_TIMEOUT_MS = 120_000; // 2 min max wait inline (for sync-style API calls)

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      prompt,
      duration = 6,
      aspectRatio = "16:9",
      imageUrl,
    } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const clampedDuration = Math.min(Math.max(duration, 5), 15);

    // Create pending job
    const jobId = await convexClient.mutation(api.generations.createJob, {
      userId,
      type: "video",
      topic: prompt,
      model: process.env.VIDEO_GENERATION_MODEL ?? "minimax-video-01",
      platform: "general",
    });

    // Respond immediately with jobId for client polling
    // In background, we initiate the generation and update Convex
    generateVideoInBackground(jobId, userId, prompt, clampedDuration, aspectRatio, imageUrl);

    return NextResponse.json({
      jobId,
      status: "pending",
      message: "Video generation started. Poll GET /api/generate/video?jobId=" + jobId,
    });

  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    // Query Convex for job status
    const job = await convexClient.query(api.generations.getJob, { id: jobId as any });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Verify ownership
    if (job.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      jobId,
      status: job.status,
      videoUrl: job.result?.videoUrl ?? null,
      thumbnailUrl: job.result?.thumbnailUrl ?? null,
      provider: job.result?.provider ?? null,
      duration: job.result?.duration ?? null,
      estimatedCost: job.result?.estimatedCost ?? null,
      error: job.error ?? null,
    });

  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function generateVideoInBackground(
  jobId: string,
  userId: string,
  prompt: string,
  duration: number,
  aspectRatio: string,
  imageUrl?: string,
) {
  try {
    let videoUrl: string;
    let thumbnailUrl: string | undefined;
    let provider: string;
    let estimatedCost = 0;

    const falApiKey = process.env.FAL_KEY;
    const replicateApiKey = process.env.REPLICATE_API_TOKEN;

    if (falApiKey) {
      // fal.ai - Hailuo MiniMax Video 01
      provider = "fal-minimax";
      const modelId = imageUrl ? "fal-ai/minimax-video/image-to-video" : "fal-ai/minimax-video";

      const response = await fetch(`https://queue.fal.run/${modelId}`, {
        method: "POST",
        headers: {
          "Authorization": `Key ${falApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          ...(imageUrl ? { image_url: imageUrl } : {}),
        }),
      });

      if (!response.ok) throw new Error(`fal.ai error: ${await response.text()}`);

      const queueResult = await response.json();
      const requestId = queueResult.request_id;

      // Poll fal.ai queue
      let result: any = null;
      const deadline = Date.now() + POLL_TIMEOUT_MS;
      while (Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 3000));
        const statusRes = await fetch(`https://queue.fal.run/${modelId}/requests/${requestId}`, {
          headers: { "Authorization": `Key ${falApiKey}` },
        });
        const statusData = await statusRes.json();
        if (statusData.status === "COMPLETED") {
          result = statusData.output;
          break;
        }
        if (statusData.status === "FAILED") {
          throw new Error("fal.ai generation failed");
        }
      }

      if (!result?.video?.url) throw new Error("No video URL in fal.ai response");
      videoUrl = result.video.url;
      estimatedCost = 0.07; // ~$0.07 per 6s clip

    } else if (replicateApiKey) {
      // Replicate - minimax/video-01
      provider = "replicate";
      const createRes = await fetch("https://api.replicate.com/v1/models/minimax/video-01/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${replicateApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            prompt,
            ...(imageUrl ? { first_frame_image: imageUrl } : {}),
          },
        }),
      });

      if (!createRes.ok) throw new Error("Replicate API error");
      const prediction = await createRes.json();

      let result = prediction;
      const deadline = Date.now() + POLL_TIMEOUT_MS;
      while (Date.now() < deadline && result.status !== "succeeded" && result.status !== "failed") {
        await new Promise(r => setTimeout(r, 3000));
        const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
          headers: { "Authorization": `Bearer ${replicateApiKey}` },
        });
        result = await pollRes.json();
      }

      if (result.status !== "succeeded" || !result.output) {
        throw new Error("Replicate video generation failed");
      }

      videoUrl = typeof result.output === "string" ? result.output : result.output[0];
      estimatedCost = 0.10;

    } else {
      // No API key — dev placeholder
      provider = "placeholder";
      videoUrl = "";
      thumbnailUrl = `https://placehold.co/1280x720/1a1a2e/8B5CF6?text=${encodeURIComponent(prompt.slice(0, 15))}`;
      // Simulate a short delay for dev
      await new Promise(r => setTimeout(r, 1000));
    }

    await convexClient.mutation(api.generations.completeJob, {
      id: jobId as any,
      result: {
        videoUrl,
        thumbnailUrl,
        provider,
        duration,
        aspectRatio,
        estimatedCost,
      },
    });

  } catch (error: any) {
    console.error("Background video generation error:", error);
    await convexClient.mutation(api.generations.failJob, {
      id: jobId as any,
      error: error.message ?? "Video generation failed",
    });
  }
}
