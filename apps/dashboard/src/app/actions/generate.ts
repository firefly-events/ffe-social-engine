'use server'

export type Platform = 'Instagram' | 'TikTok' | 'YouTube' | 'X' | 'LinkedIn' | 'Facebook'
export type Tone = 'Professional' | 'Casual' | 'Humorous' | 'Inspirational'

export interface PlatformContent {
  caption: string
  hashtags: string[]
  callToAction: string
}

export interface GenerateRequest {
  message: string
  platforms: Platform[]
  tone: Tone
  brandVoiceExamples?: string
}

export interface GenerateResult {
  platforms: Partial<Record<Platform, PlatformContent>>
}

export type GenerateResponse =
  | { success: true; data: GenerateResult }
  | { success: false; error: string; missingApiKey?: boolean }

const PLATFORM_RULES: Record<Platform, string> = {
  Instagram: 'Max 2200 chars. Lead with a hook sentence. Use 5-10 relevant hashtags. Include an emoji or two for personality. End with a CTA.',
  TikTok: 'Max 2200 chars but keep it short and punchy (under 150 words). Trendy, energetic tone. Use 3-5 hashtags. Hook in first line.',
  YouTube: 'Max 5000 chars. Optimised for search — include keywords naturally. Include timestamps-style structure if relevant. 3-5 hashtags. Professional CTA.',
  X: 'HARD LIMIT: 280 characters including the CTA. No hashtags unless they fit naturally within the limit. Punchy and direct.',
  LinkedIn: 'Max 3000 chars. Professional. Start with a bold claim or insight. Use line breaks for readability. 3-5 professional hashtags. Business-oriented CTA.',
  Facebook: 'Max 63,206 chars but keep it under 400 words. Conversational. Ask a question to drive comments. 2-3 hashtags. Friendly CTA.',
}

const MOCK_RESPONSES: Record<Platform, PlatformContent> = {
  Instagram: {
    caption: "Behind every great event is a team that refuses to settle. 🔥\n\nWe've spent years watching the industry rely on spreadsheets and prayer. Not anymore.\n\nSocialEngine turns your ideas into platform-ready content in seconds — so you can focus on what actually matters: creating experiences people talk about for years.\n\nWhat's one event moment you wish you'd captured better? Drop it below. 👇",
    hashtags: ['#EventMarketing', '#ContentCreation', '#AIMarketing', '#EventProfs', '#SocialMedia', '#ContentStrategy', '#MarketingTools'],
    callToAction: 'Try it free — link in bio',
  },
  TikTok: {
    caption: "POV: you just turned a single idea into 6 platform-ready posts in under 30 seconds 😮‍💨✨ This is what AI-powered content creation actually looks like.",
    hashtags: ['#ContentCreation', '#AITools', '#MarketingTips', '#EventMarketing'],
    callToAction: 'Follow for more marketing hacks',
  },
  YouTube: {
    caption: "How AI Is Changing Event Marketing Forever\n\nIn this video, we break down how modern event marketers are using AI to generate weeks of content in minutes — and how you can too.\n\n0:00 - Introduction\n1:30 - The old way vs the new way\n4:00 - Live demo: generating platform content with AI\n8:30 - Real results from real events\n12:00 - How to get started today\n\nWhether you're running a conference, a festival, or a brand activation, this workflow will save you hours every week. Watch until the end for our free content calendar template.",
    hashtags: ['#EventMarketing', '#AIMarketing', '#ContentStrategy'],
    callToAction: 'Subscribe and hit the bell for weekly marketing breakdowns',
  },
  X: {
    caption: 'Event marketing just got a serious upgrade. AI-generated, platform-optimised content in 30 seconds. The future is now.',
    hashtags: [],
    callToAction: 'See it in action →',
  },
  LinkedIn: {
    caption: "The most underrated advantage in event marketing right now? Speed.\n\nWhile most teams are still manually adapting content for each platform, the best marketing teams have automated it entirely.\n\nHere's what we've learned after working with hundreds of event organisers:\n\n→ Platform-native content outperforms copy-pasted posts by 3-4x\n→ Consistency beats perfection — posting regularly matters more than occasional viral moments\n→ AI doesn't replace creativity. It removes the friction so you can be more creative, not less.\n\nThe tools exist. The question is whether your team is using them.\n\nWhat's your current content workflow for events? I'd love to hear what's working.",
    hashtags: ['#EventMarketing', '#ContentStrategy', '#MarketingOps', '#AIMarketing', '#B2BMarketing'],
    callToAction: 'Connect with me to see how we\'re helping teams scale content',
  },
  Facebook: {
    caption: "Quick question for all the event organisers out there — how long does it take your team to create content for a single event?\n\nFor most teams, it's hours. Adapting copy for Instagram, writing something different for LinkedIn, keeping it short for X, making it searchable for YouTube...\n\nWe built SocialEngine to solve exactly this. You describe your event or idea once. AI generates platform-optimised content for every channel instantly.\n\nWe're opening early access this week. Drop a comment below if you want to be first in line, and we'll send you a direct link. 👇",
    hashtags: ['#EventMarketing', '#MarketingTools'],
    callToAction: 'Comment below for early access',
  },
}

