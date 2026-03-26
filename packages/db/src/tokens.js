const { getClient, encrypt, decrypt } = require('./mongo');

async function getCollection() {
  const client = await getClient();
  const db = client.db('social_engine');
  return db.collection('social_tokens');
}

async function storeToken(userId, platform, tokenData) {
  const collection = await getCollection();

  const encryptedData = {
    ...tokenData,
    accessToken: encrypt(tokenData.accessToken),
    refreshToken: encrypt(tokenData.refreshToken),
    userId,
    platform,
    updatedAt: new Date()
  };

  await collection.updateOne(
    { userId, platform },
    { $set: encryptedData },
    { upsert: true }
  );
}

async function getToken(userId, platform) {
  const collection = await getCollection();
  const data = await collection.findOne({ userId, platform });

  if (!data) return null;

  return {
    ...data,
    accessToken: decrypt(data.accessToken),
    refreshToken: decrypt(data.refreshToken)
  };
}

async function listConnections(userId) {
  const collection = await getCollection();
  const connections = await collection.find({ userId }).toArray();

  return connections.map(conn => ({
    platform: conn.platform,
    profileName: conn.profileName,
    profileUrl: conn.profileUrl,
    status: conn.status,
    lastRefreshed: conn.lastRefreshed,
    connectedAt: conn.connectedAt
  }));
}

async function revokeToken(userId, platform) {
  const collection = await getCollection();
  await collection.updateOne(
    { userId, platform },
    {
      $set: {
        status: 'revoked',
        accessToken: null,
        refreshToken: null,
        updatedAt: new Date()
      }
    }
  );
}

module.exports = { storeToken, getToken, listConnections, revokeToken };
