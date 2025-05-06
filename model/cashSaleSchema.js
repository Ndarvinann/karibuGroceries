const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cashSaleSchema = new mongoose.Schema({
  cashSale: {
    type: String,
    required: true,

  },
  cashTonnage: {
    type: Number,
    trim: true,
    required: true,
  },
  cashAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  cashBuyer: {
    type: String,
    required: true,
    trim: true,
  },
  cashAgent: {
    type: String,
    trim: true,
  },
  cashDate: {
    type: Date,
    default: Date.now,
  },
  productId: { 
  type: Schema.Types.ObjectId,
   ref: 'Procurement'
   } ,
   cashCost: {
    type: Number
   },        
  cashProfit: {
    type:Number 
  },
});

module.exports = mongoose.model("cashSale", cashSaleSchema);
