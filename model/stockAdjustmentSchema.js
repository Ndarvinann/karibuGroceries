// D:\workspace\karibuGroceries\model\stockAdjustmentSchema.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stockAdjustmentSchema = new mongoose.Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'procurement' // Ensure this matches the model name for your procurement schema
  },
  quantityAdjusted: {
    type: Number,
    required: true
  },
  reason: {
    type: String
  },
  notes: {
    type: String
  },
  adjustedBy: {
    type: String
  },
  adjustmentDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StockAdjustment', stockAdjustmentSchema);