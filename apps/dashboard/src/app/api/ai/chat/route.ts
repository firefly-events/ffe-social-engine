import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

function getModel(modelSpec: string) {
  switch (modelSpec) {
    case 'gemini-flash':
      return google('gemini-1.5-flash');
    case 'gemini-pro':
      return google('gemini-1.5-pro');
    case 'claude-haiku':
      return anthropic('claude-haiku-4-5-20251001');
    case 'claude-sonnet':
      return anthropic('claude-sonnet-4-6');
    default:
      return google('gemini-1.5-flash');
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages, model = 'gemini-flash', template, platform } = await req.json();

  const platformGuides: Record<string, string> = {
    tiktok: 'TikTok: Casual, trendy, use hooks in first 3 words. Max 2200 chars. Hashtags: 3-5 trending.',
    instagram: 'Instagram: Visual-first captions, emoji-friendly, 2200 char max. Include CTA. Hashtags: 5-15 relevant.',
    x: 'X/Twitter: Punchy, max 280 chars. Thread-friendly. 1-2 hashtags max.',
    linkedin: 'LinkedIn: Professional, insightful, storytelling format. 3000 char max. Minimal hashtags.',
    youtube: 'YouTube: SEO-optimized titles (60 chars), descriptions (5000 chars), tags. Hook in first line.',
    facebook: 'Facebook: Conversational, question-driven, 63K char max. Encourage shares/comments.',
    threads: 'Threads: Conversational, authentic, 500 char max. No hashtags typically.',
    bluesky: 'Bluesky: Authentic, community-focused, 300 char max.',
  };

  const platformGuide = platformGuides[platform || ''] || 'General social media best practices.';

  const systemPrompt = `You are an expert social media content creator and copywriter for FFE Social Engine.

PLATFORM: ${platform || 'general'}
${platformGuide}
${template ? `TEMPLATE: "${template}" — follow this content framework.` : ''}

INSTRUCTIONS:
- Generate ready-to-post content the user can copy and use immediately
- When asked to "create posts" or "generate content", provide 3 variations by default
- Format each variation clearly with a number and the full post text
- Include relevant hashtags inline or at the end
- Include a suggested CTA (call to action) when appropriate
- If the user asks for a thread, format as numbered posts (1/N, 2/N, etc.)
- Be specific, not generic — use concrete language and hooks
- Match the platform's tone and character limits precisely`;

  const result = streamText({
    model: getModel(model),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
