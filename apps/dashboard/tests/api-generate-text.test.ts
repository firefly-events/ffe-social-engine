import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../src/app/api/generate/text/route";
import { auth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { convexClient } from "@/lib/convex-client";
import { NextResponse } from "next/server";

// Mock dependencies
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@ai-sdk/google", () => ({
  google: vi.fn(() => ({})),
}));

vi.mock("@/lib/convex-client", () => ({
  convexClient: {
    mutation: vi.fn(),
  },
}));

vi.mock("@convex/_generated/api", () => ({
  api: {
    generations: {
      createJob: "generations:createJob",
      completeJob: "generations:completeJob",
      failJob: "generations:failJob",
    },
  },
}));

describe("POST /api/generate/text", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if unauthorized", async () => {
    (auth as any).mockResolvedValue({ userId: null });
    const req = new Request("http://localhost/api/generate/text", {
      method: "POST",
      body: JSON.stringify({ topic: "test" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should return 400 if topic is missing", async () => {
    (auth as any).mockResolvedValue({ userId: "user_123" });
    const req = new Request("http://localhost/api/generate/text", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should generate text and update convex job", async () => {
    (auth as any).mockResolvedValue({ userId: "user_123" });
    (convexClient.mutation as any).mockResolvedValue("job_123");
    (generateText as any).mockResolvedValue({
      text: JSON.stringify({
        short: "short version",
        long: "long version",
        hashtags: "#test #hashtags",
      }),
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      },
    });

    const req = new Request("http://localhost/api/generate/text", {
      method: "POST",
      body: JSON.stringify({ topic: "test topic", style: "casual" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.variations.short).toBe("short version");
    expect(convexClient.mutation).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      userId: "user_123",
      topic: "test topic",
    }));
    expect(convexClient.mutation).toHaveBeenCalledWith("generations:completeJob", expect.objectContaining({
      id: "job_123",
      result: expect.objectContaining({
        usage: expect.objectContaining({ totalTokens: 30 }),
      }),
    }));
  });

  it("should handle generation errors and fail the job", async () => {
    (auth as any).mockResolvedValue({ userId: "user_123" });
    (convexClient.mutation as any).mockResolvedValue("job_123");
    (generateText as any).mockRejectedValue(new Error("AI error"));

    const req = new Request("http://localhost/api/generate/text", {
      method: "POST",
      body: JSON.stringify({ topic: "test topic" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    expect(convexClient.mutation).toHaveBeenCalledWith("generations:failJob", expect.objectContaining({
      id: "job_123",
      error: "AI error",
    }));
  });
});
