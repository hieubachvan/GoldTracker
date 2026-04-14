const { Server } = require('socket.io');
const logger = require('../utils/logger');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    path: '/api/socket.io/',
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Client connected: ${socket.id}`);

    // Send latest cached data immediately on connect
    const { getCache } = require('../jobs/cache');
    const prices = getCache('latest_prices');
    const forex = getCache('latest_forex');
    if (prices) socket.emit('new_price_data', prices);
    if (forex) socket.emit('new_forex_data', forex);

    socket.on('disconnect', () => {
      logger.info(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  logger.info('✅ Socket.IO initialized');
  return io;
};

const emitPrices = (data) => {
  if (io) {
    io.emit('new_price_data', data);
    logger.info(`📡 Emitted new_price_data to ${io.engine.clientsCount} clients`);
  }
};

const emitForex = (data) => {
  if (io) {
    io.emit('new_forex_data', data);
    logger.info(`📡 Emitted new_forex_data to ${io.engine.clientsCount} clients`);
  }
};

const getIO = () => io;

module.exports = { initSocket, emitPrices, emitForex, getIO };
