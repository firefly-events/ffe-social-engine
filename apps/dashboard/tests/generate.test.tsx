import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GeneratePage from "../src/app/(dashboard)/dashboard/generate/page";

// Mock Next.js useRouter
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Clerk
vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({
    user: { id: "user_123", firstName: "Test" },
  }),
  UserButton: () => <div>UserButton</div>,
}));

// Mock fetch
global.fetch = vi.fn();

describe("GeneratePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the textarea and button", () => {
    render(<GeneratePage />);
    expect(screen.getByLabelText(/What is your post or video about\?/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Generate Content/i })).toBeInTheDocument();
  });

  it("shows error if content is too short", async () => {
    render(<GeneratePage />);
    const textarea = screen.getByLabelText(/What is your post or video about\?/i);
    const button = screen.getByRole("button", { name: /Generate Content/i });

    fireEvent.change(textarea, { target: { value: "too short" } });
    fireEvent.click(button);

    expect(screen.getByText(/Please enter at least 10 characters\./i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("calls fetch and shows success state on successful generation", async () => {
    const mockJobId = "job_123";
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ jobId: mockJobId }),
    });

    render(<GeneratePage />);
    const textarea = screen.getByLabelText(/What is your post or video about\?/i);
    const button = screen.getByRole("button", { name: /Generate Content/i });

    fireEvent.change(textarea, { target: { value: "A valid content that is more than 10 characters long." } });
    fireEvent.click(button);

    expect(button).toHaveTextContent(/Processing\.\.\./i);

    await waitFor(() => {
      expect(screen.getByText(/Job started!/i)).toBeInTheDocument();
    });

    expect(screen.getByText(mockJobId)).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith("/api/generate/start", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ content: "A valid content that is more than 10 characters long." }),
    }));
  });

  it("shows error if fetch fails", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Some server error" }),
    });

    render(<GeneratePage />);
    const textarea = screen.getByLabelText(/What is your post or video about\?/i);
    const button = screen.getByRole("button", { name: /Generate Content/i });

    fireEvent.change(textarea, { target: { value: "A valid content that is more than 10 characters long." } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Some server error/i)).toBeInTheDocument();
    });
  });

  it("navigates back to dashboard on button click in success state", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ jobId: "job_123" }),
    });

    render(<GeneratePage />);
    const textarea = screen.getByLabelText(/What is your post or video about\?/i);
    const button = screen.getByRole("button", { name: /Generate Content/i });

    fireEvent.change(textarea, { target: { value: "A valid content that is more than 10 characters long." } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Job started!/i)).toBeInTheDocument();
    });

    const backButton = screen.getByRole("button", { name: /Back to Dashboard/i });
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });
});
