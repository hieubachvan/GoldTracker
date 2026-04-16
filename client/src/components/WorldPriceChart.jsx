import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useWorldPrice } from '../hooks/useWorldPrice';

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export default function WorldPriceChart({ pid, title, isSilver, color = "#eab308" }) {
  const { history: chartData, current: worldCurrent, isLoading } = useWorldPrice(pid);
  
  const avg = chartData.length
    ? chartData.reduce((s, d) => s + d.price, 0) / chartData.length
    : null;

  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-surface-border/40">
        <div>
          <h2 className="section-title">{title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">XA{isSilver ? 'G' : 'U'}/USD (Kitco/Investing Realtime)</p>
        </div>
      </div>

      {isLoading && chartData.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-600 text-sm animate-pulse-slow">
          Đang kết nối dữ liệu thế giới...
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-600 text-sm animate-pulse-slow">
          Đang chờ dữ liệu realtime...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${pid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
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
              tickFormatter={(v) => v.toFixed(isSilver ? 2 : 0)}
            />
            <Tooltip labelFormatter={formatTime} />
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
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${pid})`}
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 4, fill: color, stroke: '#0f0f14', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {worldCurrent && (
        <div className="flex gap-6 mt-4 pt-4 border-t border-surface-border/40">
          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Hiện tại</p>
            <p className="price-value text-base" style={{ color }}>${worldCurrent.price?.toFixed(isSilver ? 3 : 2)}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Bid</p>
            <p className="font-mono text-sm">${worldCurrent.bid?.toFixed(isSilver ? 3 : 2)}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Ask</p>
            <p className="font-mono text-sm">${worldCurrent.ask?.toFixed(isSilver ? 3 : 2)}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">High</p>
            <p className="font-mono text-sm text-green-400">${worldCurrent.high?.toFixed(isSilver ? 3 : 2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
