const mongoose = require("mongoose");

const creditSaleSchema = new mongoose.Schema({
    creditBuyer:{
        type: String,
        required: true,
        trim:true,
    },
    creditNIN:{
        type: String,
        required: true,
        trim: true,
    },
    creditLocation:{
        type: String,
        required:true,
        trim:true,
    },
    creditContact:{
        type:String,
        trim: true,
        required: true,
        unique: true,
    },
    creditAmount:{
        type: Number,
        required: true,
        min: 0,
    },
    creditDueDate:{
        type: Date,
        default:() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) //30days from today
    },
    status: {
        type: String,
        enum: ["Pending", "Paid", "Overdue"],
        default: "Pending"
    },
    creditProduct:{
        type: String,
        required: true,
        enum:['Beans','Maize', 'Peas', 'SoyBeans', 'Gnuts'],
    },
    creditTonnage:{
        type:Number,
        trim: true,
        required:true, 
    },
    dispatchDate:{
        type: Date,
        default: Date.now 
    },
    creditAgent:{
        type: String,
        trim: true, 
    },
creditCost: { 
        type: Number,
        },
creditProfit: {
     type: Number, 
   },
});
module.exports = mongoose.model('creditSale', creditSaleSchema);
