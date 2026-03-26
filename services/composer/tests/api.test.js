const request = require('supertest');
const app = require('../index');

describe('Composer Endpoints', () => {
  it('POST /compose requires audio or video', async () => {
    const res = await request(app).post('/compose').send({});
    expect(res.status).toBe(400);
  });

  it('POST /compose invalidates bad URLs', async () => {
    const res = await request(app).post('/compose').send({
      audio_url: 'not-a-valid-url'
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid audio_url');
  });

  it('POST /compose accepts valid payload and GET /compose/:id returns status', async () => {
    const res = await request(app).post('/compose').send({
      audio_url: 'http://example.com/audio.wav',
      video_url: 'http://example.com/video.mp4',
      format: '9:16',
      text_overlay: { text: 'Hello' }
    });
    expect(res.status).toBe(202);
    expect(res.body.status).toBe('processing');
    expect(res.body.id).toBeDefined();

    const id = res.body.id;

    // Test the status endpoint
    const statusRes = await request(app).get(`/compose/${id}`);
    expect(statusRes.status).toBe(200);
    // Because it's a test environment, it gets marked completed immediately
    expect(statusRes.body.status).toBe('completed');
    expect(statusRes.body.result_url).toBe(`/output/${id}.mp4`);
  });

  it('POST /compose accepts 16:9 format and returns processing status', async () => {
    const res = await request(app).post('/compose').send({
      video_url: 'http://example.com/video.mp4',
      format: '16:9',
    });
    expect(res.status).toBe(202);
    expect(res.body.status).toBe('processing');
    expect(res.body.id).toBeDefined();

    const id = res.body.id;
    const statusRes = await request(app).get(`/compose/${id}`);
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.status).toBe('completed');
    expect(statusRes.body.result_url).toBe(`/output/${id}.mp4`);
  });

  it('POST /compose accepts 1:1 format and returns processing status', async () => {
    const res = await request(app).post('/compose').send({
      video_url: 'http://example.com/video.mp4',
      format: '1:1',
    });
    expect(res.status).toBe(202);
    expect(res.body.status).toBe('processing');
    expect(res.body.id).toBeDefined();

    const id = res.body.id;
    const statusRes = await request(app).get(`/compose/${id}`);
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.status).toBe('completed');
    expect(statusRes.body.result_url).toBe(`/output/${id}.mp4`);
  });

  it('GET /compose/:id returns 404 for unknown job', async () => {
    const res = await request(app).get('/compose/unknown-id');
    expect(res.status).toBe(404);
  });
});
