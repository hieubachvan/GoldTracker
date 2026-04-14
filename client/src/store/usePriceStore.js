import { create } from 'zustand';

export const usePriceStore = create((set, get) => ({
  // Current prices (grouped by source)
  prices: [],            // raw array from server
  pricesBySrc: {},       // { SJC: [...], PNJ: [...], DOJI: [...] }
  lastUpdated: null,
  isConnected: false,
  connectionStatus: 'disconnected', // 'connecting' | 'connected' | 'disconnected'

  // Forex rates
  forexRates: [],
  forexLastUpdated: null,

  // UI state
  selectedSource: 'SJC',
  selectedChart: 'sellPrice',

  setConnected: (connected) => set({ isConnected: connected, connectionStatus: connected ? 'connected' : 'disconnected' }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  setPrices: (prices) => {
    const pricesBySrc = prices.reduce((acc, p) => {
      (acc[p.source] = acc[p.source] || []).push(p);
      return acc;
    }, {});
    set({ prices, pricesBySrc, lastUpdated: new Date() });
  },

  setForex: (rates) => set({ forexRates: rates, forexLastUpdated: new Date() }),

  setSelectedSource: (source) => set({ selectedSource: source }),
  setSelectedChart: (field) => set({ selectedChart: field }),
}));
