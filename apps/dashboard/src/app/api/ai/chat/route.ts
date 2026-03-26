import { auth } from '@clerk/nextjs/server';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are the FFE Social Engine AI assistant. You help users create compelling social media content for Firefly Events — a platform for live events, festivals, and venues.

When given a campaign brief, you generate engaging posts, captions, and hashtag suggestions tailored to the requested platform (TikTok, Instagram, Twitter/X, etc.). Be creative, concise, and on-brand.`;

type Model = 'gemini-flash' | 'claude-sonnet';

function getModel(modelId: Model) {
  if (modelId === 'claude-sonnet') {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return anthropic('claude-sonnet-4-5');
  }
  const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
  return google('gemini-1.5-flash');
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages, model = 'gemini-flash' } = await req.json();

  const result = streamText({
    model: getModel(model as Model),
    system: SYSTEM_PROMPT,
    messages,
  });

  return result.toDataStreamResponse();
}
