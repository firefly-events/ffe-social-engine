/**
 * Prompt templates and platform rules for social media content generation.
 * Each platform has a character limit, posting conventions, and best practices.
 */

export type Platform = 'twitter' | 'instagram' | 'linkedin' | 'tiktok' | 'facebook';
export type Tone = 'professional' | 'casual' | 'humorous' | 'inspirational';

// ---------------------------------------------------------------------------
// Platform constraints
// ---------------------------------------------------------------------------

export interface PlatformConfig {
  name: string;
  maxChars: number;
  hashtagStrategy: string;
  ctaStyle: string;
  structureHints: string;
}

export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  twitter: {
    name: 'Twitter/X',
    maxChars: 280,
    hashtagStrategy: 'Use 1-2 highly relevant hashtags. Do NOT cram hashtags — keep it clean.',
    ctaStyle: 'Short, punchy. "Join us →" or "Read more:" with link placeholder.',
    structureHints:
      'Lead with a hook in the first sentence. One idea per tweet. No fluff.',
  },
  instagram: {
    name: 'Instagram',
    maxChars: 2200,
    hashtagStrategy:
      'Include 5-10 targeted hashtags at the END of the caption, separated by a line break. Mix popular (#music) and niche (#indiefolkartist) tags.',
    ctaStyle:
      '"Link in bio." or "Drop a comment 👇" or "Tag someone who needs this!"',
    structureHints:
      'Start with an attention-grabbing first line (visible before "more"). Use line breaks for readability. Emojis are encouraged for warmth.',
  },
  linkedin: {
    name: 'LinkedIn',
    maxChars: 3000,
    hashtagStrategy: 'Use 3-5 professional hashtags at the end. e.g. #Marketing #Leadership',
    ctaStyle: '"What do you think? Share in the comments." or "Follow for more."',
    structureHints:
      'Professional yet personable. Lead with a bold insight or stat. Use short paragraphs. Bullet points work well for lists. No excessive emojis.',
  },
  tiktok: {
    name: 'TikTok',
    maxChars: 2200,
    hashtagStrategy:
      'Use 3-5 hashtags: one trending (#fyp or #foryou), one category (#foodtok), one niche.',
    ctaStyle: '"Follow for part 2!" or "Comment your answer 👇"',
    structureHints:
      'Write like you are talking to a friend. Conversational, energetic. Reference trends subtly. Keep it short and snappy.',
  },
  facebook: {
    name: 'Facebook',
    maxChars: 63206,
    hashtagStrategy: 'Hashtags are less important on Facebook. Use 1-2 if relevant.',
    ctaStyle: '"Click the link below to learn more." or "Share with someone who needs this!"',
    structureHints:
      'Can be longer and more detailed than other platforms. Storytelling works well. Ask a question to drive comments.',
  },
};

// ---------------------------------------------------------------------------
// Tone templates
// ---------------------------------------------------------------------------

export const TONE_DESCRIPTIONS: Record<Tone, string> = {
  professional:
    'Authoritative, clear, and data-driven. Uses industry terminology appropriately. No slang. Builds trust and credibility.',
  casual:
    'Friendly, approachable, and conversational. Uses contractions. Feels like talking to a knowledgeable friend. Light use of emojis ok.',
  humorous:
    'Witty, playful, and entertaining. Uses wordplay, clever observations, or self-deprecating humor. Avoids offensive or alienating jokes.',
  inspirational:
    'Uplifting, motivating, and emotionally resonant. Uses powerful action verbs. Evokes emotion. Ends with a call to action that feels meaningful.',
};

// ---------------------------------------------------------------------------
// Few-shot examples (used to improve output quality)
// ---------------------------------------------------------------------------

interface FewShotExample {
  input: string;
  output: string;
}

