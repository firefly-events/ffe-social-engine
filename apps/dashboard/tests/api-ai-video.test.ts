import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../src/app/api/ai/video/route";
import { GET } from "../src/app/api/ai/video/[jobId]/route";
import { auth } from "@clerk/nextjs/server";
import { convexClient } from "@/lib/convex-client";

// Mock dependencies
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

describe("Video AI API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    it("should start a video generation job", async () => {
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
