import { GoogleGenerativeAI, GenerateContentResult } from '@google/generative-ai';
import {
  Platform,
  Tone,
  buildSinglePlatformSystemPrompt,
  buildMultiPlatformSystemPrompt,
  buildVariantsSystemPrompt,
} from './prompts';

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return genAI;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extracts and parses JSON from a Gemini response.
 * Gemini occasionally wraps JSON in markdown fences despite instructions —
 * this strips them before parsing.
 */
function parseJsonResponse<T>(result: GenerateContentResult): T {
  const raw = result.response.text().trim();
  // Strip ```json ... ``` or ``` ... ``` fences
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    throw new Error(`Failed to parse Gemini JSON response: ${cleaned.slice(0, 200)}`);
  }
}

// ---------------------------------------------------------------------------
// generateCaption
// ---------------------------------------------------------------------------

export interface CaptionInput {
  topic: string;
  tone?: Tone;
  platform?: Platform;
  brandVoiceExamples?: string[];
}

export interface CaptionOutput {
  caption: string;
  hashtags: string[];
  callToAction: string;
}

/**
 * Generates a caption, hashtags, and CTA for a single platform.
 */
export async function generateCaption(input: CaptionInput): Promise<CaptionOutput> {
  const tone: Tone = input.tone ?? 'professional';
  const platform: Platform = input.platform ?? 'instagram';

  const ai = getGenAI();
  const model = ai.getGenerativeModel({ model: GEMINI_MODEL });

  const systemPrompt = buildSinglePlatformSystemPrompt(platform, tone);

  const userPrompt = [
    `Topic: ${input.topic}`,
    input.brandVoiceExamples?.length
      ? `Brand voice examples:\n${input.brandVoiceExamples.map((e, i) => `${i + 1}. ${e}`).join('\n')}`
      : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const result = await model.generateContent({
    systemInstruction: systemPrompt,
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.8,
      topP: 0.9,
      maxOutputTokens: 1024,
    },
  });

  return parseJsonResponse<CaptionOutput>(result);
}

// ---------------------------------------------------------------------------
// generateMultiPlatform
// ---------------------------------------------------------------------------

export interface MultiPlatformInput {
  topic: string;
  tone?: Tone;
  platforms: Platform[];
  brandVoiceExamples?: string[];
}

export type MultiPlatformOutput = Record<Platform, CaptionOutput>;

/**
 * Generates captions for multiple platforms in a single Gemini call.
 * Returns an object keyed by platform name.
 */
export async function generateMultiPlatform(input: MultiPlatformInput): Promise<MultiPlatformOutput> {
  const tone: Tone = input.tone ?? 'professional';
  const platforms: Platform[] = input.platforms.length ? input.platforms : ['instagram'];

  const ai = getGenAI();
  const model = ai.getGenerativeModel({ model: GEMINI_MODEL });

  const systemPrompt = buildMultiPlatformSystemPrompt(platforms, tone);

  const userPrompt = [
    `Topic: ${input.topic}`,
    `Platforms: ${platforms.join(', ')}`,
    input.brandVoiceExamples?.length
      ? `Brand voice examples:\n${input.brandVoiceExamples.map((e, i) => `${i + 1}. ${e}`).join('\n')}`
      : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const result = await model.generateContent({
    systemInstruction: systemPrompt,
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.8,
      topP: 0.9,
      maxOutputTokens: 2048,
    },
  });

  return parseJsonResponse<MultiPlatformOutput>(result);
}

// ---------------------------------------------------------------------------
// generateVariants
// ---------------------------------------------------------------------------

export interface VariantsInput {
  caption: string;
  count?: number;
}

export interface VariantsOutput {
  variants: string[];
}

/**
 * Takes an existing caption and returns N distinct variants.
 */
export async function generateVariants(input: VariantsInput): Promise<VariantsOutput> {
  const count = Math.max(1, Math.min(10, input.count ?? 3));

  const ai = getGenAI();
  const model = ai.getGenerativeModel({ model: GEMINI_MODEL });

  const systemPrompt = buildVariantsSystemPrompt();

  const userPrompt = `Original caption:\n"${input.caption}"\n\nGenerate ${count} distinct variants.`;

  const result = await model.generateContent({
    systemInstruction: systemPrompt,
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.9,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  });

  const parsed = parseJsonResponse<VariantsOutput>(result);

  // Ensure we return exactly `count` variants (trim if Gemini returned extras)
  return { variants: parsed.variants.slice(0, count) };
}
