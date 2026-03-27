import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { prompt, aspectRatio = '1:1', style = 'vivid' } = await req.json();
    if (!prompt) return NextResponse.json({ error: 'prompt is required' }, { status: 400 });

    // Use Gemini 2.0 Flash with image generation capability
    // responseModalities with IMAGE requires this experimental model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      // @ts-ignore - generationConfig.responseModalities not yet typed in 0.24.x
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
    });

    const imagePrompt = `Generate a professional social media image: ${prompt}. Style: ${style}. Aspect ratio: ${aspectRatio}. High quality, visually striking, suitable for social media.`;

    const result = await model.generateContent(imagePrompt);
    const response = result.response;

    // Extract image from response parts
    let imageUrl: string | null = null;
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if ((part as any).inlineData?.mimeType?.startsWith('image/')) {
        const { data, mimeType } = (part as any).inlineData;
        imageUrl = `data:${mimeType};base64,${data}`;
        break;
      }
    }

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 });
    }

    return NextResponse.json({ imageUrl, prompt });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
