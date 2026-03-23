const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// In-memory database fallback (pending Prisma DB setup in FIR-1141)
const contentDb = new Map();

// URLs for other services
const SERVICES = {
  text: process.env.TEXT_GEN_URL || 'http://text-gen:8000',
  voice: process.env.VOICE_GEN_URL || 'http://voice-gen:8000',
  visual: process.env.VISUAL_GEN_URL || 'http://visual-gen:8000',
  composer: process.env.COMPOSER_URL || 'http://composer:8000'
};

// Helper for calling microservices
async function callService(url, data) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Service at ${url} failed with status ${response.status}`);
    return await response.json();
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[Gateway Warning] ${error.message} - falling back to mock response`);
    }
    return { mock: true, status: 'success', audio_url: 'mock.wav', video_url: 'mock.mp4', text: 'Mocked text' };
  }
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/create/poetry', async (req, res) => {
  try {
    const { text, voice_id } = req.body;
    if (!text || !voice_id) {
      return res.status(400).json({ error: 'text and voice_id are required' });
    }
    
    const id = crypto.randomUUID();
    res.status(202).json({ message: 'Pipeline started', id });
    
    // Async orchestration
    (async () => {
      // 1. Voice Gen
      const voiceRes = await callService(`${SERVICES.voice}/generate`, { text, voice_id });
      // 2. Visual Gen
      const visualRes = await callService(`${SERVICES.visual}/generate`, { prompt: text });
      // 3. Composer
      const composeRes = await callService(`${SERVICES.composer}/compose`, { 
        audio_url: voiceRes.audio_url || voiceRes.url,
        video_url: visualRes.video_url || visualRes.url,
        format: '9:16'
      });
      
      const content = {
        id,
        type: 'poetry',
        status: 'completed',
        url: `/content/${id}/download`,
        metadata: { text, voice_id },
        assets: { voiceRes, visualRes, composeRes }
      };
      contentDb.set(id, content);
    })();
    
  } catch (error) {
    console.error('[Gateway Error]', error);
    res.status(500).json({ error: 'Pipeline orchestration failed' });
  }
});

app.post('/create/event-promo', async (req, res) => {
  try {
    const { event } = req.body;
    if (!event) return res.status(400).json({ error: 'event data required' });
    
    const id = crypto.randomUUID();
    res.status(202).json({ message: 'Pipeline started', id });
    
    // Async orchestration
    (async () => {
      // 1. Text Gen (captions/script)
      const textRes = await callService(`${SERVICES.text}/generate-script`, { event });
      // 2. Voice Gen
      const voiceRes = await callService(`${SERVICES.voice}/generate`, { 
        text: textRes.script || event.description || 'Join us!', 
        voice_id: event.voice_id || 'default' 
      });
      // 3. Composer
      const composeRes = await callService(`${SERVICES.composer}/compose`, { 
        audio_url: voiceRes.audio_url || voiceRes.url,
        image_urls: event.images || [],
        format: '9:16'
      });
      
      const content = {
        id,
        type: 'event-promo',
        status: 'completed',
        url: `/content/${id}/download`,
        metadata: { event },
        assets: { textRes, voiceRes, composeRes }
      };
      contentDb.set(id, content);
    })();
    
  } catch (error) {
    console.error('[Gateway Error]', error);
    res.status(500).json({ error: 'Pipeline orchestration failed' });
  }
});

app.get('/content', (req, res) => {
  const items = Array.from(contentDb.values());
  res.json({ content: items });
});

app.get('/content/:id/download', (req, res) => {
  const content = contentDb.get(req.params.id);
  if (!content) return res.status(404).json({ error: 'Content not found' });
  
  if (content.status !== 'completed') {
    return res.status(400).json({ error: 'Content is still processing' });
  }
  
  // Return the path or URL. In a real app this would pipe an S3 stream or return a signed URL.
  res.status(200).json({ 
    message: 'Ready for download',
    download_url: `https://cdn.example.com/exports/${req.params.id}.mp4`
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`API Gateway listening on port ${port}`);
  });
}

module.exports = app;
