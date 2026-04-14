import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { usePriceStore } from '../store/usePriceStore';

const SOURCE_COLORS = {
  SJC: 'text-gold-400',
  PNJ: 'text-purple-400',
  DOJI: 'text-sky-400',
  BTMH: 'text-emerald-400',
  'Phú Quý (Bạc)': 'text-zinc-300',
};

const SOURCE_BG = {
  SJC: 'bg-gold-500/5 hover:bg-gold-500/10 border-gold-500/20',
  PNJ: 'bg-purple-500/5 hover:bg-purple-500/10 border-purple-500/20',
  DOJI: 'bg-sky-500/5 hover:bg-sky-500/10 border-sky-500/20',
  BTMH: 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20',
  'Phú Quý (Bạc)': 'bg-zinc-500/5 hover:bg-zinc-500/10 border-zinc-500/20',
};

function formatPrice(val) {
  if (val == null) return '—';
  // Nếu giá trị lớn (như 77.203 triệu/kg) thì để 3 số thập phân, nếu không thì 2
  const decimals = val > 50 || val < 10 ? 3 : 2;
  return val.toFixed(decimals);
}

function formatUnitSuffix(unit) {
  if (!unit) return '';
  return unit.replace('triệu', 'tr').trim();
}

export default function PriceCard({ source }) {
  const pricesBySrc = usePriceStore((s) => s.pricesBySrc);
  const lastUpdated = usePriceStore((s) => s.lastUpdated);
  const prices = pricesBySrc[source] || [];

  const colorClass = SOURCE_COLORS[source] || 'text-gray-300';
  const bgClass = SOURCE_BG[source] || 'bg-surface-hover border-surface-border';
  const isSilver = source.includes('Bạc');

  return (
    <div className={`h-full border ${bgClass} rounded-2xl backdrop-blur-md p-6 transition-all duration-300 group`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className={`font-display text-2xl tracking-tight font-bold ${colorClass}`}>{source}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest ${isSilver ? 'bg-zinc-800 text-zinc-300' : 'bg-gold-900 text-gold-400'}`}>
            {isSilver ? 'Bạc' : 'Vàng'}
          </span>
        </div>
        {lastUpdated && (
          <span className="text-[10px] text-gray-500/70 font-mono tracking-widest">
            {lastUpdated.toLocaleTimeString('vi-VN')}
          </span>
        )}
      </div>

      {prices.length === 0 ? (
        <div className="flex justify-center items-center h-24 text-gray-500 text-sm font-mono animate-pulse">
          Đang kết nối...
        </div>
      ) : (
        <div className="space-y-4">
          {prices.map((p, i) => (
            <PriceRow key={i} price={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function PriceRow({ price }) {
  const diff = price.sellPrice - price.buyPrice;
  const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral';

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors">
      <div className="flex-1 mb-2 sm:mb-0">
        <p className="text-sm font-medium text-gray-300">{price.type}</p>
        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{price.unit}</p>
      </div>
      <div className="flex items-center gap-6 text-right">
        <div>
          <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Mua vào</p>
          <div className="flex items-baseline gap-1">
            <p className="font-mono text-base font-medium text-white">{formatPrice(price.buyPrice)}</p>
          </div>
        </div>
        <div>
          <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Bán ra</p>
          <div className="flex items-baseline gap-1">
            <p className="font-mono text-base font-medium text-emerald-400">{formatPrice(price.sellPrice)}</p>
          </div>
        </div>
        <div className="w-4 flex justify-end">
          {trend === 'up' && <TrendingUp size={16} className="text-emerald-400 opacity-80" />}
          {trend === 'down' && <TrendingDown size={16} className="text-red-400 opacity-80" />}
          {trend === 'neutral' && <Minus size={16} className="text-gray-500 opacity-50" />}
        </div>
      </div>
    </div>
  );
}
