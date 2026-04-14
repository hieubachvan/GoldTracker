const { z } = require('zod');

const PriceSchema = z.object({
  source: z.string().min(1),   // SJC, DOJI, PNJ, BTMH, v.v.
  type: z.string().min(1),
  buyPrice: z.number().positive(),
  sellPrice: z.number().positive(),
  unit: z.string().optional().default('triệu/lượng'),
});


const ForexSchema = z.object({
  currency: z.string().min(2).max(5).toUpperCase(),
  buyPrice: z.number().positive(),
  sellPrice: z.number().positive(),
  transferPrice: z.number().optional(),
  source: z.string().optional().default('VCB'),
});

const PriceArraySchema = z.array(PriceSchema);
const ForexArraySchema = z.array(ForexSchema);

module.exports = { PriceSchema, ForexSchema, PriceArraySchema, ForexArraySchema };
