const Transaction = require('../models/transaction.model');
const Invoice = require('../models/invoice.model');
const ProductOrder = require('../models/productOrder.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc    Get all ledger transactions
 * @route   GET /api/v1/admin/accounts/ledger
 */
exports.getLedger = catchAsync(async (req, res, next) => {
    const transactions = await Transaction.find()
        .populate('party', 'name email')
        .sort('-createdAt');

    const totalCredits = transactions
        .filter(t => t.type === 'income' && t.status === 'completed')
        .reduce((acc, t) => acc + t.amount, 0);

    const totalDebits = transactions
        .filter(t => t.type === 'expense' && t.status === 'completed')
        .reduce((acc, t) => acc + t.amount, 0);

    return ApiResponse.success(res, {
        transactions,
        stats: {
            balance: totalCredits - totalDebits,
            totalCredits,
            totalDebits
        }
    }, 'Ledger fetched successfully');
});

/**
 * @desc    Get all invoices
 * @route   GET /api/v1/admin/accounts/invoices
 */
exports.getInvoices = catchAsync(async (req, res, next) => {
    const invoices = await Invoice.find()
        .populate('buyer', 'name businessName shopName')
        .sort('-createdAt');

    return ApiResponse.success(res, invoices, 'Invoices fetched successfully');
});

/**
 * @desc    Get single invoice detail
 * @route   GET /api/v1/admin/accounts/invoices/:id
 */
exports.getInvoiceById = catchAsync(async (req, res, next) => {
    const invoice = await Invoice.findById(req.params.id)
        .populate('buyer', 'name businessName shopName email phone location')
        .populate('order', 'orderId createdAt status')
        .populate('items.product', 'name sku');

    if (!invoice) {
        return ApiResponse.error(res, 'Invoice not found', 404);
    }

    return ApiResponse.success(res, invoice, 'Invoice details fetched');
});

/**
 * @desc    Record payment for an invoice
 * @route   POST /api/v1/admin/accounts/invoices/:id/payment
 */
exports.recordPayment = catchAsync(async (req, res, next) => {
    const { amount, method, note } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
        return ApiResponse.error(res, 'Invoice not found', 404);
    }

    if (amount <= 0) {
        return ApiResponse.error(res, 'Payment amount must be greater than zero', 400);
    }

    const txnId = `TXN-${uuidv4().substring(0, 8).toUpperCase()}`;

    // 1. Create Transaction record
    const transaction = await Transaction.create({
        transactionId: txnId,
        type: 'income',
        category: 'order_payment',
        description: `Payment for Invoice ${invoice.invoiceId} ${note ? '- ' + note : ''}`,
        amount: amount,
        party: invoice.buyer,
        partyRole: 'distributor', // Assuming invoices are mostly for distributors
        paymentMethod: method || 'bank_transfer',
        status: 'completed',
        createdBy: req.user._id
    });

    // 2. Update Invoice
    invoice.amountPaid += amount;
    invoice.paymentHistory.push({
        amount,
        date: new Date(),
        method: method || 'bank_transfer',
        transactionId: txnId
    });

    if (invoice.amountPaid >= invoice.totalAmount) {
        invoice.status = 'paid';
    } else if (invoice.amountPaid > 0) {
        invoice.status = 'partial';
    }

    await invoice.save();

    // 3. Update ProductOrder payment status if fully paid
    if (invoice.status === 'paid') {
        await ProductOrder.findByIdAndUpdate(invoice.order, { paymentStatus: 'Paid' });
    } else if (invoice.status === 'partial') {
        await ProductOrder.findByIdAndUpdate(invoice.order, { paymentStatus: 'Partial' });
    }

    return ApiResponse.success(res, { invoice, transaction }, 'Payment recorded successfully');
});

/**
 * @desc    Get all payments (Transaction type income)
 * @route   GET /api/v1/admin/accounts/payments
 */
exports.getPayments = catchAsync(async (req, res, next) => {
    const payments = await Transaction.find({ type: 'income', category: 'order_payment' })
        .populate('party', 'name businessName shopName')
        .sort('-createdAt');

    // Stats
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const todayTotal = payments
        .filter(p => new Date(p.createdAt) >= today)
        .reduce((acc, p) => acc + p.amount, 0);

    const weeklyTotal = payments
        .filter(p => new Date(p.createdAt) >= weekAgo)
        .reduce((acc, p) => acc + p.amount, 0);

    const monthlyTotal = payments
        .filter(p => new Date(p.createdAt) >= monthAgo)
        .reduce((acc, p) => acc + p.amount, 0);

    return ApiResponse.success(res, {
        payments,
        stats: {
            todayTotal,
            weeklyTotal,
            monthlyTotal
        }
    }, 'Payments fetched successfully');
});

/**
 * @desc    Get financial report (P&L)
 * @route   GET /api/v1/admin/accounts/financial-report
 */
exports.getFinancialReport = catchAsync(async (req, res, next) => {
    const transactions = await Transaction.find({ status: 'completed' });

    // Last 6 months trend
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push({
            name: d.toLocaleString('default', { month: 'short' }),
            month: d.getMonth(),
            year: d.getFullYear(),
            revenue: 0,
            expense: 0
        });
    }

    let totalRevenue = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
        const tDate = new Date(t.createdAt);
        const tMonth = tDate.getMonth();
        const tYear = tDate.getFullYear();

        if (t.type === 'income') totalRevenue += t.amount;
        if (t.type === 'expense') totalExpense += t.amount;

        const monthData = months.find(m => m.month === tMonth && m.year === tYear);
        if (monthData) {
            if (t.type === 'income') monthData.revenue += t.amount;
            if (t.type === 'expense') monthData.expense += t.amount;
        }
    });

    // Breakdown for charts
    const expenseBreakdown = [
        { name: 'Payroll', value: transactions.filter(t => t.category === 'payroll').reduce((a, b) => a + b.amount, 0) },
        { name: 'Bonuses', value: transactions.filter(t => t.category === 'bonus').reduce((a, b) => a + b.amount, 0) },
        { name: 'Others', value: transactions.filter(t => t.type === 'expense' && !['payroll', 'bonus'].includes(t.category)).reduce((a, b) => a + b.amount, 0) }
    ];

    return ApiResponse.success(res, {
        metrics: {
            monthlyRevenue: months[5].revenue,
            monthlyExpense: months[5].expense,
            netProfit: months[5].revenue - months[5].expense,
            totalRevenue,
            totalExpense,
            totalNetProfit: totalRevenue - totalExpense
        },
        revenueExpenseTrend: months,
        expenseBreakdown
    }, 'Financial report generated');
});
