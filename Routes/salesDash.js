const express = require('express');
const router = express.Router();

//import models
const cashSaleSchema = require('../model/cashSaleSchema');
const creditsaleSchema = require('../model/creditsaleSchema');
const procurementShema = require('../model/procurementShema');

// helper functions to standadise dates and time and currency
const helpers = {
    formatDate: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
    formatCurrency: (amount) => amount ? `Ugx ${amount.toLocaleString()}` : 'Ugx 0'
};
//get the dashBoard
router.get("/salesDash",  async (req,res)=>{
    try{ // try promise.all() to run all the data queries simultaneously. 
        const [cashSales, creditSales, procurements] = await Promise.all([
            cashSaleSchema.find().sort({cashDate: -1}), //sort from the newest 1st.
            creditsaleSchema.find().sort({creditDueDate: -1}),
            procurementShema.find()
        ]);
        // to update overdue credit sales
        const now = new Date();
        for (const creditSale of creditSales) {
          if (creditSale.status === "Pending" && creditSale.creditDueDate < now) {
            creditSale.status = "Overdue";
            await creditSale.save();
          }
        }
        // Re-fetch credit sales after updating overdue status
    const updatedCreditSales = await creditsaleSchema.find().sort({creditDueDate: -1});

          //aggregate procurements by produce
    const stockMap = {}; // { Beans: { kilos: 300, price: 2000, lastRestockDate: Date } }
    //process the procurements
    procurements .forEach(item=>{// loops through every item in the procurement array
        const produce = item.produce.toLowerCase();//sentence case
        if(!stockMap[produce]){ // if the produce has been added
            stockMap[produce]={
                stock:0,
                totalCost:0,
                lastRestockDate: item.dateAndTime,
            };
        }
        stockMap[produce].stock += item.kilos; //add the kilos to the existing running total of this chosen product name.
        stockMap[produce].totalCost += item.cost; // Accumulate total cost
        if(item.dateAndTime > stockMap[produce].lastRestockDate){
            stockMap[produce].lastRestockDate = item.dateAndTime;
        }

    });
    //subtract kilos from that specified produce after a cash sale is made
    cashSales.forEach(sale=>{
        const produce = sale.cashSale;
        if(stockMap[produce]){
            stockMap[produce].stock-=sale.cashTonnage;
        }

    });

    //subtract kilos from that specified produce after a credit sale is made
    creditSales.forEach(sale=>{
        const produce = sale.creditProduct;
            if(stockMap[produce]){
                stockMap[produce].stock-= sale.creditTonnage;
            }
        });
        const lowStockThreshold = 30;
        const products = Object.entries(stockMap).map(([name, data]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1), // Proper capitalization 
            stock: Math.max(0, data.stock), //prevent negative stock
            avgCostPerKg: data.stock > 0 
        ? (data.totalCost)
        : 0,
        sellingPricePerKg: data.priceToSell,
            lastRestockDate: data.lastRestockDate,
            lowStock: data.stock <= lowStockThreshold //less than or equal to
          }));
          //generate data for the recent sales tab.
          const recentSales= [
            ...cashSales.map(sale=>({
                type:'cash', 
                buyer: sale.cashBuyer,
                date: sale.cashDate,
                amount:sale.cashAmount,
                product: sale.cashProduct,
            })),
            ...creditSales.map(sale=>({
                type:'credit',
                buyer: sale.creditBuyer,
                product: sale.creditProduct,
                date: sale.creditDueDate
            })) //(...spread opertor combines both arrays.)
        ]
        //sorting to newest 1st.
        .sort((a,b)=>new Date(b.date)- new Date(a.date))//sort data, newest 1st.
        .slice(0,5); //keep only the most recent 5 sales.
        console.log("Recent Sales:", recentSales);
        //render the dashBoard
        res.render('salesDash', {
            products,
            cashSales,
            creditSales :updatedCreditSales,
            recentSales,
            helpers,
        });
        } catch(error){
            console.error('Error fetching sales data:', error);
            res.status(500).send(`Error Loading page:, ${error.message}`); 
        }
    });
 module.exports = router;

    
   
