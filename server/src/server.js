const path = require('path');
const dotenv = require('dotenv');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env';
dotenv.config({ path: path.join(__dirname, '..', envFile) });

const http = require('http');
const express = require('express');
const cors = require('cors');
const { connectDB, disconnectDB } = require('./config/db');
const { initSocket } = require('./socket/socket');
const { initCronJobs } = require('./jobs/cron');
const pricesRouter = require('./routes/prices');
const forexRouter = require('./routes/forex');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin || origin.includes('localhost') || origin.includes('103.163.119.207') || origin.endsWith('vercel.app')) {
      callback(null, true);
    } else {
      callback(null, process.env.CLIENT_URL || 'http://localhost:5173');
    }
  }, 
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/prices', pricesRouter);
app.use('/api/forex', forexRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.post('/api/sync', (req, res) => {
  const { runGoldCrawler, runForexCrawler } = require('./jobs/cron');
  runGoldCrawler();
  runForexCrawler();
  res.status(202).json({ status: 'accepted', message: 'Sync jobs started in the background.' });
});


// Global error handler
app.use((err, _req, res, _next) => {
  logger.error(err.message);
  res.status(err.statusCode || 500).json({ error: err.message });
});

// Bootstrap
const bootstrap = async () => {
  try {
    await connectDB();

    initSocket(server);
    initCronJobs();

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => logger.info(`🚀 Server running on http://localhost:${PORT}`));
  } catch (err) {
    logger.error('Bootstrap failed:', err.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  await disconnectDB();
  process.exit(0);
});

bootstrap();

module.exports = app;
