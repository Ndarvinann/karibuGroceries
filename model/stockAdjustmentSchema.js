const mongoose = require('mongoose');

const stockAdjustmentSchema = new mongoose.Schema({
    product: {
        type: String,
        required: true
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