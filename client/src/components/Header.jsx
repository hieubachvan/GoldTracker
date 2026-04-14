import React, { useState } from 'react';
import { Activity, RefreshCw, Zap } from 'lucide-react';
import { usePriceStore } from '../store/usePriceStore';

export default function Header() {
  const connectionStatus = usePriceStore((s) => s.connectionStatus);
  const lastUpdated = usePriceStore((s) => s.lastUpdated);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await fetch('http://localhost:4000/api/sync', { method: 'POST' });
    } catch (err) {
      console.error('Failed to trigger sync manually', err);
    } finally {
      setTimeout(() => setIsSyncing(false), 2000); // Visual feedback debounce
    }
  };



  const statusMap = {
    connected: { label: 'Live', className: 'badge-up', dot: 'bg-emerald-400' },
    connecting: { label: 'Connecting...', className: 'badge-neutral', dot: 'bg-yellow-400 animate-pulse' },
    disconnected: { label: 'Offline', className: 'badge-down', dot: 'bg-red-400' },
  };
  const status = statusMap[connectionStatus] || statusMap.disconnected;

  return (
    <header className="border-b border-surface-border/60 bg-surface/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center shadow-gold">
            <span className="text-gold-400 text-sm font-bold">Au</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-base leading-none">GoldTracker</h1>
            <p className="text-[10px] text-gray-600 mt-0.5">Thị trường vàng & ngoại hối</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className={`hidden sm:flex items-center gap-1.5 text-xs bg-surface-card border border-white/5 hover:border-white/20 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-all active:scale-95 ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Đồng bộ ngay lập tức"
          >
            <RefreshCw size={12} className={isSyncing ? 'animate-spin text-gold-400' : ''} />
            <span>Làm mới</span>
          </button>

          {lastUpdated && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
              <span className="font-mono">
                {lastUpdated.toLocaleTimeString('vi-VN')}
              </span>
            </div>
          )}
          <div className={`badge ${status.className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
            <Zap size={12} className="text-gold-500" />
            <span>Realtime</span>
          </div>
        </div>

      </div>
    </header>
  );
}
