import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('vertex-ai provider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('builds provider with SA key from env', async () => {
    const mockSaKey = JSON.stringify({
      client_email: 'test@project.iam.gserviceaccount.com',
      private_key: '-----BEGIN RSA PRIVATE KEY-----\nMIIE\n-----END RSA PRIVATE KEY-----\n',
      project_id: 'social-engine-dev',
    });
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY = mockSaKey;

    // Module is loaded fresh — just verify it doesn't throw
    await expect(import('../vertex-ai')).resolves.toBeDefined();
  });

  it('builds provider without SA key (ADC fallback)', async () => {
    delete process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    process.env.GOOGLE_CLOUD_PROJECT = 'social-engine-dev';

    await expect(import('../vertex-ai')).resolves.toBeDefined();
  });
});
