import React from 'react';
import { usePriceStore } from '../store/usePriceStore';
import { TrendingUp, Globe, ArrowRightLeft, CreditCard, Coins } from 'lucide-react';

const CURRENCY_FLAGS = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
  AUD: '🇦🇺', SGD: '🇸🇬', CNY: '🇨🇳', THB: '🇹🇭', KRW: '🇰🇷',
  CAD: '🇨🇦', CHF: '🇨🇭', HKD: '🇭🇰',
};

const POWER_CURRENCIES = ['USD', 'EUR', 'JPY'];

function formatRate(val) {
  if (val == null) return '—';
  return val.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
}

export default function ForexTable() {
  const forexRates = usePriceStore((s) => s.forexRates);
  const lastUpdated = usePriceStore((s) => s.forexLastUpdated);

  const powerRates = forexRates.filter(r => POWER_CURRENCIES.includes(r.currency));
  const otherRates = forexRates.filter(r => !POWER_CURRENCIES.includes(r.currency));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="section-title">Tỷ giá hối đoái</h2>
           <p className="text-xs text-gray-500 mt-1">Cập nhật từ Vietcombank (VCB)</p>
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
             <span className="text-[10px] text-gray-400 font-mono">
               {lastUpdated.toLocaleTimeString('vi-VN')}
             </span>
          </div>
        )}
      </div>

      {/* Power Plates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {powerRates.map(r => (
            <div key={r.currency} className="card p-4 border border-white/10 bg-gradient-to-br from-surface-card to-surface group hover:border-gold-500/30 transition-all duration-500">
               <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                     <span className="text-xl">{CURRENCY_FLAGS[r.currency] || '🏳️'}</span>
                     <span className="font-display font-bold text-white">{r.currency}</span>
                  </div>
                  <TrendingUp size={14} className="text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1">Mua vào</p>
                    <p className="price-value text-lg text-emerald-400">{formatRate(r.buyPrice)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1">Bán ra</p>
                    <p className="price-value text-lg text-red-400">{formatRate(r.sellPrice)}</p>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* Main List Board */}
      <div className="card overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                <th className="text-left px-5 py-4 font-bold">Ngoại tệ</th>
                <th className="text-right px-5 py-4 font-bold"><div className="flex items-center justify-end gap-1.5"><Coins size={10} /> Mua mặt</div></th>
                <th className="text-right px-5 py-4 font-bold"><div className="flex items-center justify-end gap-1.5"><ArrowRightLeft size={10} /> Chuyển khoản</div></th>
                <th className="text-right px-5 py-4 font-bold"><div className="flex items-center justify-end gap-1.5"><CreditCard size={10} /> Bán ra</div></th>
              </tr>
            </thead>
            <tbody>
              {forexRates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-600 italic">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
                      Đang tải tỷ giá...
                    </div>
                  </td>
                </tr>
              ) : (
                otherRates.map((r) => (
                  <tr key={r.currency} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{CURRENCY_FLAGS[r.currency] || '🏳️'}</span>
                        <span className="font-mono font-bold text-gray-200">{r.currency}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-mono text-emerald-400 font-bold">{formatRate(r.buyPrice)}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-mono text-gray-400">{formatRate(r.transferPrice)}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-mono text-red-400 font-bold">{formatRate(r.sellPrice)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

