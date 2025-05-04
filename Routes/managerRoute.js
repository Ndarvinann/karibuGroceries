const express = require('express');
const router = express.Router();
router.use(express.json());
const procurement = require('../model/procurementShema');
const StockAdjustment = require('../model/stockAdjustmentSchema');


router.get("/managerDash", async (req,res)=>{
    try {
        // the inventory stats Cards
        const allProducts = await procurement.find({});
        const totalProducts = allProducts.length;
        const lowStockThreshold = 30;
        const outOfStockThreshold = 0; 
        const lowStockItems = allProducts.filter(item => item.kilos <= lowStockThreshold).length; //find all items existing under 30
        const outOfStockItems = allProducts.filter(item => item.kilos <= outOfStockThreshold).length; // find all items existing at 0.

        //fetch all the items for the table
        const inventoryItems = await procurement.find({});

        // Fetch procurement history
        const procurementHistory = await procurement.find({}).sort({ dateAndTime: -1 }).limit(5); // Fetch latest 5 procurements

        //Fetch stock adjustment history
        const adjustmentHistory = await StockAdjustment.find({}).sort({ adjustmentDate: -1 }).limit(5); // Fetch latest 5 adjustments

        res.render('inventory',{
            //these are passed to the dashBoard to view. 
            totalProducts: totalProducts,
            lowStockItems: lowStockItems,
            outOfStockItems: outOfStockItems,
            inventoryItems: inventoryItems,
            adjustmentHistory: adjustmentHistory,
            procurementHistory: procurementHistory,
        });
    } catch (error) {
        console.error("Error fetching inventory data:", error);
        res.render('inventory', {
            //if an error occurs let them all fall back to zero.
            totalProducts: 0,
            lowStockItems: 0,
            outOfStockItems: 0, 
            inventoryItems: [],
            adjustmentHistory: [],
            procurementHistory: [],
            error: "Failed to load inventory data. Please try again later." 
    });
}
});
//handle Bulk adjustments, update procurement collection, record the adustments in stock collection.
router.post('/api/bulkAdjust', async(req,res)=>{
    try{
        const { produce, kilos, reason, notes, adjustedBy } = req.body;
        //validate required Fields
        if (!produce || isNaN(kilos)) {
            return res.status(400).json({ success: false, message: 'Product and adjustment quantity are required.' });
        }
        const productToAdjust = await procurement.findOne({ produce: produce });
        if (!productToAdjust) {
            return res.status(404).json({ success: false, message: `Product "${produce}" not found.` });
        } 

    //update and save
        productToAdjust.kilos += kilos;
        if (productToAdjust.kilos < 0) {
            productToAdjust.kilos = 0; // Prevent negative stock, adjust as needed
        }

        await productToAdjust.save();

        // Record the stock adjustment in the history
        const newAdjustmentLog = new StockAdjustment({
            product: produce,
            quantityAdjusted: kilos,
            reason: reason,
            notes: notes,
            adjustedBy: adjustedBy,
            adjustmentDate: new Date()
        });
        await newAdjustmentLog.save();

        res.json({ success: true, message: 'Stock adjusted successfully.' });

    } catch (error) {
        console.error('Error applying bulk adjustment:', error);
        res.status(500).json({ success: false, message: 'Failed to apply bulk adjustment.' });
    }
});
//update the individual save button, update the stock collection, record the adjustments in the stock.
router.put('/api/adjustStock', async (req, res) => {
    try {
         // Add validation for req.body
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Request body is empty'
        });
      }
        const { product, newStock, oldStock, reason, adjustedBy } = req.body;

        if (!product ||isNaN(oldStock) || isNaN(newStock)) {
            return res.status(400).json({ 
                success: false,
                 message: 'Product and new stock level are required.' 
                });
        } 

        const productToAdjust = await procurement.findOne({ produce: product });

        if (!productToAdjust) {
            return res.status(404).json({
                 success: false,
                  message: `Product "${product}" not found.` 
                });
        }

        productToAdjust.kilos = newStock; //update happens here.

        if (productToAdjust.kilos < 0) {
            productToAdjust.kilos = 0; // Prevent negative stock.
        }

        await productToAdjust.save();

        // Record the stock adjustment in the history
        const newAdjustmentLog = new StockAdjustment({
            product: product,
            quantityAdjusted: parseFloat(newStock)  - parseFloat(oldStock), // Calculate the change
            reason: reason,
            adjustedBy: adjustedBy,
            adjustmentDate: new Date()
        });
        await newAdjustmentLog.save();

        res.json({ 
            success: true, 
            message: 'Stock adjusted successfully.' 
        });

    } catch (error) {
        console.error('Error applying individual stock adjustment:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to apply stock adjustment.' 
        });
    }
});

module.exports = router;

