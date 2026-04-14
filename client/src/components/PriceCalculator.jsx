import React, { useState, useEffect } from 'react';
import { Calculator, ArrowLeftRight, Coins, DollarSign } from 'lucide-react';
import { usePriceStore } from '../store/usePriceStore';

export default function PriceCalculator() {
  const { pricesBySrc, selectedSource, forexRates: forex } = usePriceStore();
  
  const [mode, setMode] = useState('gold'); // 'gold' or 'forex'
  const [type, setType] = useState('');
  const [tradeType, setTradeType] = useState('sellPrice'); // người dùng 'bán' cho cửa hàng or 'mua' từ cửa hàng
  // 'buyPrice' of store = price user sells at
  // 'sellPrice' of store = price user buys at
  
  const [vnd, setVnd] = useState('');
  const [amount, setAmount] = useState('');
  const [lastChanged, setLastChanged] = useState('vnd'); // 'vnd' or 'amount'

  // Get available types for selected source
  const availableTypes = pricesBySrc[selectedSource] || [];
  
  useEffect(() => {
    if (mode === 'gold') {
      if (availableTypes.length > 0) {
        setType(availableTypes[0].type);
      }
    } else {
      if (forex.length > 0) {
        setType(forex[0].currency);
      }
    }
  }, [mode, selectedSource, availableTypes.length, forex.length]);


  const selectedPriceData = availableTypes.find(p => p.type === type);
  const selectedForexData = forex.find(f => f.currency === type);

  const calculate = (val, fromField) => {
    let price = 0;
    if (mode === 'gold') {
       if (!selectedPriceData) return;
       // Giá trên UI là triệu/lượng. 1 lượng = 10 chỉ.
       // Nếu type có chữ 'chỉ' thì có thể 24h đã quy đổi? 
       // Thực tế 24h trả về triệu/lượng cho hầu hết.
       price = selectedPriceData[tradeType] * 1000000;
    } else {
       if (!selectedForexData) return;
       // Forex buy/sell/transfer
       price = selectedForexData[tradeType === 'buyPrice' ? 'buyPrice' : 'sellPrice'];
    }

    if (!price || isNaN(price)) return;

    if (fromField === 'vnd') {
      const num = parseFloat(val.replace(/,/g, ''));
      if (isNaN(num)) {
        setAmount('');
      } else {
        setAmount((num / price).toFixed(3));
      }
    } else {
      const num = parseFloat(val);
      if (isNaN(num)) {
        setVnd('');
      } else {
        const result = num * price;
        setVnd(new Intl.NumberFormat('vi-VN').format(Math.round(result)));
      }
    }
  };

  const handleVndChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    const formatted = new Intl.NumberFormat('vi-VN').format(val);
    setVnd(val === '' ? '' : formatted);
    setLastChanged('vnd');
    calculate(val, 'vnd');
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    setLastChanged('amount');
    calculate(val, 'amount');
  };

  // Recalculate when price/source changes
  useEffect(() => {
    if (lastChanged === 'vnd') {
        calculate(vnd.replace(/\./g, ''), 'vnd');
    } else {
        calculate(amount, 'amount');
    }
  }, [selectedSource, type, tradeType, mode]);

  return (
    <div className="card p-6 border border-white/5 bg-surface-card/50 backdrop-blur-xl relative overflow-hidden group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gold-500/10 border border-gold-500/20">
            <Calculator size={18} className="text-gold-400" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Công cụ tính toán</h2>
        </div>
        
        <div className="flex bg-surface-hover rounded-lg p-1 border border-white/5">
          <button 
            onClick={() => { setMode('gold'); setType(availableTypes[0]?.type || ''); }}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${mode === 'gold' ? 'bg-gold-500 text-black' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Vàng
          </button>
          <button 
            onClick={() => { setMode('forex'); setType(forex[0]?.currency || ''); }}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${mode === 'forex' ? 'bg-emerald-500 text-black' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Ngoại tệ
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Selection Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest pl-1">Loại {mode === 'gold' ? 'vàng' : 'tệ'}</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-surface-hover border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500/50 appearance-none"
            >
              {mode === 'gold' 
                ? availableTypes.map(p => <option key={p.type} value={p.type}>{p.type}</option>)
                : forex.map(f => <option key={f.currency} value={f.currency}>{f.currency}</option>)
              }
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest pl-1">Bạn đang...</label>
            <div className="flex bg-surface-hover rounded-xl p-1 border border-white/5 h-[42px]">
                <button 
                    onClick={() => setTradeType('sellPrice')}
                    className={`flex-1 rounded-lg text-[11px] font-bold transition-all ${tradeType === 'sellPrice' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                >
                    Mua vào
                </button>
                <button 
                    onClick={() => setTradeType('buyPrice')}
                    className={`flex-1 rounded-lg text-[11px] font-bold transition-all ${tradeType === 'buyPrice' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                >
                    Bán ra
                </button>
            </div>
          </div>
        </div>

        {/* Input VND */}
        <div className="relative group/input">
          <label className="absolute -top-2 left-3 px-1 bg-surface-card text-[9px] text-gray-500 uppercase font-bold tracking-widest">Số tiền (VND)</label>
          <div className="flex items-center bg-surface-hover border border-white/5 group-focus-within/input:border-gold-500/50 rounded-xl px-4 py-3 transition-colors">
            <input 
              type="text"
              value={vnd}
              onChange={handleVndChange}
              placeholder="0"
              className="bg-transparent border-none focus:ring-0 w-full text-lg font-mono text-white placeholder:text-gray-700"
            />
            <span className="text-gray-600 font-bold text-xs ml-2">VNĐ</span>
          </div>
        </div>

        <div className="flex justify-center -my-2 relative z-10">
            <div className="p-2 bg-surface-card border border-white/10 rounded-full shadow-lg text-gold-400">
                <ArrowLeftRight size={14} />
            </div>
        </div>

        {/* Input Amount */}
        <div className="relative group/input">
          <label className="absolute -top-2 left-3 px-1 bg-surface-card text-[9px] text-gray-500 uppercase font-bold tracking-widest">
            Số lượng ({mode === 'gold' ? (selectedPriceData?.unit?.includes('kg') ? 'Kg' : 'Lượng') : type})
          </label>
          <div className="flex items-center bg-surface-hover border border-white/5 group-focus-within/input:border-gold-500/50 rounded-xl px-4 py-3 transition-colors">
            <input 
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.000"
              className="bg-transparent border-none focus:ring-0 w-full text-lg font-mono text-white placeholder:text-gray-700"
            />
            <span className="text-gray-600 font-bold text-xs ml-2">
                {mode === 'gold' ? (selectedPriceData?.unit?.includes('kg') ? 'Kg' : 'Lượng') : type}
            </span>
          </div>
        </div>

        <div className="pt-2">
            <div className="p-3 rounded-xl bg-gold-500/5 border border-gold-500/10 flex items-center justify-between">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tỷ giá áp dụng</p>
                <p className="text-xs font-mono text-gold-400 font-bold">
                    {mode === 'gold' 
                        ? (selectedPriceData ? `${selectedPriceData[tradeType].toFixed(2)} tr/lượng` : '—')
                        : (selectedForexData ? `${new Intl.NumberFormat('vi-VN').format(selectedForexData[tradeType === 'buyPrice' ? 'buyPrice' : 'sellPrice'])} đ` : '—')
                    }
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
