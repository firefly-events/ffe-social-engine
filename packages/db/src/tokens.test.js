// Mock environment variables before requiring any modules
process.env.MONGODB_URI = 'mongodb://localhost:27017';
process.env.MONGODB_ENCRYPTION_KEY = Buffer.from('12345678901234567890123456789012').toString('base64');

// Build stable mock objects that persist across clearAllMocks calls
const mockCollection = {
  updateOne: jest.fn().mockResolvedValue({ acknowledged: true }),
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockDb = {
  collection: jest.fn().mockReturnValue(mockCollection),
};

const mockClient = {
  connect: jest.fn().mockResolvedValue(undefined),
  db: jest.fn().mockReturnValue(mockDb),
};

// Mock mongodb module
jest.mock('mongodb', () => ({
  MongoClient: jest.fn().mockImplementation(() => mockClient),
}));

const { encrypt, decrypt } = require('./mongo');
const { storeToken, getToken, listConnections, revokeToken } = require('./tokens');

describe('encrypt / decrypt', () => {
  it('round-trips plaintext when ENCRYPTION_KEY is set', () => {
    const original = 'my-secret-access-token';
    const encryptedVal = encrypt(original);
    expect(encryptedVal).not.toBe(original);
    expect(encryptedVal).toContain(':');
    const decryptedVal = decrypt(encryptedVal);
    expect(decryptedVal).toBe(original);
  });

  it('returns the original value when text is null/undefined', () => {
    expect(encrypt(null)).toBeNull();
    expect(decrypt(null)).toBeNull();
    expect(encrypt(undefined)).toBeUndefined();
    expect(decrypt(undefined)).toBeUndefined();
  });

  it('decrypt returns text unchanged when it has no colon separator', () => {
    const plain = 'not-encrypted-text';
    expect(decrypt(plain)).toBe(plain);
  });

  it('handles missing ENCRYPTION_KEY gracefully by passing text through', () => {
    // encrypt/decrypt pass through if key not set; the module already loaded with
    // key present, so verify basic pass-through path via text without separator
    const text = 'plain-no-colon';
    // decrypt with no colon returns as-is
    expect(decrypt(text)).toBe(text);
  });
});

describe('storeToken', () => {
  beforeEach(() => {
    mockCollection.updateOne.mockClear();
    mockCollection.findOne.mockClear();
    mockCollection.find.mockClear();
  });

  it('stores encrypted access and refresh tokens', async () => {
    mockCollection.updateOne.mockResolvedValue({ acknowledged: true });

    const tokenData = {
      accessToken: 'raw-access-token',
      refreshToken: 'raw-refresh-token',
      profileName: 'Test User',
      status: 'active',
    };

    await storeToken('user123', 'twitter', tokenData);

    expect(mockCollection.updateOne).toHaveBeenCalledTimes(1);

    const [filter, update, options] = mockCollection.updateOne.mock.calls[0];
    expect(filter).toEqual({ userId: 'user123', platform: 'twitter' });
    expect(options).toEqual({ upsert: true });

    const setData = update.$set;
    expect(setData.userId).toBe('user123');
    expect(setData.platform).toBe('twitter');
    // Tokens should be encrypted — not the original plaintext
    expect(setData.accessToken).not.toBe('raw-access-token');
    expect(setData.refreshToken).not.toBe('raw-refresh-token');
    // Encrypted values should be round-trippable
    expect(decrypt(setData.accessToken)).toBe('raw-access-token');
    expect(decrypt(setData.refreshToken)).toBe('raw-refresh-token');
    expect(setData.updatedAt).toBeInstanceOf(Date);
  });
});

describe('getToken', () => {
  beforeEach(() => {
    mockCollection.updateOne.mockClear();
    mockCollection.findOne.mockClear();
    mockCollection.find.mockClear();
  });

  it('returns null when no token is found', async () => {
    mockCollection.findOne.mockResolvedValue(null);

    const result = await getToken('user123', 'twitter');
    expect(result).toBeNull();
  });

  it('decrypts tokens on retrieval', async () => {
    const encryptedAccess = encrypt('raw-access-token');
    const encryptedRefresh = encrypt('raw-refresh-token');

    mockCollection.findOne.mockResolvedValue({
      userId: 'user123',
      platform: 'twitter',
      accessToken: encryptedAccess,
      refreshToken: encryptedRefresh,
      profileName: 'Test User',
      status: 'active',
    });

    const result = await getToken('user123', 'twitter');
    expect(result).not.toBeNull();
    expect(result.accessToken).toBe('raw-access-token');
    expect(result.refreshToken).toBe('raw-refresh-token');
    expect(result.profileName).toBe('Test User');
  });

  it('calls findOne with correct userId and platform', async () => {
    mockCollection.findOne.mockResolvedValue(null);

    await getToken('userABC', 'instagram');
    expect(mockCollection.findOne).toHaveBeenCalledWith({ userId: 'userABC', platform: 'instagram' });
  });
});

describe('listConnections', () => {
  beforeEach(() => {
    mockCollection.updateOne.mockClear();
    mockCollection.findOne.mockClear();
    mockCollection.find.mockClear();
  });

  it('returns platform info without token fields', async () => {
    const mockConnections = [
      {
        platform: 'twitter',
        profileName: 'User One',
        profileUrl: 'https://twitter.com/userone',
        status: 'active',
        lastRefreshed: new Date('2024-01-01'),
        connectedAt: new Date('2024-01-01'),
        accessToken: encrypt('secret-token'),
        refreshToken: encrypt('secret-refresh'),
        userId: 'user123',
      },
      {
        platform: 'instagram',
        profileName: 'User Two',
        profileUrl: 'https://instagram.com/usertwo',
        status: 'active',
        lastRefreshed: new Date('2024-01-02'),
        connectedAt: new Date('2024-01-02'),
        accessToken: encrypt('another-secret'),
        refreshToken: null,
        userId: 'user123',
      },
    ];

    mockCollection.find.mockReturnValue({ toArray: jest.fn().mockResolvedValue(mockConnections) });

    const result = await listConnections('user123');

    expect(result).toHaveLength(2);
    // Should NOT include token fields
    expect(result[0]).not.toHaveProperty('accessToken');
    expect(result[0]).not.toHaveProperty('refreshToken');
    expect(result[0]).not.toHaveProperty('userId');
    // Should include platform info
    expect(result[0].platform).toBe('twitter');
    expect(result[0].profileName).toBe('User One');
    expect(result[1].platform).toBe('instagram');
  });

  it('queries by userId', async () => {
    mockCollection.find.mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) });

    await listConnections('user456');
    expect(mockCollection.find).toHaveBeenCalledWith({ userId: 'user456' });
  });
});

describe('revokeToken', () => {
  beforeEach(() => {
    mockCollection.updateOne.mockClear();
    mockCollection.findOne.mockClear();
    mockCollection.find.mockClear();
  });

  it('sets status to revoked and clears token fields', async () => {
    mockCollection.updateOne.mockResolvedValue({ acknowledged: true });

    await revokeToken('user123', 'twitter');

    expect(mockCollection.updateOne).toHaveBeenCalledTimes(1);

    const [filter, update] = mockCollection.updateOne.mock.calls[0];
    expect(filter).toEqual({ userId: 'user123', platform: 'twitter' });
    expect(update.$set.status).toBe('revoked');
    expect(update.$set.accessToken).toBeNull();
    expect(update.$set.refreshToken).toBeNull();
    expect(update.$set.updatedAt).toBeInstanceOf(Date);
  });
});
