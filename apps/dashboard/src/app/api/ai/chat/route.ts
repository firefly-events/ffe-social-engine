import { streamText } from 'ai';
import { createVertex } from '@ai-sdk/google-vertex';
import { anthropic } from '@ai-sdk/anthropic';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

function getVertex() {
  const saKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  return createVertex({
    project: process.env.GOOGLE_CLOUD_PROJECT ?? 'social-engine-dev',
    location: process.env.GOOGLE_VERTEX_LOCATION ?? 'us-central1',
    ...(saKey && {
      googleAuthOptions: {
        credentials: JSON.parse(saKey),
      },
    }),
  });
}

function getModel(modelSpec: string) {
  const vertex = getVertex();
  switch (modelSpec) {
    case 'gemini-flash':
      return vertex('gemini-1.5-flash-001');
    case 'gemini-pro':
      return vertex('gemini-1.5-pro-001');
    case 'claude-haiku':
      return anthropic('claude-haiku-4-5-20251001');
    case 'claude-sonnet':
      return anthropic('claude-sonnet-4-6');
    default:
      return vertex('gemini-1.5-flash-001');
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages, model = 'gemini-flash', template, platform } = await req.json();

  const systemPrompt = `You are an expert social media content creator. Help the user craft engaging content for ${platform || 'social media'}.
${template ? `You are working with the "${template}" content template.` : ''}
Be concise, creative, and platform-appropriate. When asked to generate captions or posts, format them clearly.`;

  const result = streamText({
    model: getModel(model),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
