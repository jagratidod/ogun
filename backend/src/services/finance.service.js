const Transaction = require('../models/transaction.model');
const Invoice = require('../models/invoice.model');
const User = require('../models/user.model');
const { v4: uuidv4 } = require('uuid');

class FinanceService {
  /**
   * Records a new transaction and updates the party's ledger balance.
   */
  async recordTransaction(data) {
    const { type, category, amount, description, partyId, relatedOrderId, relatedPayrollId, method } = data;

    const transaction = await Transaction.create({
      transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      category,
      amount,
      description,
      party: partyId,
      relatedOrder: relatedOrderId,
      relatedPayroll: relatedPayrollId,
      paymentMethod: method || 'system',
      status: 'completed'
    });

    if (partyId) {
      // Update User's ledger balance
      // Income to Admin (expense to party) => decrease balance
      // Expense to Admin (income to party) => increase balance
      const updateAmount = type === 'income' ? -amount : amount;
      await User.findByIdAndUpdate(partyId, { $inc: { ledgerBalance: updateAmount } });
    }

    return transaction;
  }

  /**
   * Generates an invoice for an order.
   */
  async generateInvoice(order) {
    const invoiceId = `INV-${order.orderId || uuidv4().substring(0, 8).toUpperCase()}`;
    
    // Calculate Tax (e.g., 18% GST)
    const subtotal = order.totalAmount || 0;
    const taxAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + taxAmount;

    const invoice = await Invoice.create({
      invoiceId,
      order: order._id,
      buyer: order.buyer || order.retailer || order.distributor,
      items: order.items || [],
      subtotal,
      taxAmount,
      totalAmount,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days due
      status: 'unpaid'
    });

    return invoice;
  }

  /**
   * Fetches financial metrics for a specific period.
   */
  async getFinancialMetrics(startDate, endDate) {
    const transactions = await Transaction.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'completed'
    });

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome: income,
      totalExpense: expense,
      netProfit: income - expense,
      transactionCount: transactions.length
    };
  }
}

module.exports = new FinanceService();
