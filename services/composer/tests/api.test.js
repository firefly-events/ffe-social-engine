const request = require('supertest');
const app = require('../index');

describe('Composer Endpoints', () => {
  it('POST /compose requires audio or video', async () => {
    const res = await request(app).post('/compose').send({});
    expect(res.status).toBe(400);
  });

  it('POST /compose accepts valid payload', async () => {
    const res = await request(app).post('/compose').send({
      audio_url: 'http://example.com/audio.wav',
      video_url: 'http://example.com/video.mp4',
      format: '9:16',
      text_overlay: { text: 'Hello' }
    });
    expect(res.status).toBe(202);
    expect(res.body.status).toBe('processing');
    expect(res.body.id).toBeDefined();
  });
});
