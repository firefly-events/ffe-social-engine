import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock dependencies — must be defined before importing route handlers
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/convex-client", () => ({
  convexClient: {
    mutation: vi.fn(),
    query: vi.fn(),
  },
}));

vi.mock("@convex/_generated/api", () => ({
  api: {
    generationJobs: {
      create: "generationJobs:create",
      getByExternalId: "generationJobs:getByExternalId",
      update: "generationJobs:update",
    },
    content: {
      create: "content:create",
    },
  },
}));

vi.mock("@/lib/api-helpers", () => ({
  generateId: vi.fn(() => "cnt_456"),
}));

// Import route handlers AFTER mocks are defined
import { POST } from "../src/app/api/ai/video/route";
import { GET } from "../src/app/api/ai/video/[jobId]/route";
import { auth } from "@clerk/nextjs/server";
import { convexClient } from "@/lib/convex-client";

describe("Video AI API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.HAILUO_API_KEY;
  });

  afterEach(() => {
    delete process.env.HAILUO_API_KEY;
  });

  describe("POST /api/ai/video", () => {
    it("should return 401 if unauthorized", async () => {
      (auth as any).mockResolvedValue({ userId: null });
      const req = new Request("http://localhost/api/ai/video", {
        method: "POST",
        body: JSON.stringify({ prompt: "test" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it("should return 400 if prompt is missing", async () => {
      (auth as any).mockResolvedValue({ userId: "user_123" });
      const req = new Request("http://localhost/api/ai/video", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("prompt is required");
    });

    it("should return 400 for invalid aspectRatio", async () => {
      (auth as any).mockResolvedValue({ userId: "user_123" });
      const req = new Request("http://localhost/api/ai/video", {
        method: "POST",
        body: JSON.stringify({ prompt: "test", aspectRatio: "4:3" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("aspectRatio");
    });

    it("should return 400 for invalid duration", async () => {
      (auth as any).mockResolvedValue({ userId: "user_123" });
      const req = new Request("http://localhost/api/ai/video", {
        method: "POST",
        body: JSON.stringify({ prompt: "test", duration: 999 }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("duration");
    });

    it("should start a video generation job in demo mode when HAILUO_API_KEY is absent", async () => {
      (auth as any).mockResolvedValue({ userId: "user_123" });

      const req = new Request("http://localhost/api/ai/video", {
        method: "POST",
        body: JSON.stringify({ prompt: "a cute cat playing with yarn" }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.jobId).toBeDefined();
      expect(data.status).toBe("processing");
      expect(data.demo).toBe(true);
      // Demo mode must NOT record a real Hailuo generation job in Convex
      expect(convexClient.mutation).not.toHaveBeenCalledWith("generationJobs:create", expect.anything());
    });

    it("should start a real Hailuo generation job when HAILUO_API_KEY is set", async () => {
      process.env.HAILUO_API_KEY = "test_key";
      (auth as any).mockResolvedValue({ userId: "user_123" });
      (convexClient.mutation as any).mockResolvedValue({ _id: "job_id_123" });

      const req = new Request("http://localhost/api/ai/video", {
        method: "POST",
        body: JSON.stringify({ prompt: "a cute cat playing with yarn" }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.jobId).toBeDefined();
      expect(data.status).toBe("processing");
      expect(data.demo).toBeUndefined();
      expect(convexClient.mutation).toHaveBeenCalledWith("generationJobs:create", expect.objectContaining({
        userId: "user_123",
        type: "video",
        model: "hailuo-video-01",
      }));
    });
  });

  describe("GET /api/ai/video/[jobId]", () => {
    it("should return 401 if unauthorized", async () => {
      (auth as any).mockResolvedValue({ userId: null });
      const params = Promise.resolve({ jobId: "job_123" });
      const res = await GET(new Request("http://localhost/api/ai/video/job_123"), { params });
      expect(res.status).toBe(401);
    });

    it("should return 404 if job not found", async () => {
      (auth as any).mockResolvedValue({ userId: "user_123" });
      (convexClient.query as any).mockResolvedValue(null);

      const params = Promise.resolve({ jobId: "job_not_found" });
      const res = await GET(new Request("http://localhost/api/ai/video/job_not_found"), { params });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("Job not found");
    });

    it("should return 403 if job belongs to another user", async () => {
      (auth as any).mockResolvedValue({ userId: "user_123" });
      (convexClient.query as any).mockResolvedValue({ userId: "other_user" });

      const params = Promise.resolve({ jobId: "job_123" });
      const res = await GET(new Request("http://localhost/api/ai/video/job_123"), { params });

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toBe("Forbidden");
    });

    it("should return job status", async () => {
      (auth as any).mockResolvedValue({ userId: "user_123" });
      (convexClient.query as any).mockResolvedValue({
        userId: "user_123",
        status: "ready",
        result: { videoUrl: "https://test.com/video.mp4" },
      });

      const params = Promise.resolve({ jobId: "job_123" });
      const res = await GET(new Request("http://localhost/api/ai/video/job_123"), { params });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("ready");
      expect(data.videoUrl).toBe("https://test.com/video.mp4");
    });

    it("should return processing status", async () => {
      (auth as any).mockResolvedValue({ userId: "user_123" });
      (convexClient.query as any).mockResolvedValue({
        userId: "user_123",
        status: "processing",
      });

      const params = Promise.resolve({ jobId: "job_123" });
      const res = await GET(new Request("http://localhost/api/ai/video/job_123"), { params });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("processing");
    });

    it("should return error status", async () => {
      (auth as any).mockResolvedValue({ userId: "user_123" });
      (convexClient.query as any).mockResolvedValue({
        userId: "user_123",
        status: "error",
        error: "Generation failed",
      });

      const params = Promise.resolve({ jobId: "job_123" });
      const res = await GET(new Request("http://localhost/api/ai/video/job_123"), { params });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("error");
      expect(data.error).toBe("Generation failed");
    });
  });
});
