const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const tokens = require('./src/tokens');

module.exports = { prisma, ...tokens };
