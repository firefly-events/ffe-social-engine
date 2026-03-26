const request = require('supertest');
const app = require('../index');

describe('POST /generate', () => {
  it('returns 400 when topic is missing', async () => {
    const res = await request(app).post('/generate').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe('POST /generate/batch', () => {
  it('returns 400 when topic is missing', async () => {
    const res = await request(app).post('/generate/batch').send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /generate/thread', () => {
  it('returns 400 when topic is missing', async () => {
    const res = await request(app).post('/generate/thread').send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /generate/hashtags', () => {
  it('returns 400 when topic is missing', async () => {
    const res = await request(app).post('/generate/hashtags').send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /health', () => {
  it('returns 200 with model list', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.models).toBeDefined();
  });
});
