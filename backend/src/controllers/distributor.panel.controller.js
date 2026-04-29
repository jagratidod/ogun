const Transaction = require('../models/transaction.model');
const ProductOrder = require('../models/productOrder.model');
const Invoice = require('../models/invoice.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const mongoose = require('mongoose');

/**
 * @desc    Get Distributor's Ledger
 * @route   GET /api/v1/distributor/ledger
 */
exports.getDistributorLedger = catchAsync(async (req, res, next) => {
    const transactions = await Transaction.find({ party: req.user._id })
        .sort('-createdAt');

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    res.status(200).json(new ApiResponse(200, {
        transactions,
        stats: {
            balance: totalIncome - totalExpense,
            totalIncome,
            totalExpense
        }
    }, 'Distributor ledger fetched successfully'));
});

/**
 * @desc    Get Distributor Analytics
 * @route   GET /api/v1/distributor/analytics
 */
exports.getDistributorAnalytics = catchAsync(async (req, res, next) => {
    const distributorId = req.user._id;

    // 1. Sales Performance (Monthly Revenue)
    const salesPerformance = await ProductOrder.aggregate([
        { $match: { seller: distributorId, status: { $ne: 'Cancelled' } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                revenue: { $sum: "$totalAmount" },
                orders: { $sum: 1 }
            }
        },
        { $sort: { "_id": 1 } },
        { $limit: 12 }
    ]);

    // 2. Retailer Ranking (Top Retailers)
    const topRetailers = await ProductOrder.aggregate([
        { $match: { seller: distributorId } },
        {
            $group: {
                _id: "$buyer",
                totalValue: { $sum: "$totalAmount" },
                orderCount: { $sum: 1 }
            }
        },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'retailerDetails' } },
        { $unwind: "$retailerDetails" },
        {
            $project: {
                name: "$retailerDetails.businessName",
                owner: "$retailerDetails.name",
                value: "$totalValue",
                orders: "$orderCount"
            }
        },
        { $sort: { value: -1 } },
        { $limit: 5 }
    ]);

    // 3. Collection Summary (Outstanding from Retailers)
    // Invoice model has 'order' ref. We lookup order to check 'seller'.
    const collections = await Invoice.aggregate([
        { $match: { status: { $ne: 'paid' } } },
        { $lookup: { from: 'productorders', localField: 'order', foreignField: '_id', as: 'orderInfo' } },
        { $unwind: "$orderInfo" },
        { $match: { "orderInfo.seller": distributorId } },
        {
            $group: {
                _id: null,
                pendingAmount: { $sum: { $subtract: ["$totalAmount", "$amountPaid"] } },
                count: { $sum: 1 }
            }
        }
    ]);

    // 4. Product Sales Breakdown
    const productBreakdown = await ProductOrder.aggregate([
        { $match: { seller: distributorId } },
        { $unwind: "$products" },
        { $lookup: { from: 'products', localField: 'products.product', foreignField: '_id', as: 'pInfo' } },
        { $unwind: "$pInfo" },
        {
            $group: {
                _id: "$pInfo.name",
                value: { $sum: "$products.quantity" }
            }
        },
        { $sort: { value: -1 } },
        { $limit: 8 },
        { $project: { name: "$_id", value: 1, _id: 0 } }
    ]);

    res.status(200).json(new ApiResponse(200, {
        metrics: {
            totalRevenue: salesPerformance.reduce((acc, curr) => acc + curr.revenue, 0),
            pendingCollections: collections[0]?.pendingAmount || 0,
            activeRetailers: topRetailers.length,
            totalOrders: salesPerformance.reduce((acc, curr) => acc + curr.orders, 0)
        },
        salesPerformance: salesPerformance.map(item => ({
            month: item._id,
            revenue: item.revenue,
            orders: item.orders
        })),
        topRetailers,
        productBreakdown
    }, 'Distributor analytics fetched successfully'));
});

/**
 * @desc    Get Collection History (Payments from Retailers)
 * @route   GET /api/v1/distributor/payments
 */
exports.getDistributorPayments = catchAsync(async (req, res, next) => {
    // In our architecture, payments from retailers to distributors are recorded as income Transactions
    // where 'party' is the distributor, but they are linked to an invoice/order.
    const payments = await Transaction.find({ 
        party: req.user._id, 
        type: 'income',
        category: 'retailer_payment' 
    })
    .populate('relatedUser', 'name businessName')
    .sort('-createdAt');

    res.status(200).json(new ApiResponse(200, {
        payments,
        stats: {
            totalCollected: payments.reduce((acc, p) => acc + p.amount, 0),
            count: payments.length
        }
    }, 'Distributor payments history fetched successfully'));
});

/**
 * @desc    Record Payment Received from Retailer
 * @route   POST /api/v1/distributor/payments
 */
exports.recordCollection = catchAsync(async (req, res, next) => {
    const { retailerId, amount, paymentMethod, description } = req.body;

    if (!retailerId || !amount) {
        return res.status(400).json(new ApiResponse(400, null, 'Retailer and Amount are required'));
    }

    const transaction = await Transaction.create({
        transactionId: `COL-IN-${Date.now()}`,
        party: req.user._id, // The Distributor receiving money
        relatedUser: retailerId, // The Retailer paying
        type: 'income',
        category: 'retailer_payment',
        amount: Number(amount),
        paymentMethod: paymentMethod || 'cash',
        description: description || `Payment received from retailer`,
        status: 'completed'
    });

    // Create Expense record for Retailer
    await Transaction.create({
        transactionId: `COL-OUT-${Date.now()}`,
        party: retailerId, // The Retailer paying
        relatedUser: req.user._id, // The Distributor receiving
        type: 'expense',
        category: 'retailer_payment',
        amount: Number(amount),
        paymentMethod: paymentMethod || 'cash',
        description: description || `Payment given to distributor`,
        status: 'completed'
    });

    res.status(201).json(new ApiResponse(201, transaction, 'Payment recorded and ledger updated for both parties'));
});
