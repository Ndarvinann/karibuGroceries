const express = require('express');
const router = express.Router();
const connectEnsureLogin = require('connect-ensure-login');
const procurementShema = require('../model/procurementShema');
const cashPaymentSchema = require('../model/cashSaleSchema');
const creditPaymentSchema = require('../model/creditsaleSchema');
const stockAdjustmentSchema = require('../model/stockAdjustmentSchema');

// GET route to display the "Record a Payment" form with product selection
router.get("/recordPayment", /*connectEnsureLogin.ensureLoggedIn(),*/ async (req, res) => {
    try {
        const allProducts = await procurementShema.find().select('produce kilos');
        const username = req.user ? req.user.username : 'Guest';
        const today = new Date().toISOString().split('T')[0];

        res.render("payments", { product: {}, username, today, allProducts });
    } catch (error) {
        console.error("Error rendering payment form with product list:", error);
        res.status(500).send("Internal Server Error");
    }
});

// POST route to record a cash payment
router.post("/addCashPayment",/* connectEnsureLogin.ensureLoggedIn(),*/ async (req, res) => {
    try {
        const { cashTonnage, cashAmount, cashBuyer, cashSale } = req.body;
        const product = await procurementShema.findOne({ produce: cashSale });

        if (!product) {
            return res.status(404).send(`Product "${cashSale}" not found`);
        }

        const tonnage = parseFloat(cashTonnage);
        if (product.kilos < tonnage) {
            return res.status(400).send(`Low stock: Only ${product.kilos}kg of ${cashSale} available.`);
        }

        const costPerKg = product.initialKilos ? (product.cost / product.initialKilos) : 0;
        const totalCost = costPerKg * tonnage;

        const newCashPayment = new cashPaymentSchema({
            cashSale: product.produce,
            cashTonnage: tonnage,
            cashAmount: parseFloat(cashAmount),
            cashBuyer,
            cashAgent: req.user ? req.user.username : 'Guest',
            cashDate: new Date(),
            cashCost: totalCost,
            cashProfit: parseFloat(cashAmount) - totalCost,
            productId: product._id
        });
        await newCashPayment.save();

        product.kilos -= tonnage;
        await product.save();

        const stockAdjustment = new stockAdjustmentSchema({
            product: product._id,
            type: 'sale',
            quantityChanged: -tonnage,
            reason: `Cash sale of ${tonnage}kg ${product.produce}`,
            adjustedBy: req.user ? req.user.username : 'Guest'
        });
        await stockAdjustment.save();

        res.redirect("/salesDash");
    } catch (error) {
        console.error("Error recording cash payment:", error);
        res.status(500).send("Internal Server Error");
    }
});

// POST route to record a credit payment
router.post("/addCreditPayment", /*connectEnsureLogin.ensureLoggedIn(),*/ async (req, res) => {
    try {
        const { creditTonnage, creditAmount, creditBuyer, creditNIN, creditLocation, creditContact, creditDueDate, creditProduct, dispatchDate } = req.body;
        const product = await procurementShema.findOne({ produce: creditProduct });

        if (!product) {
            return res.status(404).send(`Product "${creditProduct}" not found`);
        }

        const tonnage = parseFloat(creditTonnage);
        if (product.kilos < tonnage) {
            return res.status(400).send(`Low stock: Only ${product.kilos}kg of ${creditProduct} available.`);
        }

        const costPerKg = product.initialKilos ? (product.cost / product.initialKilos) : 0;
        const totalCost = costPerKg * tonnage;

        const newCreditPayment = new creditPaymentSchema({
            creditBuyer,
            creditNIN,
            creditLocation,
            creditContact,
            creditAmount: parseFloat(creditAmount),
            creditDueDate: new Date(creditDueDate),
            creditProduct: product.produce,
            creditTonnage: tonnage,
            dispatchDate: new Date(dispatchDate),
            creditAgent: req.user ? req.user.username : 'Guest',
            creditCost: totalCost,
            creditProfit: parseFloat(creditAmount) - totalCost,
            status: 'Pending',
            productId: product._id
        });
        await newCreditPayment.save();

        product.kilos -= tonnage;
        await product.save();

        const stockAdjustment = new stockAdjustmentSchema({
            product: product._id,
            type: 'sale',
            quantityChanged: -tonnage,
            reason: `Credit sale of ${tonnage}kg ${product.produce} to ${creditBuyer}`,
            adjustedBy: req.user ? req.user.username : 'Guest'
        });
        await stockAdjustment.save();

        res.redirect("/salesDash");
    } catch (error) {
        console.error("Error recording credit payment:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
