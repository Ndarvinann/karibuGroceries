const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stockAdjustmentSchema = new mongoose.Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'procurementShema'
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