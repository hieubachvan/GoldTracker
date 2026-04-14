const mongoose = require('mongoose');

const forexSchema = new mongoose.Schema(
  {
    currency: { type: String, required: true, uppercase: true, index: true }, // e.g. "USD", "EUR"
    buyPrice: { type: Number, required: true },
    sellPrice: { type: Number, required: true },
    transferPrice: { type: Number },
    source: { type: String, default: 'VCB' },
    crawledAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

forexSchema.index({ currency: 1, crawledAt: -1 });

module.exports = mongoose.model('Forex', forexSchema);