function buildSystemPrompt(tone: Tone, platforms: Platform[]): string {
  const toneGuidance: Record<Tone, string> = {
    Professional: 'authoritative, polished, credible, data-driven where possible, avoid slang',
    Casual: 'friendly, conversational, approachable, use contractions, light humour welcome',
    Humorous: 'witty, playful, puns and wordplay welcome, keep it punchy, do not force jokes',
    Inspirational: 'motivational, uplifting, aspirational, focus on transformation and possibility',
  }

  const platformRules = platforms.map((p) => `**${p}**: ${PLATFORM_RULES[p]}`).join('\n')

  return `You are a world-class social media content strategist specialising in event marketing.
Your task is to generate platform-optimised social media content based on a user's brief.

TONE: ${tone} — ${toneGuidance[tone]}

PLATFORM RULES (strictly follow character limits and format guidance):
${platformRules}

OUTPUT FORMAT: Respond with a single valid JSON object. No markdown fences. No commentary outside the JSON.
The JSON must match this exact structure:
{
  "platforms": {
    "<PlatformName>": {
      "caption": "...",
      "hashtags": ["#tag1", "#tag2"],
      "callToAction": "..."
    }
  }
}

Only include keys for the platforms requested: ${platforms.join(', ')}.
The callToAction should be a short standalone phrase (not repeated in the caption).
Hashtags array should contain only the hashtag strings (with # prefix), no counts or explanations.
Never include hashtags inside the caption text — they go in the hashtags array only (except X where you may include 1-2 inline if they fit within 280 chars total).`
}

export async function generateContent(req: GenerateRequest): Promise<GenerateResponse> {
  const apiKey = process.env.GOOGLE_API_KEY

  if (!apiKey) {
    return {
      success: false,
      error: 'GOOGLE_API_KEY is not configured. Add it to your .env.local file to enable AI generation.',
      missingApiKey: true,
    }
  }

  if (!req.message?.trim()) {
    return { success: false, error: 'Please provide a message describing your content.' }
  }

  if (!req.platforms?.length) {
    return { success: false, error: 'Please select at least one platform.' }
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const systemPrompt = buildSystemPrompt(req.tone, req.platforms)
    const userPrompt = req.brandVoiceExamples
      ? `Content brief: ${req.message}\n\nBrand voice examples for reference:\n${req.brandVoiceExamples}`
      : `Content brief: ${req.message}`

    const result = await model.generateContent([systemPrompt, userPrompt])
    const text = result.response.text().trim()

    // Strip markdown fences if present
    const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

    let parsed: GenerateResult
    try {
      parsed = JSON.parse(jsonText) as GenerateResult
    } catch {
      return { success: false, error: 'AI returned an unexpected format. Please try again.' }
    }

    if (!parsed?.platforms || typeof parsed.platforms !== 'object') {
      return { success: false, error: 'AI response was missing expected platform data. Please try again.' }
    }

    // Validate and clean each platform's content
    const cleaned: Partial<Record<Platform, PlatformContent>> = {}
    for (const platform of req.platforms) {
      const raw = parsed.platforms[platform]
      if (raw && typeof raw.caption === 'string') {
        cleaned[platform] = {
          caption: raw.caption,
          hashtags: Array.isArray(raw.hashtags) ? raw.hashtags.filter((h): h is string => typeof h === 'string') : [],
          callToAction: typeof raw.callToAction === 'string' ? raw.callToAction : '',
        }
      }
    }

    return { success: true, data: { platforms: cleaned } }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: `Generation failed: ${message}` }
  }
}

/** Returns mock data for testing the UI when no API key is configured */
export async function getMockContent(platforms: Platform[]): Promise<GenerateResult> {
  await new Promise((r) => setTimeout(r, 1200)) // simulate latency
  const result: Partial<Record<Platform, PlatformContent>> = {}
  for (const p of platforms) {
    result[p] = MOCK_RESPONSES[p]
  }
  return { platforms: result }
}
