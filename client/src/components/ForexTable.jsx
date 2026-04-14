import { usePriceStore } from '../store/usePriceStore';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

const CURRENCY_FLAGS = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
  AUD: '🇦🇺', SGD: '🇸🇬', CNY: '🇨🇳', THB: '🇹🇭', KRW: '🇰🇷',
};

function formatRate(val) {
  if (val == null) return '—';
  return val.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
}

export default function ForexTable() {
  const forexRates = usePriceStore((s) => s.forexRates);
  const lastUpdated = usePriceStore((s) => s.forexLastUpdated);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Tỷ giá hối đoái</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-mono">VCB</span>
          {lastUpdated && (
            <span className="text-[10px] text-gray-600 font-mono">
              {lastUpdated.toLocaleTimeString('vi-VN')}
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] text-gray-600 uppercase tracking-wider border-b border-surface-border/40">
              <th className="text-left pb-2 font-medium">Ngoại tệ</th>
              <th className="text-right pb-2 font-medium">Mua tiền mặt</th>
              <th className="text-right pb-2 font-medium">Chuyển khoản</th>
              <th className="text-right pb-2 font-medium">Bán ra</th>
            </tr>
          </thead>
          <tbody>
            {forexRates.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-600">
                  Đang tải tỷ giá...
                </td>
              </tr>
            ) : (
              forexRates.map((r) => (
                <ForexRow key={r.currency} rate={r} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ForexRow({ rate }) {
  const flag = CURRENCY_FLAGS[rate.currency] || '🏳️';
  const spread = rate.sellPrice - rate.buyPrice;

  return (
    <tr className="border-b border-surface-border/20 hover:bg-surface-hover/50 transition-colors group">
      <td className="py-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{flag}</span>
          <div>
            <p className="font-mono font-semibold text-white text-xs">{rate.currency}</p>
            <p className="text-[9px] text-gray-600">{rate.source}</p>
          </div>
        </div>
      </td>
      <td className="py-3 text-right">
        <span className="price-value text-xs">{formatRate(rate.buyPrice)}</span>
      </td>
      <td className="py-3 text-right">
        <span className="font-mono text-xs text-gray-300">{formatRate(rate.transferPrice)}</span>
      </td>
      <td className="py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <span className="price-value text-xs">{formatRate(rate.sellPrice)}</span>
          <span className="text-[9px] text-red-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
            +{formatRate(spread)}
          </span>
        </div>
      </td>
    </tr>
  );
}
