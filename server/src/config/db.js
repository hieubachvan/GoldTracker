const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

let prisma = null;

const getPrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return prisma;
};

const connectDB = async () => {
  try {
    const client = getPrisma();
    await client.$connect();
    logger.info('✅ SQLite (Prisma 5) connected');
    return client;
  } catch (err) {
    logger.error('❌ Database connection error:', err.message);
    throw err;
  }
};

const disconnectDB = async () => {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('🔌 Database disconnected');
  }
};

module.exports = { getPrisma, connectDB, disconnectDB };
