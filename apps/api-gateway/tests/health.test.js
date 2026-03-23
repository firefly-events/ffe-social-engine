const request = require('supertest');
const app = require('../index');

describe('Health Endpoint', () => {
  it('should return 200 and status ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
