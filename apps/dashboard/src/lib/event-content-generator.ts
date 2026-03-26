import { GoogleGenerativeAI } from "@google/generative-ai";
import { EventData } from "./event-api";

function getAIClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

/** Strip dangerous HTML tags and attributes from AI-generated content */
function sanitizeHtml(html: string): string {
  // Remove dangerous tags and their contents
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  sanitized = sanitized.replace(/<embed\b[^>]*\/?>/gi, "");
  sanitized = sanitized.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "");
  // Remove on* event handler attributes
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // Remove javascript: URLs
  sanitized = sanitized.replace(/href\s*=\s*["']?\s*javascript\s*:[^"'>]*/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*["']?\s*javascript\s*:[^"'>]*/gi, 'src=""');
  return sanitized;
}

/** Escape HTML entities to prevent XSS */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Validate and sanitize a URL — only allow http/https */
function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
    return null;
  } catch {
    return null;
  }
}

// Fallback templates

function fallbackSocialPost(event: EventData, platform: string): string {
  const description = event.description?.slice(0, 100) || "";
  const suffix = description.length >= 100 ? "..." : "";
  const locationStr = event.location ? ` at ${event.location}` : "";

  if (platform === "twitter") {
    return `Don't miss ${event.title} on ${event.date}${locationStr}! ${description}${suffix}`;
  }

  const safeUrl = event.url ? sanitizeUrl(event.url) : null;
  return `Don't miss ${event.title} on ${event.date}${locationStr}!\n\n${description}${suffix}${safeUrl ? `\n\n${safeUrl}` : ""}`.trim();
}

function fallbackWeeklyDigest(events: EventData[]): string {
  const eventCards = events
    .map((event) => {
      const safeUrl = event.url ? sanitizeUrl(event.url) : null;
      const desc = event.description?.slice(0, 150) || "";
      const ellipsis = (event.description?.length || 0) > 150 ? "..." : "";
      return `
      <div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:16px;">
        <h2 style="margin:0 0 8px;color:#1a202c;">${escapeHtml(event.title)}</h2>
        <p style="margin:0 0 4px;color:#718096;font-size:14px;">${escapeHtml(event.date)}${event.location ? ` | ${escapeHtml(event.location)}` : ""}</p>
        <p style="margin:0 0 8px;color:#4a5568;">${escapeHtml(desc)}${ellipsis}</p>
        ${safeUrl ? `<a href="${escapeHtml(safeUrl)}" style="color:#3182ce;text-decoration:none;">Learn more &rarr;</a>` : ""}
      </div>`;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1a202c;">
      <h1 style="color:#2d3748;border-bottom:2px solid #3182ce;padding-bottom:8px;">Weekly Events Digest</h1>
      <p style="color:#718096;">Here are the upcoming events you won't want to miss:</p>
      ${eventCards || "<p>No upcoming events this week.</p>"}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <p style="color:#a0aec0;font-size:12px;">Powered by Firefly Events</p>
    </body>
    </html>`;
}

// AI-powered generation

export async function generateSocialPost(
  event: EventData,
  platform: string
): Promise<string> {
  const client = getAIClient();
  if (!client) {
    return fallbackSocialPost(event, platform);
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

    const platformGuidance: Record<string, string> = {
      twitter: "Keep it under 280 characters. Be punchy and engaging. Use 1-2 relevant hashtags.",
      instagram: "Be visual and descriptive. Use relevant emojis and hashtags. Encourage engagement.",
      linkedin: "Be professional and informative. Highlight networking opportunities and value.",
      facebook: "Be friendly and community-oriented. Encourage sharing and attendance.",
    };

    const prompt = `Generate a social media post for ${platform} about this event:
Title: ${event.title}
Date: ${event.date}
Location: ${event.location}
Description: ${event.description}
${event.category ? `Category: ${event.category}` : ""}

Guidelines: ${platformGuidance[platform] || "Be engaging and informative."}

Return ONLY the post text, no explanations or formatting.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return text || fallbackSocialPost(event, platform);
  } catch (error) {
    console.error("AI social post generation failed:", error);
    return fallbackSocialPost(event, platform);
  }
}

export async function generateWeeklyDigest(
  events: EventData[]
): Promise<string> {
  const client = getAIClient();
  if (!client || events.length === 0) {
    return fallbackWeeklyDigest(events);
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

    const eventSummaries = events
      .map(
        (e) =>
          `- ${e.title} (${e.date}, ${e.location}): ${e.description?.slice(0, 100) || "No description"}`
      )
      .join("\n");

    const prompt = `Generate an HTML email newsletter digest for these upcoming events:

${eventSummaries}

Requirements:
- Use inline CSS styles (no external stylesheets)
- Include a header "Weekly Events Digest"
- Each event should have a card-like section with title, date, location, and brief description
- Use a clean, modern design with a professional color scheme
- Include a footer with "Powered by Firefly Events"
- Return ONLY the HTML, no explanations or markdown code blocks`;

    const result = await model.generateContent(prompt);
    const html = result.response.text().trim();

    // Basic validation that we got HTML back
    if (html.includes("<") && html.includes(">")) {
      return sanitizeHtml(html);
    }
    return fallbackWeeklyDigest(events);
  } catch (error) {
    console.error("AI weekly digest generation failed:", error);
    return fallbackWeeklyDigest(events);
  }
}