export const FEW_SHOT_EXAMPLES: Record<Platform, FewShotExample> = {
  twitter: {
    input: 'New product launch: AI writing assistant, casual tone',
    output: JSON.stringify({
      caption:
        "we built an AI writing assistant and honestly? it kind of slaps 😅 less time staring at a blank page, more time shipping. give it a try →",
      hashtags: ['#buildinpublic', '#productlaunch'],
      callToAction: 'Try it free →',
    }),
  },
  instagram: {
    input: 'Coffee shop reopening after renovation, inspirational tone',
    output: JSON.stringify({
      caption:
        "Sometimes the best things take time. ☕\n\nWe closed our doors 6 weeks ago with a vision. Today, we reopen them with a space that feels like home — warm, welcoming, and full of possibility.\n\nEvery detail was chosen with intention. Every corner was built for connection.\n\nCome see what we've been brewing.\n\nDoors open Saturday, 8am. You're invited. 🙌",
      hashtags: [
        '#coffeeislife',
        '#cafereopen',
        '#communityvibes',
        '#localcafe',
        '#newbeginnings',
        '#interiordesign',
        '#coffeeshop',
      ],
      callToAction: 'Link in bio for address + menu preview.',
    }),
  },
  linkedin: {
    input: 'Sharing a lesson learned from a failed product, professional tone',
    output: JSON.stringify({
      caption:
        "We launched a product in 2023 that failed.\n\nWe had the tech. We had the team. We didn't have product-market fit.\n\nHere's what we learned:\n\n• Talk to customers before writing code\n• \"Cool\" and \"valuable\" are not the same thing\n• Fast failure is cheaper than slow failure\n\nWe pivoted, applied these lessons, and our next product hit $50K MRR in 6 months.\n\nFailure is just expensive tuition. Pay it once, learn the lesson.",
      hashtags: ['#StartupLessons', '#ProductManagement', '#Entrepreneurship'],
      callToAction: 'What lesson did a failure teach you? Share below.',
    }),
  },
  tiktok: {
    input: 'Fitness challenge, humorous tone',
    output: JSON.stringify({
      caption:
        "POV: you said \"new year new me\" and it's been 3 months 😂 ok but for real the 30-day challenge starts TODAY and I'm dragging all of you with me. day 1: do not scroll past this without commenting your starting weight. we're doing this together bestie 💪",
      hashtags: ['#fyp', '#fitnesstok', '#30daychallenge'],
      callToAction: 'Comment "IN" to join the challenge 👇',
    }),
  },
  facebook: {
    input: 'Community event announcement, casual tone',
    output: JSON.stringify({
      caption:
        "Hey neighbors! 👋\n\nBig news: our annual community picnic is BACK this summer, and it's going to be better than ever.\n\nWe've got live music from three local bands, a food truck rally with 8 vendors, lawn games for the kids, and a raffle with some seriously great prizes.\n\nBest of all? It's completely free for everyone in the community.\n\nDate: Saturday, July 12\nTime: 11am - 6pm\nLocation: Riverside Park (main pavilion)\n\nBring a blanket, bring your family, and invite your neighbors. The more the merrier!\n\nClick the link below to RSVP so we can plan accordingly 👇",
      hashtags: ['#CommunityEvent'],
      callToAction: 'RSVP here: [link]',
    }),
  },
};

// ---------------------------------------------------------------------------
// System prompt builder
// ---------------------------------------------------------------------------

export function buildSinglePlatformSystemPrompt(platform: Platform, tone: Tone): string {
  const pc = PLATFORM_CONFIGS[platform];
  const toneDesc = TONE_DESCRIPTIONS[tone];
  const example = FEW_SHOT_EXAMPLES[platform];

  return `You are an expert social media copywriter specializing in ${pc.name} content.

PLATFORM RULES for ${pc.name}:
- Maximum caption length: ${pc.maxChars} characters
- Hashtag strategy: ${pc.hashtagStrategy}
- CTA style: ${pc.ctaStyle}
- Writing style hints: ${pc.structureHints}

TONE: ${tone}
${toneDesc}

OUTPUT FORMAT (strict JSON, no markdown fences):
{
  "caption": "the caption text here",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "callToAction": "CTA text here"
}

EXAMPLE INPUT: "${example.input}"
EXAMPLE OUTPUT: ${example.output}

Rules:
1. Return ONLY valid JSON. No preamble, no explanation, no markdown.
2. Caption must respect the ${pc.maxChars} character limit.
3. Hashtags must be an array of strings, each starting with "#".
4. If the user provides brand voice examples, incorporate that style.
5. Never fabricate facts or statistics.`;
}

export function buildMultiPlatformSystemPrompt(platforms: Platform[], tone: Tone): string {
  const platformBlocks = platforms
    .map((p) => {
      const pc = PLATFORM_CONFIGS[p];
      return `  "${p}": {
    "max_chars": ${pc.maxChars},
    "hashtag_strategy": "${pc.hashtagStrategy}",
    "cta_style": "${pc.ctaStyle}",
    "structure_hints": "${pc.structureHints}"
  }`;
    })
    .join(',\n');

  const toneDesc = TONE_DESCRIPTIONS[tone];

  return `You are an expert social media copywriter. Write content for multiple platforms in a single pass.

TONE: ${tone}
${toneDesc}

PLATFORM RULES:
{
${platformBlocks}
}

OUTPUT FORMAT (strict JSON, no markdown fences, one key per platform):
{
  "${platforms[0]}": { "caption": "...", "hashtags": ["#..."], "callToAction": "..." }${
    platforms.length > 1
      ? `,\n  "${platforms[1]}": { "caption": "...", "hashtags": ["#..."], "callToAction": "..." }`
      : ''
  }
}

Rules:
1. Return ONLY valid JSON. No preamble, no explanation, no markdown.
2. Adapt caption length and style to each platform's constraints.
3. Hashtags must be an array of strings starting with "#".
4. Tailor the tone and structure per platform while keeping the core message consistent.
5. Never fabricate facts or statistics.`;
}

export function buildVariantsSystemPrompt(): string {
  return `You are a social media copywriter. Your task is to generate caption variants.

Given an original caption, produce N distinct variations that:
- Preserve the core message and key information
- Use different hooks, angles, or phrasing
- Vary in structure (e.g., question hook, stat hook, story hook, bold claim)
- Are each complete and ready to post

OUTPUT FORMAT (strict JSON, no markdown fences):
{
  "variants": ["variant 1 here", "variant 2 here", "variant 3 here"]
}

Rules:
1. Return ONLY valid JSON. No preamble.
2. Each variant must be meaningfully different — not just synonym swaps.
3. Maintain roughly the same length as the original.`;
}
