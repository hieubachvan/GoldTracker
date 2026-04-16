import PriceCard from '../components/PriceCard';
import GoldChart from '../components/GoldChart';
import WorldPriceChart from '../components/WorldPriceChart';
import PriceCalculator from '../components/PriceCalculator';
import ForexTable from '../components/ForexTable';
import { usePriceStore } from '../store/usePriceStore';
import { useGoldPrice, useForex } from '../hooks/useGoldPrice';
import { useSocket } from '../hooks/useSocket';

const SOURCES = ['SJC', 'PNJ', 'DOJI', 'BTMH', 'Phú Quý (Bạc)'];

export default function Dashboard() {

  // Initialize data fetching and socket connection
  useSocket();
  useGoldPrice();
  useForex();

  const pricesBySrc = usePriceStore((s) => s.pricesBySrc);
  
  // Extract real SJC prices for the Hero section
  const sjcPrices = pricesBySrc['SJC'] || [];
  const sjc1L = sjcPrices.find(p => p.type === 'SJC 1L' || p.type === 'SJC') || sjcPrices[0];
  const sjcBuy = sjc1L ? sjc1L.buyPrice.toFixed(2) + ' tr' : 'Đang tải...';
  const sjcSell = sjc1L ? sjc1L.sellPrice.toFixed(2) + ' tr' : 'Đang tải...';

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-up">
      {/* Hero stat strip */}
      <section className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-surface-card via-surface shadow-xl border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gold-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="flex flex-wrap gap-6 items-center relative z-10">
          <div>
            <p className="text-[10px] text-gold-500 uppercase tracking-widest font-mono mb-1">Cập nhật tự động</p>
            <p className="font-display text-2xl font-bold text-white tracking-tight">Giá vàng hôm nay</p>
          </div>
          <div className="h-12 w-px bg-white/10 hidden sm:block mx-2" />
          <StatItem label="Giá SJC Mua vào" sublabel="Phổ biến nhất" value={sjcBuy} color="text-emerald-400" />
          <div className="h-12 w-px bg-white/10 hidden sm:block mx-2" />
          <StatItem label="Giá SJC Bán ra" sublabel="Phổ biến nhất" value={sjcSell} color="text-red-400" />
          <div className="h-12 w-px bg-white/10 hidden sm:block mx-2" />
          <div className="flex-1 text-right hidden md:block">
            <p className="text-[10px] text-gray-500 font-mono mb-1 uppercase tracking-wider">Nguồn dữ liệu Realtime</p>
            <p className="text-xs text-gray-400 font-medium">SJC · PNJ · DOJI · BTMH · Phú Quý</p>
          </div>
        </div>
      </section>

      {/* Analysis & Tools */}
      <section className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
            <GoldChart />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WorldPriceChart pid={68} title="Giá Vàng Thế Giới" color="#eab308" />
              <WorldPriceChart pid={69} title="Giá Bạc Thế Giới" isSilver={true} color="#94a3b8" />
            </div>
        </div>
        <div className="h-full">
            <PriceCalculator />
        </div>
      </section>

      {/* Price Cards Grid (Masonry) */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Giá vàng & bạc toàn quốc</h2>
            <p className="text-xs text-gray-500 mt-1">Dữ liệu được tổng hợp từ các nguồn uy tín hàng đầu</p>
          </div>
        </div>
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {SOURCES.map((src) => (
            <div key={src} className="break-inside-avoid shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300">
              <PriceCard source={src} />
            </div>
          ))}
        </div>
      </section>


      {/* Forex table */}
      <section>
        <ForexTable />
      </section>
    </main>
  );
}


function StatItem({ label, sublabel, value, color = "text-white" }) {
  return (
    <div>
      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-medium">{sublabel}</p>
      <p className="text-[11px] text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={`price-value text-xl mt-0.5 tracking-tight ${color}`}>{value}</p>
    </div>
  );
}

