const Transaction = require('../models/transaction.model');
const ProductOrder = require('../models/productOrder.model');
const Invoice = require('../models/invoice.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const mongoose = require('mongoose');

/**
 * @desc    Get Retailer's Personal Ledger
 * @route   GET /api/v1/retailer/ledger
 */
exports.getRetailerLedger = catchAsync(async (req, res, next) => {
    const transactions = await Transaction.find({ party: req.user._id })
        .sort('-createdAt');

    const balance = transactions.reduce((acc, t) => {
        return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);

    res.status(200).json(new ApiResponse(200, {
        transactions,
        stats: {
            balance,
            totalTransactions: transactions.length
        }
    }, 'Retailer ledger fetched successfully'));
});

/**
 * @desc    Get Retailer Analytics
 * @route   GET /api/v1/retailer/analytics
 */
exports.getRetailerAnalytics = catchAsync(async (req, res, next) => {
    const retailerId = req.user._id;

    // 1. Spending Trends (Last 6 Months)
    const spendingTrends = await ProductOrder.aggregate([
        { $match: { buyer: retailerId, status: { $ne: 'Cancelled' } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                totalSpent: { $sum: "$totalAmount" },
                orderCount: { $sum: 1 }
            }
        },
        { $sort: { "_id": 1 } },
        { $limit: 6 }
    ]);

    // 2. Outstanding Payments (Unpaid Invoices)
    const invoices = await Invoice.find({ buyer: retailerId, status: { $ne: 'paid' } });
    const totalOutstanding = invoices.reduce((acc, inv) => acc + (inv.totalAmount - inv.amountPaid), 0);

    // 3. Category Wise Spending (Note: ProductOrder has products[].product -> lookup Product.category)
    const categorySpending = await ProductOrder.aggregate([
        { $match: { buyer: retailerId } },
        { $unwind: "$products" },
        { $lookup: { from: 'products', localField: 'products.product', foreignField: '_id', as: 'pInfo' } },
        { $unwind: "$pInfo" },
        {
            $group: {
                _id: "$pInfo.category",
                value: { $sum: { $multiply: ["$products.quantity", "$products.priceAtOrder"] } }
            }
        },
        { $project: { name: "$_id", value: 1, _id: 0 } }
    ]);

    // 4. Metrics
    const totalOrders = await ProductOrder.countDocuments({ buyer: retailerId });
    const totalSpending = await ProductOrder.aggregate([
        { $match: { buyer: retailerId, status: 'Completed' } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    res.status(200).json(new ApiResponse(200, {
        metrics: {
            totalOrders,
            totalSpent: totalSpending[0]?.total || 0,
            outstanding: totalOutstanding,
            activeInvoices: invoices.length
        },
        spendingTrends: spendingTrends.map(item => ({
            name: item._id,
            spent: item.totalSpent,
            orders: item.orderCount
        })),
        categorySpending
    }, 'Retailer analytics fetched successfully'));
});
