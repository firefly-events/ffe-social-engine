const request = require('supertest');
const app = require('../index');

describe('API Gateway Endpoints', () => {
  it('POST /create/poetry requires text and voice_id', async () => {
    const res = await request(app).post('/create/poetry').send({});
    expect(res.status).toBe(400);
  });

  it('POST /create/poetry accepts valid payload', async () => {
    const res = await request(app).post('/create/poetry').send({
      text: 'A test poem',
      voice_id: 'voice1'
    });
    expect(res.status).toBe(202);
    expect(res.body.message).toBe('Pipeline started');
    expect(res.body.id).toBeDefined();
  });

  it('POST /create/event-promo requires event', async () => {
    const res = await request(app).post('/create/event-promo').send({});
    expect(res.status).toBe(400);
  });

  it('POST /create/event-promo accepts valid payload', async () => {
    const res = await request(app).post('/create/event-promo').send({
      event: { description: 'Party!', images: [] }
    });
    expect(res.status).toBe(202);
    expect(res.body.id).toBeDefined();
  });

  it('GET /content returns content list', async () => {
    const res = await request(app).get('/content');
    expect(res.status).toBe(200);
    expect(res.body.content).toBeDefined();
    expect(Array.isArray(res.body.content)).toBe(true);
  });
});
