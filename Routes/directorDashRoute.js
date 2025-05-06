const express = require('express');
const router = express.Router();
const CashSale = require('../model/cashSaleSchema');
const CreditSale = require('../model/creditsaleSchema');
const Procurement = require('../model/procurementShema');


// Dashboard page render - keep HTML rendering separate
router.get("/directordash", (req, res) => {
    res.render('directorDash');
});

// API endpoint for dashboard statistics - ensure proper JSON response
router.get("/api/stats", async (req, res) => {
    try {
        const filter = req.query.filter;
        let startDate, endDate;

        // Set date range based on filter
        switch(filter) {
            case 'week':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                endDate = new Date();
                break;
            case 'month':
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
                endDate = new Date();
                break;
            case 'year':
                startDate = new Date();
                startDate.setFullYear(startDate.getFullYear() - 1);
                endDate = new Date();
                break;
            case 'custom':
                startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
                endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
                break;
            default:
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
                endDate = new Date();
        }

        // Get total sales (cash + credit)
        const [cashSales, creditSales, procurements] = await Promise.all([
            CashSale.aggregate([
                { $match: { cashDate: { $gte: startDate, $lte: endDate } } },
                { $group: { _id: null, total: { $sum: "$cashAmount" } } }
            ]),
            CreditSale.aggregate([
                { $match: { dispatchDate: { $gte: startDate, $lte: endDate } } },
                { $group: { _id: null, total: { $sum: "$creditAmount" } } }
            ]),
            Procurement.aggregate([
                { $match: { dateAndTime: { $gte: startDate, $lte: endDate } } },
                { $group: { _id: null, total: { $sum: "$cost" } } }
            ])
        ]);

        // Calculate sales trend
        const previousStartDate = new Date(startDate);
        previousStartDate.setMonth(previousStartDate.getMonth() - 1);
        const previousEndDate = new Date(startDate);

        const [currentPeriodSales, previousPeriodSales] = await Promise.all([
            CashSale.aggregate([
                { $match: { cashDate: { $gte: startDate, $lte: endDate } } },
                { $group: { _id: null, total: { $sum: "$cashAmount" } } }
            ]),
            CashSale.aggregate([
                { $match: { cashDate: { $gte: previousStartDate, $lte: previousEndDate } } },
                { $group: { _id: null, total: { $sum: "$cashAmount" } } }
            ])
        ]);

        const totalSales = (cashSales[0]?.total || 0) + (creditSales[0]?.total || 0);
        const totalProcurement = procurements[0]?.total || 0;
        
        const currentTotal = currentPeriodSales[0]?.total || 0;
        const previousTotal = previousPeriodSales[0]?.total || 0;
        const trend = previousTotal ? ((currentTotal - previousTotal) / previousTotal * 100).toFixed(1) : 0;

        res.json({
            totalSales,
            totalProcurement,
            salesTrend: `${trend}% from previous period`
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

// API endpoint for sales chart data
router.get("/api/chart", async (req, res) => {
    try {
        const months = [];
        const salesData = [];
        
        // Get last 6 months of data
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            
            const [cashSales, creditSales] = await Promise.all([
                CashSale.aggregate([
                    {
                        $match: {
                            cashDate: {
                                $gte: startOfMonth,
                                $lte: endOfMonth
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$cashAmount" }
                        }
                    }
                ]),
                CreditSale.aggregate([
                    {
                        $match: {
                            dispatchDate: {
                                $gte: startOfMonth,
                                $lte: endOfMonth
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$creditAmount" }
                        }
                    }
                ])
            ]);
            
            months.push(date.toLocaleString('default', { month: 'short' }));
            salesData.push((cashSales[0]?.total || 0) + (creditSales[0]?.total || 0));
        }
        
        res.json({
            labels: months,
            data: salesData
        });
    } catch (error) {
        console.error('Chart data error:', error);
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
});

// API endpoint for sales report
router.get("/api/reports/sales", async (req, res) => {
    try {
        const [cashSales, creditSales] = await Promise.all([
            CashSale.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$cashAmount" },
                        count: { $sum: 1 }
                    }
                }
            ]),
            CreditSale.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$creditAmount" },
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        res.json({
            total: (cashSales[0]?.total || 0) + (creditSales[0]?.total || 0),
            count: (cashSales[0]?.count || 0) + (creditSales[0]?.count || 0)
        });
    } catch (error) {
        console.error('Sales report error:', error);
        res.status(500).json({ error: 'Failed to generate sales report' });
    }
});

// API endpoint for procurement report
router.get("/api/reports/procurement", async (req, res) => {
    try {
        const procurementData = await Procurement.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$cost" },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            total: procurementData[0]?.total || 0,
            count: procurementData[0]?.count || 0
        });
    } catch (error) {
        console.error('Procurement report error:', error);
        res.status(500).json({ error: 'Failed to generate procurement report' });
    }
});

module.exports = router;