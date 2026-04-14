require('dotenv').config();
const { crawlSilver } = require('./src/crawlers/silver');

crawlSilver().then((prices) => {
  console.log('\n✅ Kết quả crawler giabac.vn:');
  console.table(prices.map(p => ({
    source: p.source,
    type: p.type,
    buy: p.buyPrice + ' ' + p.unit,
    sell: p.sellPrice + ' ' + p.unit,
  })));
}).catch(e => console.error('❌', e.message));
