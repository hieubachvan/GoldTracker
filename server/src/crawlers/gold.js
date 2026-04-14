const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

const URL_24H = 'https://www.24h.com.vn/gia-vang-hom-nay-c425.html';

/**
 * Parse price string từ 24h.com.vn
 * Giá hiển thị dạng "170,500" (nghìn đồng/lượng) → đổi sang triệu/lượng
 */
const parsePrice = (str) => {
  if (!str) return NaN;
  const num = parseFloat(str.replace(/,/g, ''));
  // Giá trên 24h là đơn vị nghìn đồng → chia 1000 để ra triệu/lượng
  return +(num / 1000).toFixed(3);
};

/**
 * Crawl giá vàng từ 24h.com.vn
 * Parse tất cả các box trong khu vực "Giá vàng"
 */
const crawl24hGold = async () => {
  try {
    // Thêm timestamp để bypass CDN/Cache của 24h
    const cacheBuster = `?_t=${Date.now()}`;
    const { data: html } = await axios.get(URL_24H + cacheBuster, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'vi-VN,vi;q=0.9',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        Referer: 'https://www.24h.com.vn/',
      },
    });


    const $ = cheerio.load(html);
    let prices = [];

    // ── Ưu tiên: parse bảng chi tiết .tabBody ──────────────────────────────
    $('.tabBody tr').each((_, row) => {
      const cols = $(row).find('td');
      if (cols.length < 4) return;

      const rawName = $(cols[0]).text().trim();
      const buyText = $(cols[1]).text().trim().split('\n')[0]; // Giá mua hôm nay
      const sellText = $(cols[2]).text().trim().split('\n')[0]; // Giá bán hôm nay


      const buyPrice = parsePrice(buyText);
      const sellPrice = parsePrice(sellText);

      if (!rawName || isNaN(buyPrice) || isNaN(sellPrice) || buyPrice <= 0) return;

      prices.push({
        source: mapSource(rawName),
        type: rawName,
        buyPrice,
        sellPrice,
        unit: 'triệu/lượng',
      });
    });

    // ── Fallback: parse slider boxes ở header ──────────────────────────────
    if (prices.length === 0) {
      logger.info('tabBody không có dữ liệu, fallback sang slider boxes...');

      const goldSection = $('.cate-24h-kd-ex-rate')
        .find('.cate-24h-kd-ex-rate__tit h2')
        .filter((_, el) => $(el).text().toLowerCase().includes('vàng'))
        .closest('.col-3');

      goldSection.find('[class^="box-"]').each((_, box) => {
        const $box = $(box);
        const rawName = $box.find('.title').text().trim().toUpperCase();
        const buyText = $box.find('span.buy').not('.sell').find('strong').text().trim();
        const sellText = $box.find('span.buy.sell').find('strong').text().trim();
        const buyPrice = parsePrice(buyText);
        const sellPrice = parsePrice(sellText);
        if (rawName && !isNaN(buyPrice) && !isNaN(sellPrice) && buyPrice > 0) {
          prices.push({ source: mapSource(rawName), type: rawName, buyPrice, sellPrice, unit: 'triệu/lượng' });
        }
      });
    }

    if (prices.length === 0) {
      logger.warn('⚠️ 24h crawler: không parse được dữ liệu, dùng mock');
      return getMockGoldPrices();
    }

    const sources = [...new Set(prices.map((p) => p.source))];
    logger.info(`✅ 24h crawler (giá vàng): ${prices.length} mục — ${sources.join(', ')}`);
    return prices;
  } catch (err) {
    logger.warn(`⚠️ 24h gold crawler lỗi: ${err.message}. Dùng mock data.`);
    return getMockGoldPrices();
  }
};


/**
 * Map tên hiển thị → source chuẩn
 */
const mapSource = (name) => {
  if (name.includes('SJC')) return 'SJC';
  if (name.includes('DOJI')) return 'DOJI';
  if (name.includes('PNJ')) return 'PNJ';
  if (name.includes('BTMH') || name.includes('BẢO TÍN')) return 'BTMH';
  return name; // giữ nguyên nếu không match
};

/**
 * Mock data khi crawler thất bại
 */
const getMockGoldPrices = () => {
  const now = Date.now();
  const rand = (v) => +(v + (Math.random() - 0.5) * 0.4).toFixed(2);
  return [
    { source: 'SJC', type: 'SJC', buyPrice: rand(122.5), sellPrice: rand(124.8), unit: 'triệu/lượng' },
    { source: 'SJC', type: 'SJC 1L', buyPrice: rand(122.5), sellPrice: rand(124.8), unit: 'triệu/lượng' },
    { source: 'DOJI', type: 'DOJI', buyPrice: rand(121.5), sellPrice: rand(124.0), unit: 'triệu/lượng' },
    { source: 'PNJ', type: 'PNJ', buyPrice: rand(121.0), sellPrice: rand(123.5), unit: 'triệu/lượng' },
    { source: 'BTMH', type: 'BTMH', buyPrice: rand(121.2), sellPrice: rand(123.8), unit: 'triệu/lượng' },
  ];
};

module.exports = { crawl24hGold, getMockGoldPrices };
