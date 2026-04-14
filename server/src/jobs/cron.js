const cron = require('node-cron');
const logger = require('../utils/logger');
const { crawl24hGold } = require('../crawlers/gold');
const { crawlSilver } = require('../crawlers/silver');
const { crawlVCB } = require('../crawlers/forex');
const { getPrisma } = require('../config/db');
const { setCache } = require('./cache');
const { emitPrices, emitForex } = require('../socket/socket');

const CACHE_TTL = 5 * 60; // 5 minutes

const runGoldCrawler = async () => {
  logger.info('⏰ Running gold & silver price crawler...');
  try {
    const [goldPrices, silverPrices] = await Promise.all([
      crawl24hGold(),
      crawlSilver()
    ]);
    const allPrices = [...goldPrices, ...silverPrices];

    // Save to PostgreSQL via Prisma
    const prisma = getPrisma();
    await prisma.price.createMany({
      data: allPrices.map((p) => ({
        source: p.source,
        type: p.type,
        buyPrice: p.buyPrice,
        sellPrice: p.sellPrice,
        unit: p.unit || 'triệu/lượng',
        crawledAt: new Date(),
      })),
    });

    // Update in-memory cache
    setCache('latest_prices', allPrices, CACHE_TTL);

    // Emit directly via Socket.IO (no Redis needed)
    emitPrices(allPrices);

    logger.info(`✅ Gold crawler done: saved ${allPrices.length} records`);
  } catch (err) {
    logger.error('❌ Gold crawler error:', err.message);
  }
};

const runForexCrawler = async () => {
  logger.info('⏰ Running forex crawler...');
  try {
    const rates = await crawlVCB();

    const prisma = getPrisma();
    await prisma.forex.createMany({
      data: rates.map((r) => ({
        currency: r.currency,
        buyPrice: r.buyPrice,
        sellPrice: r.sellPrice,
        transferPrice: r.transferPrice ?? null,
        source: r.source || 'VCB',
        crawledAt: new Date(),
      })),
    });

    setCache('latest_forex', rates, CACHE_TTL);
    emitForex(rates);

    logger.info(`✅ Forex crawler done: saved ${rates.length} rates`);
  } catch (err) {
    logger.error('❌ Forex crawler error:', err.message);
  }
};

const initCronJobs = () => {
  // Gold: every 10 minutes
  cron.schedule('*/10 * * * *', runGoldCrawler, { name: 'goldCrawler' });
  // Forex: every 15 minutes
  cron.schedule('*/15 * * * *', runForexCrawler, { name: 'forexCrawler' });

  logger.info('✅ Cron jobs scheduled (gold: 10min, forex: 15min)');

  // Run immediately on startup
  runGoldCrawler();
  runForexCrawler();
};

module.exports = { initCronJobs, runGoldCrawler, runForexCrawler };
