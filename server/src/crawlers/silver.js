const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

const URL_GIABAC = 'https://giabac.vn/';

/**
 * Parse chuỗi giá "2,897,000" thành triệu VNĐ (vd: 2.897)
 * Để đồng nhất thư viện lưu trữ chung với Vàng
 */
const parsePriceToTrieu = (str) => {
  if (!str) return NaN;
  const num = parseFloat(str.replace(/,/g, ''));
  return +(num / 1000000).toFixed(3);
};

const crawlSilver = async () => {
  try {
    const { data: html } = await axios.get(URL_GIABAC, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'vi-VN,vi;q=0.9',
      },
    });

    const $ = cheerio.load(html);
    const prices = [];

    // Table chứa giá list ở dạng #priceTable table tbody tr
    $('#priceTable table tbody tr').each((_, row) => {
      const cols = $(row).find('td');
      if (cols.length < 4) return;

      const rawName = $(cols[0]).text().trim();
      const rawUnit = $(cols[1]).text().trim(); // Vnđ/Lượng, Vnđ/Kg
      const buyText = $(cols[2]).text().trim();
      const sellText = $(cols[3]).text().trim();

      const buyPrice = parsePriceToTrieu(buyText);
      const sellPrice = parsePriceToTrieu(sellText);

      if (!rawName || isNaN(buyPrice) || isNaN(sellPrice) || buyPrice <= 0) return;

      // Chuẩn hóa unit
      let unit = rawUnit.toLowerCase().includes('lượng') ? 'triệu/lượng' : 'triệu/' + rawUnit.split('/')[1]?.toLowerCase() || 'triệu';

      prices.push({
        source: 'Phú Quý (Bạc)',
        type: rawName,
        buyPrice,
        sellPrice,
        unit,
      });
    });

    if (prices.length === 0) {
      logger.warn('⚠️ Silver crawler: không parse được dữ liệu, dùng mock');
      return getMockSilverPrices();
    }

    logger.info(`✅ Silver crawler (giá bạc): ${prices.length} mục`);
    return prices;
  } catch (err) {
    logger.warn(`⚠️ Silver crawler lỗi: ${err.message}. Dùng mock data.`);
    return getMockSilverPrices();
  }
};

const getMockSilverPrices = () => {
  const rand = (v) => +(v + (Math.random() - 0.5) * 0.1).toFixed(3);
  return [
    { source: 'Phú Quý (Bạc)', type: 'Bạc miếng Phú Quý 999 1 lượng', buyPrice: rand(2.897), sellPrice: rand(2.987), unit: 'triệu/lượng' },
    { source: 'Phú Quý (Bạc)', type: 'Bạc thỏi Phú Quý 999 1Kilo', buyPrice: rand(77.253), sellPrice: rand(79.653), unit: 'triệu/kg' },
  ];
};

module.exports = { crawlSilver, getMockSilverPrices };
