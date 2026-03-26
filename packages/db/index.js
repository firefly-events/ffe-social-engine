const tokens = require('./src/tokens');

// Mock prisma for stub endpoints until they migrate to Convex
const prisma = {
  user: {
    findUnique: async ({ where }) => ({ id: where.id, tier: 'free' })
  }
};

module.exports = { prisma, ...tokens };

