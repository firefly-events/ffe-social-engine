import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../src/app/api/generate/start/route";
import { auth } from "@clerk/nextjs/server";
import { convexClient } from "@/lib/convex-client";

// Mock dependencies
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
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
    },
  },
}));

describe("POST /api/generate/start", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if unauthorized", async () => {
    (auth as any).mockResolvedValue({ userId: null });
    const req = new Request("http://localhost/api/generate/start", {
      method: "POST",
      body: JSON.stringify({ content: "Some long enough content" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 if content is missing", async () => {
    (auth as any).mockResolvedValue({ userId: "user_123" });
    const req = new Request("http://localhost/api/generate/start", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Content must be between 10 and 10,000 characters.");
  });

  it("should return 400 if content is too short", async () => {
    (auth as any).mockResolvedValue({ userId: "user_123" });
    const req = new Request("http://localhost/api/generate/start", {
      method: "POST",
      body: JSON.stringify({ content: "too short" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Content must be between 10 and 10,000 characters.");
  });

  it("should create a job and return 200 on success", async () => {
    const mockUserId = "user_123";
    const mockContent = "This is a valid content for generation.";
    const mockJobId = "job_abc123";

    (auth as any).mockResolvedValue({ userId: mockUserId });
    (convexClient.mutation as any).mockResolvedValue(mockJobId);

    const req = new Request("http://localhost/api/generate/start", {
      method: "POST",
      body: JSON.stringify({ content: mockContent }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.jobId).toBe(mockJobId);

    expect(convexClient.mutation).toHaveBeenCalledWith("generations:createJob", {
      userId: mockUserId,
      type: "single",
      topic: mockContent,
      model: "gemini-1.5-flash",
    });
  });

  it("should return 500 if convex mutation fails", async () => {
    (auth as any).mockResolvedValue({ userId: "user_123" });
    (convexClient.mutation as any).mockRejectedValue(new Error("Convex error"));

    const req = new Request("http://localhost/api/generate/start", {
      method: "POST",
      body: JSON.stringify({ content: "Valid content for generation" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Internal server error");
  });
});
