const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema(
  {
    source: { type: String, required: true, enum: ['SJC', 'PNJ', 'DOJI'], index: true },
    type: { type: String, required: true }, // e.g. "SJC 1L", "Ring 99.99"
    buyPrice: { type: Number, required: true },
    sellPrice: { type: Number, required: true },
    unit: { type: String, default: 'triệu/lượng' },
    crawledAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// Index for time-series queries
priceSchema.index({ source: 1, crawledAt: -1 });
priceSchema.index({ crawledAt: -1 });

module.exports = mongoose.model('Price', priceSchema);
