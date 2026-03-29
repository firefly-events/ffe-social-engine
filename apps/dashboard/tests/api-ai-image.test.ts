import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@clerk/nextjs/server";
import { convexClient } from "@/lib/convex-client";

// Define mocks using vi.hoisted to ensure they are available in the mock factory
const { mockGenerateContent, mockGetGenerativeModel } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
  mockGetGenerativeModel: vi.fn(() => ({
    generateContent: vi.fn(), // Placeholder, will be replaced by mockGenerateContent below
  })),
}));

// Re-link the generateContent to our mockGenerateContent
mockGetGenerativeModel.mockReturnValue({
  generateContent: mockGenerateContent
});

vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: class {
      constructor() {}
      getGenerativeModel = mockGetGenerativeModel;
    },
  };
});

// Mock other dependencies
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
    content: {
      create: "content:create",
    },
  },
}));

vi.mock("@/lib/api-helpers", () => ({
  generateId: vi.fn(() => "cnt_123"),
}));

// Import POST after mocks are set up
import { POST } from "../src/app/api/ai/image/route";

describe("POST /api/ai/image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test_key";
  });

  it("should return 401 if unauthorized", async () => {
    (auth as any).mockResolvedValue({ userId: null });
    const req = new Request("http://localhost/api/ai/image", {
      method: "POST",
      body: JSON.stringify({ prompt: "test" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should return 400 if prompt is missing", async () => {
    (auth as any).mockResolvedValue({ userId: "user_123" });
    const req = new Request("http://localhost/api/ai/image", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("prompt is required");
  });

  it("should generate image and persist to convex", async () => {
    (auth as any).mockResolvedValue({ userId: "user_123" });
    
    mockGenerateContent.mockResolvedValue({
      response: {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: "base64data",
                  },
                },
              ],
            },
          },
        ],
      },
    });

    const req = new Request("http://localhost/api/ai/image", {
      method: "POST",
      body: JSON.stringify({ prompt: "a beautiful sunset" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.imageUrl).toBe("data:image/png;base64,base64data");
    expect(convexClient.mutation).toHaveBeenCalledWith("content:create", expect.objectContaining({
      userId: "user_123",
      imageUrl: "data:image/png;base64,base64data",
      prompt: "a beautiful sunset",
    }));
  });

  it("should handle Gemini errors", async () => {
    (auth as any).mockResolvedValue({ userId: "user_123" });
    mockGenerateContent.mockRejectedValue(new Error("Gemini error"));

    const req = new Request("http://localhost/api/ai/image", {
      method: "POST",
      body: JSON.stringify({ prompt: "test prompt" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Failed to generate image");
  });
});
