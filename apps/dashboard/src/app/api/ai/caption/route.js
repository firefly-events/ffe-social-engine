import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  const { userId, has } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!has({ feature: 'ai_captions' })) {
    return NextResponse.json({ error: 'Upgrade to Pro to use AI captions' }, { status: 402 })
  }

  try {
    const { topic, template, tone = 'engaging', platform = 'tiktok' } = await req.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Create a social media caption and hashtags for a ${platform} post.
      Topic: ${topic}
      Template Type: ${template}
      Tone: ${tone}
      
      Return the result as a JSON object with:
      {
        "caption": "...",
        "hashtags": ["tag1", "tag2", ...],
        "estimatedReach": 1000
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (Gemini sometimes wraps it in markdown blocks)
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json({ error: 'Failed to generate caption' }, { status: 500 });
  }
}
