import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { usePriceStore } from '../store/usePriceStore';
import { useGoldHistory } from '../hooks/useGoldPrice';

const FIELD_LABELS = { buyPrice: 'Giá Mua', sellPrice: 'Giá Bán' };
const SOURCES = ['SJC', 'PNJ', 'DOJI', 'BTMH', 'Phú Quý (Bạc)'];

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="card p-3 text-xs min-w-[140px]">
      <p className="text-gray-400 mb-2">{formatTime(label)}</p>
      <p className="price-value text-sm">{p.value?.toFixed(3)} tr/lượng</p>
    </div>
  );
};

export default function GoldChart() {
  const source = usePriceStore((s) => s.selectedSource);
  const setSelectedSource = usePriceStore((s) => s.setSelectedSource);
  const selectedChart = usePriceStore((s) => s.selectedChart);
  const setSelectedChart = usePriceStore((s) => s.setSelectedChart);
  const pricesBySrc = usePriceStore((s) => s.pricesBySrc);

  const firstType = pricesBySrc[source]?.[0]?.type;
  const { data: history, isLoading } = useGoldHistory(source, firstType);

  const chartData = (history || []).map((p) => ({
    time: new Date(p.crawledAt).getTime(),
    buyPrice: p.buyPrice,
    sellPrice: p.sellPrice,
  }));

  const currentData = pricesBySrc[source]?.[0];
  const avg = chartData.length
    ? chartData.reduce((s, d) => s + d[selectedChart], 0) / chartData.length
    : null;

  return (
    <div className="card p-5 h-full flex flex-col">
      {/* Source Selector Internal */}
      <div className="flex gap-1.5 overflow-x-auto pb-4 mb-4 border-b border-surface-border/40 scrollbar-hide">
        {SOURCES.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedSource(s)}
            className={`text-[10px] px-3 py-1.5 rounded-lg transition-all font-bold uppercase tracking-wider whitespace-nowrap ${
              source === s
                ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                : 'bg-surface-hover text-gray-500 hover:text-gray-300 border border-transparent'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="section-title">Biểu đồ {source}</h2>
          {firstType && <p className="text-xs text-gray-500 mt-0.5">{firstType}</p>}
        </div>
        <div className="flex gap-1.5">
          {Object.entries(FIELD_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedChart(key)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${
                selectedChart === key
                  ? 'bg-gold-500 text-black'
                  : 'bg-surface-hover text-gray-400 hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>


      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-gray-600 text-sm animate-pulse-slow">
          Đang tải dữ liệu...
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
          Chưa có dữ liệu lịch sử
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
            <XAxis
              dataKey="time"
              tickFormatter={formatTime}
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v.toFixed(1)}
            />
            <Tooltip content={<CustomTooltip />} />
            {avg && (
              <ReferenceLine
                y={avg}
                stroke="#4b5563"
                strokeDasharray="4 4"
                label={{ value: 'TB', fill: '#6b7280', fontSize: 10 }}
              />
            )}
            <Area
              type="monotone"
              dataKey={selectedChart}
              stroke="#eab308"
              strokeWidth={2}
              fill="url(#goldGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#eab308', stroke: '#0f0f14', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {currentData && (
        <div className="flex gap-6 mt-4 pt-4 border-t border-surface-border/40">
          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Mua</p>
            <p className="price-value text-base">{currentData.buyPrice?.toFixed(2)} tr</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Bán</p>
            <p className="price-value text-base">{currentData.sellPrice?.toFixed(2)} tr</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Chênh lệch</p>
            <p className="font-mono text-sm text-red-400">
              {(currentData.sellPrice - currentData.buyPrice).toFixed(2)} tr
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
