import { auth } from "@clerk/nextjs/server";
import { convexClient } from "@/lib/convex-client";
import { api } from "@convex/_generated/api";
import { unauthorized, badRequest, ok, serverError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return unauthorized();
  }

  try {
    const { content } = await req.json();

    if (!content || typeof content !== "string" || content.length < 10 || content.length > 10000) {
      return badRequest("Content must be between 10 and 10,000 characters.");
    }

    const jobId = await convexClient.mutation(api.generations.createJob, {
      userId,
      type: "single",
      topic: content,
      model: "gemini-1.5-flash",
    });

    return ok({ jobId });
  } catch (error) {
    console.error("[GENERATE_START]", error);
    return serverError();
  }
}
