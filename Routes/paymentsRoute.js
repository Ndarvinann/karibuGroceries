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
        const agentIdentifier = `${req.user.firstName} ${req.user.lastName}`;
        const branch = req.user.branch;
        const today = new Date().toISOString().split('T')[0];
        const allProducts = await procurementShema.find().select('produce kilos cost'); // Include cost

        res.render("payments", { product: {}, username: agentIdentifier, branch, today, allProducts });
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

        if (!cashTonnage || !cashAmount || !cashBuyer || !cashSale) {
            return res.status(400).send("Missing required fields for cash payment.");
        }

        const product = await procurementShema.findOne({ produce: cashSale });

        if (!product) {
            return res.status(404).send(`Product "${cashSale}" not found`);
        }

        // Check for invalid product cost
        if (typeof product.cost !== 'number' || isNaN(product.cost)) {
            return res.status(400).send(`Product cost for "${product.produce}" is invalid.`);
        }

        // Check if current kilos is zero to avoid division by zero
        if (product.kilos === 0) {
            return res.status(400).send(`Cannot sell "${product.produce}" as current stock is zero.`);
        }

        // Check stock availability
        if (product.kilos < parseFloat(cashTonnage)) {
            return res.status(400).send(`Low stock: Only ${product.kilos}kg of ${cashSale} available.`);
        }

        const tonnage = parseFloat(cashTonnage);
        const amount = parseFloat(cashAmount);

        // Ensure tonnage and amount are valid numbers
        if (isNaN(tonnage) || isNaN(amount)) {
            return res.status(400).send("Invalid tonnage or amount provided.");
        }

        const unitCost = product.cost / product.kilos; // Use current kilos for unit cost
        const cost = unitCost * tonnage;
        const profit = amount - cost;

        const newCashPayment = new cashPaymentSchema({
            cashSale: product.produce,
            cashTonnage: tonnage,
            cashAmount: amount,
            cashBuyer,
            cashAgent: `${req.user.firstName} ${req.user.lastName}`,
            cashDate: new Date(),
            cashCost: cost,
            cashProfit: profit,
            productId: product._id
        });

        await newCashPayment.save();

        product.kilos -= tonnage;
        await product.save();

        const stockAdjustment = new stockAdjustmentSchema({
            product: product._id, // Assuming product._id is the correct identifier
            type: 'sale',
            quantityAdjusted: -tonnage, // Changed to quantityAdjusted
            reason: `Cash sale of ${tonnage}kg ${product.produce}`,
            adjustedBy: `${req.user.firstName} ${req.user.lastName}`
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
        const {
            creditTonnage,
            creditAmount,
            creditBuyer,
            creditNIN,
            creditLocation,
            creditContact,
            creditDueDate,
            creditProduct,
            dispatchDate
        } = req.body;

        if (!creditTonnage || !creditAmount || !creditBuyer || !creditProduct) {
            return res.status(400).send("Missing required fields for credit payment.");
        }

        const product = await procurementShema.findOne({ produce: creditProduct });

        if (!product) {
            return res.status(404).send(`Product "${creditProduct}" not found`);
        }

        // Check for invalid product cost
        if (typeof product.cost !== 'number' || isNaN(product.cost)) {
            return res.status(400).send(`Product cost for "${product.produce}" is invalid.`);
        }

        // Check if current kilos is zero to avoid division by zero
        if (product.kilos === 0) {
            return res.status(400).send(`Cannot sell "${product.produce}" as current stock is zero.`);
        }

        // Check stock availability
        if (product.kilos < parseFloat(creditTonnage)) {
            return res.status(400).send(`Low stock: Only ${product.kilos}kg of ${creditProduct} available.`);
        }

        const tonnage = parseFloat(creditTonnage);
        const amount = parseFloat(creditAmount);

        // Ensure tonnage and amount are valid numbers
        if (isNaN(tonnage) || isNaN(amount)) {
            return res.status(400).send("Invalid tonnage or amount provided.");
        }

        const unitCost = product.cost / product.kilos; // Use current kilos for unit cost
        const cost = unitCost * tonnage;
        const profit = amount - cost;

        const newCreditPayment = new creditPaymentSchema({
            creditBuyer,
            creditNIN,
            creditLocation,
            creditContact,
            creditAmount: amount,
            creditDueDate: new Date(creditDueDate),
            creditProduct,
            creditTonnage: tonnage,
            dispatchDate: new Date(dispatchDate),
            creditAgent: `${req.user.firstName} ${req.user.lastName}`,
            creditCost: cost,
            creditProfit: profit,
            status: 'Pending',
            productId: product._id
        });

        await newCreditPayment.save();

        product.kilos -= tonnage;
        await product.save();

        const stockAdjustment = new stockAdjustmentSchema({
            product: product._id, // Assuming product._id is the correct identifier
            type: 'sale',
            quantityAdjusted: -tonnage, // Changed to quantityAdjusted
            reason: `Credit sale of ${tonnage}kg ${product.produce} to ${creditBuyer}`,
            adjustedBy: `${req.user.firstName} ${req.user.lastName}`
        });

        await stockAdjustment.save();

        res.redirect("/salesDash");
    } catch (error) {
        console.error("Error recording credit payment:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;