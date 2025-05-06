const express = require('express');
const router = express.Router();
const connectEnsureLogin = require('connect-ensure-login');
const procurementShema = require('../model/procurementShema');
const cashPaymentSchema = require('../model/cashSaleSchema');
const creditPaymentSchema = require('../model/creditsaleSchema');
const stockAdjustmentSchema = require('../model/stockAdjustmentSchema');

// GET route to display the "Record a Payment" form with product selection
router.get("/recordPayment", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    const user = req.user;
    if (!user || (user.role !== "manager" && user.role !== "salesAgent")) {
        return res.status(403).send("Access denied: You are not allowed to access this page.");
    }
    try {
        const agentIdentifier = `${req.user.firstName} ${req.user.lastName}`; // Combine first and last name
        const branch = req.user.branch;
        const today = new Date().toISOString().split('T')[0];
        const allProducts = await procurementShema.find().select('produce kilos');

        res.render("payments", { product: {}, username: agentIdentifier, branch, today, allProducts }); // Pass combined name as username for display
    } catch (error) {
        console.error("Error rendering payment form with product list:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

// POST route to record a cash payment
router.post("/addCashPayment", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    const user = req.user;
    if (!user || (user.role !== "manager" && user.role !== "salesAgent")) {
        return res.status(403).send("Access denied: You are not allowed to access this page.");
    }
    try {
        const { cashTonnage, cashAmount, cashBuyer, cashSale } = req.body;
        const product = await procurementShema.findOne({ produce: cashSale });

        if (!product) {
            return res.status(404).send(`Product "${cashSale}" not found`);
        }

        if (product.kilos < parseFloat(cashTonnage)) {
            return res.status(400).send(`Low stock: Only ${product.kilos}kg of ${cashSale} available.`);
        }

        const newCashPayment = new cashPaymentSchema({
            cashSale: product.produce,
            cashTonnage: parseFloat(cashTonnage),
            cashAmount: parseFloat(cashAmount),
            cashBuyer,
            cashAgent: `${req.user.firstName} ${req.user.lastName}`, // Use first and last name
            cashDate: new Date(),
            cashCost: (product.cost / product.initialKilos) * parseFloat(cashTonnage),
            cashProfit: parseFloat(cashAmount) - (product.cost / product.initialKilos) * parseFloat(cashTonnage),
            productId: product._id
        });
        await newCashPayment.save();

        product.kilos -= parseFloat(cashTonnage);
        await product.save();

        const stockAdjustment = new stockAdjustmentSchema({
            product: product._id,
            type: 'sale',
            quantityChanged: -parseFloat(cashTonnage),
            reason: `Cash sale of ${parseFloat(cashTonnage)}kg ${product.produce}`,
            adjustedBy: `${req.user.firstName} ${req.user.lastName}` // Use first and last name
        });
        await stockAdjustment.save();

        res.redirect("/salesDash");
    } catch (error) {
        console.error("Error recording cash payment:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

// POST route to record a credit payment
router.post("/addCreditPayment", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    const user = req.user;
    if (!user || (user.role !== "manager" && user.role !== "salesAgent")) {
        return res.status(403).send("Access denied: You are not allowed to access this page.");
    }
    try {
        const { creditTonnage, creditAmount, creditBuyer, creditNIN, creditLocation, creditContact, creditDueDate, creditProduct, dispatchDate } = req.body;
        const product = await procurementShema.findOne({ produce: creditProduct });

        if (!product) {
            return res.status(404).send(`Product "${creditProduct}" not found`);
        }

        if (product.kilos < parseFloat(creditTonnage)) {
            return res.status(400).send(`Low stock: Only ${product.kilos}kg of ${creditProduct} available.`);
        }

        const newCreditPayment = new creditPaymentSchema({
            creditBuyer,
            creditNIN,
            creditLocation,
            creditContact,
            creditAmount: parseFloat(creditAmount),
            creditDueDate: new Date(creditDueDate),
            creditProduct: product.produce,
            creditTonnage: parseFloat(creditTonnage),
            dispatchDate: new Date(dispatchDate),
            creditAgent: `${req.user.firstName} ${req.user.lastName}`, // Use first and last name
            creditCost: (product.cost / product.initialKilos) * parseFloat(creditTonnage),
            creditProfit: parseFloat(creditAmount) - (product.cost / product.initialKilos) * parseFloat(creditTonnage),
            status: 'Pending',
            productId: product._id
        });
        await newCreditPayment.save();

        product.kilos -= parseFloat(creditTonnage);
        await product.save();

        const stockAdjustment = new stockAdjustmentSchema({
            product: product._id,
            type: 'sale',
            quantityChanged: -parseFloat(creditTonnage),
            reason: `Credit sale of ${parseFloat(creditTonnage)}kg ${product.produce} to ${creditBuyer}`,
            adjustedBy: `${req.user.firstName} ${req.user.lastName}` // Use first and last name
        });
        await stockAdjustment.save();

        res.redirect("/salesDash");
    } catch (error) {
        console.error("Error recording credit payment:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;