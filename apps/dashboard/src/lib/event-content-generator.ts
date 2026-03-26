import { EventApiEvent } from "./event-api";

export interface GeneratedContent {
  socialPosts: Array<{
    platform: string;
    text: string;
    hashtags: string[];
  }>;
  newsletterSection?: {
    title: string;
    body: string;
    ctaText: string;
  };
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export function buildEventSocialPrompt(event: EventApiEvent, platform: string): string {
  return `You are a social media content creator for Firefly Events. Generate a compelling ${platform} post for this event.

Event Details:
- Title: ${event.title}
- Description: ${event.description}
- Category: ${event.category}
- Location: ${event.location}, ${event.venue}
- Date: ${event.startDate}${event.endDate ? ` to ${event.endDate}` : ""}
- Organizer: ${event.organizer}
- Tags: ${event.tags.join(", ")}
${event.ticketUrl ? `- Tickets: ${event.ticketUrl}` : ""}

Platform guidelines:
- Instagram: 2200 char max, use emojis, 20-30 hashtags
- Twitter/X: 280 char max, concise, 2-3 hashtags
- LinkedIn: Professional tone, 1300 char max, 3-5 hashtags
- Facebook: Conversational, 500 char ideal, 3-5 hashtags
- TikTok: Trendy, casual, 150 char max, 4-5 hashtags

Return ONLY valid JSON: { "text": "...", "hashtags": ["..."] }`;
}

export function buildNewsletterPrompt(events: EventApiEvent[]): string {
  const eventList = events
    .map(
      (e, i) =>
        `${i + 1}. ${e.title} — ${e.category} at ${e.venue}, ${e.location} (${e.startDate})`
    )
    .join("\n");

  return `You are writing a weekly event newsletter for Firefly Events subscribers. Create engaging newsletter sections for these upcoming events.

Events:
${eventList}

For each event, generate a JSON object with:
- title: catchy section heading
- body: 2-3 sentence description that excites the reader
- ctaText: call-to-action button text

Return ONLY valid JSON array: [{ "title": "...", "body": "...", "ctaText": "..." }]`;
}

export async function generateEventContent(
  events: EventApiEvent[],
  platforms: string[],
  includeNewsletter: boolean = false
): Promise<GeneratedContent> {
  const socialPosts: GeneratedContent["socialPosts"] = [];

  for (const event of events) {
    for (const platform of platforms) {
      const prompt = buildEventSocialPrompt(event, platform);
      const result = await callGemini(prompt);
      try {
        const parsed = JSON.parse(result);
        socialPosts.push({
          platform,
          text: parsed.text || "",
          hashtags: parsed.hashtags || [],
        });
      } catch {
        socialPosts.push({
          platform,
          text: result,
          hashtags: [],
        });
      }
    }
  }

  let newsletterSection: GeneratedContent["newsletterSection"];
  if (includeNewsletter && events.length > 0) {
    const prompt = buildNewsletterPrompt(events);
    const result = await callGemini(prompt);
    try {
      const parsed = JSON.parse(result);
      const first = Array.isArray(parsed) ? parsed[0] : parsed;
      newsletterSection = {
        title: first.title || events[0].title,
        body: first.body || "",
        ctaText: first.ctaText || "Get Tickets",
      };
    } catch {
      newsletterSection = {
        title: events[0].title,
        body: events[0].description,
        ctaText: "Get Tickets",
      };
    }
  }

  return { socialPosts, newsletterSection };
}

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}
