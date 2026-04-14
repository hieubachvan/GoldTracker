const express = require('express');
const router = express.Router();
const { getPrisma } = require('../config/db');
const { getCache } = require('../jobs/cache');

/**
 * GET /api/prices/latest
 * Returns latest price from in-memory cache, fallback to DB
 */
router.get('/latest', async (req, res) => {
  try {
    const cached = getCache('latest_prices');
    if (cached) return res.json({ source: 'cache', data: cached });

    // Fallback: get latest per (source, type) cross-compatible with SQLite/Postgres
    const prisma = getPrisma();
    const latest = await prisma.price.findMany({
      distinct: ['source', 'type'],
      orderBy: { crawledAt: 'desc' }
    });



    res.json({ source: 'db', data: latest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/prices/history?source=SJC&type=SJC+1L&limit=100
 */
router.get('/history', async (req, res) => {
  try {
    const { source, type, limit = '100' } = req.query;
    const prisma = getPrisma();

    const prices = await prisma.price.findMany({
      where: {
        ...(source ? { source } : {}),
        ...(type ? { type } : {}),
      },
      orderBy: { crawledAt: 'desc' },
      take: parseInt(limit),
    });

    res.json({ data: prices.reverse() });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/prices/sources
 */
router.get('/sources', async (req, res) => {
  try {
    const prisma = getPrisma();
    const sources = await prisma.price.findMany({
      distinct: ['source'],
      select: { source: true },
    });
    res.json({ data: sources.map((s) => s.source) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
