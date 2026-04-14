const express = require('express');
const router = express.Router();
const { getPrisma } = require('../config/db');
const { getCache } = require('../jobs/cache');

/**
 * GET /api/forex/latest
 */
router.get('/latest', async (req, res) => {
  try {
    const cached = getCache('latest_forex');
    if (cached) return res.json({ source: 'cache', data: cached });

    const prisma = getPrisma();
    const latest = await prisma.forex.findMany({
      distinct: ['currency'],
      orderBy: { crawledAt: 'desc' }
    });

    res.json({ source: 'db', data: latest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/forex/history?currency=USD&limit=100
 */
router.get('/history', async (req, res) => {
  try {
    const { currency, limit = '100' } = req.query;
    const prisma = getPrisma();

    const rates = await prisma.forex.findMany({
      where: currency ? { currency: currency.toUpperCase() } : {},
      orderBy: { crawledAt: 'desc' },
      take: parseInt(limit),
    });

    res.json({ data: rates.reverse() });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
