const express = require('express');

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// ── Platform configs ──────────────────────────────────────────────────────────
const PLATFORM_CONFIGS = {
  tiktok:     { maxChars: 2200, hashtagLimit: 30, tone: 'casual', format: '9:16' },
  instagram:  { maxChars: 2200, hashtagLimit: 30, tone: 'visual', format: '1:1' },
  x:          { maxChars: 280,  hashtagLimit: 2,  tone: 'concise', format: '16:9' },
  twitter:    { maxChars: 280,  hashtagLimit: 2,  tone: 'concise', format: '16:9' },
  linkedin:   { maxChars: 3000, hashtagLimit: 5,  tone: 'professional', format: '16:9' },
  facebook:   { maxChars: 63206, hashtagLimit: 10, tone: 'friendly', format: '16:9' },
  youtube:    { maxChars: 5000, hashtagLimit: 15, tone: 'descriptive', format: '16:9' },
  youtube_shorts: { maxChars: 1000, hashtagLimit: 15, tone: 'energetic', format: '9:16' },
  pinterest:  { maxChars: 500,  hashtagLimit: 20, tone: 'inspirational', format: '2:3' },
  snapchat:   { maxChars: 250,  hashtagLimit: 0,  tone: 'playful', format: '9:16' },
  threads:    { maxChars: 500,  hashtagLimit: 5,  tone: 'conversational', format: '1:1' },
  bluesky:    { maxChars: 300,  hashtagLimit: 4,  tone: 'authentic', format: '16:9' },
  mastodon:   { maxChars: 500,  hashtagLimit: 4,  tone: 'thoughtful', format: '16:9' },
  reddit:     { maxChars: 40000, hashtagLimit: 0, tone: 'informative', format: '16:9' },
};

// ── Model router ──────────────────────────────────────────────────────────────
async function generateWithGemini(prompt, model = 'gemini-1.5-flash') {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const m = genAI.getGenerativeModel({ model });
  const result = await m.generateContent(prompt);
  return result.response.text();
}

async function generateWithClaude(prompt, model = 'claude-haiku-4-5-20251001') {
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });
  return msg.content[0].text;
}

async function generateWithOllama(prompt, model = 'llama3.2') {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const resp = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false }),
  });
  if (!resp.ok) throw new Error(`Ollama error: ${resp.status}`);
  const data = await resp.json();
  return data.response;
}

async function routeGeneration(prompt, modelSpec = 'gemini-flash') {
  const map = {
    'gemini-flash':   () => generateWithGemini(prompt, 'gemini-1.5-flash'),
    'gemini-pro':     () => generateWithGemini(prompt, 'gemini-1.5-pro'),
    'claude-haiku':   () => generateWithClaude(prompt, 'claude-haiku-4-5-20251001'),
    'claude-sonnet':  () => generateWithClaude(prompt, 'claude-sonnet-4-6'),
    'llama3':         () => generateWithOllama(prompt, 'llama3.2'),
    'ollama':         () => generateWithOllama(prompt),
  };
  const fn = map[modelSpec] || map['gemini-flash'];
  return fn();
}

function parseJsonResponse(text) {
  const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  return JSON.parse(clean);
}

function buildCaptionPrompt(topic, platform, tone, template, platformConfig) {
  return `Create a social media caption for ${platform}.
Topic: ${topic}
Template: ${template || 'general'}
Tone: ${tone || platformConfig.tone}
Max characters: ${platformConfig.maxChars}
Max hashtags: ${platformConfig.hashtagLimit}

Return ONLY a JSON object:
{"caption": "...", "hashtags": ["tag1", "tag2"], "estimatedReach": 1000}`;
}

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', models: Object.keys({ 'gemini-flash': 1, 'gemini-pro': 1, 'claude-haiku': 1, 'claude-sonnet': 1, 'llama3': 1 }) });
});

// ── POST /generate ─────────────────────────────────────────────────────────────
app.post('/generate', async (req, res) => {
  try {
    const { topic, template, tone, platform = 'tiktok', model = 'gemini-flash' } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required' });

    const platformConfig = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.tiktok;
    const prompt = buildCaptionPrompt(topic, platform, tone, template, platformConfig);
    const raw = await routeGeneration(prompt, model);
    const data = parseJsonResponse(raw);

    return res.json({ ...data, model, platform, platformConfig });
  } catch (err) {
    console.error('[text-gen /generate]', err);
    return res.status(500).json({ error: 'Generation failed', details: err.message });
  }
});

// ── POST /generate/batch ───────────────────────────────────────────────────────
app.post('/generate/batch', async (req, res) => {
  try {
    const { topic, template, tone, platform = 'tiktok', model = 'gemini-flash', count = 5 } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required' });

    const platformConfig = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.tiktok;
    const prompt = `Generate ${count} distinct social media caption variations for ${platform}.
Topic: ${topic}
Template: ${template || 'general'}
Tone: ${tone || platformConfig.tone}
Max characters per caption: ${platformConfig.maxChars}
Max hashtags: ${platformConfig.hashtagLimit}

Return ONLY a JSON array of ${count} objects:
[{"caption": "...", "hashtags": ["tag1"], "tone": "casual"}, ...]`;

    const raw = await routeGeneration(prompt, model);
    const variations = parseJsonResponse(raw);

    return res.json({ variations: Array.isArray(variations) ? variations : [variations], platform, model });
  } catch (err) {
    console.error('[text-gen /generate/batch]', err);
    return res.status(500).json({ error: 'Batch generation failed', details: err.message });
  }
});

// ── POST /generate/thread ──────────────────────────────────────────────────────
app.post('/generate/thread', async (req, res) => {
  try {
    const { topic, platform = 'x', model = 'gemini-flash', maxPosts = 5 } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required' });

    const platformConfig = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.x;
    const prompt = `Create a ${maxPosts}-post thread for ${platform} about: ${topic}
Each post max ${platformConfig.maxChars} chars.
Return ONLY a JSON array:
[{"post": "...", "position": 1}, {"post": "...", "position": 2}, ...]`;

    const raw = await routeGeneration(prompt, model);
    const posts = parseJsonResponse(raw);

    return res.json({ posts: Array.isArray(posts) ? posts : [posts], platform, model, topic });
  } catch (err) {
    console.error('[text-gen /generate/thread]', err);
    return res.status(500).json({ error: 'Thread generation failed', details: err.message });
  }
});

// ── POST /generate/hashtags ────────────────────────────────────────────────────
app.post('/generate/hashtags', async (req, res) => {
  try {
    const { topic, platform = 'tiktok', model = 'gemini-flash', count = 10 } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required' });

    const platformConfig = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.tiktok;
    const limit = Math.min(count, platformConfig.hashtagLimit || count);
    const prompt = `Generate ${limit} trending hashtags for a ${platform} post about: ${topic}
Return ONLY a JSON array of strings (no # prefix): ["tag1", "tag2", ...]`;

    const raw = await routeGeneration(prompt, model);
    const hashtags = parseJsonResponse(raw);

    return res.json({ hashtags: Array.isArray(hashtags) ? hashtags : [], platform, model });
  } catch (err) {
    console.error('[text-gen /generate/hashtags]', err);
    return res.status(500).json({ error: 'Hashtag generation failed', details: err.message });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`text-gen service listening on port ${port}`);
  });
}

module.exports = app;
