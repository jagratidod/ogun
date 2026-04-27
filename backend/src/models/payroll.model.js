const mongoose = require('mongoose');

const payrollRecordSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employeeName: { type: String, required: true },
    department: { type: String, default: 'General' },
    grossPay: { type: Number, required: true },
    leaveDays: { type: Number, default: 0 },
    freeLeaveAllowance: { type: Number, default: 2 },
    leaveDeduction: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
    netPay: { type: Number, required: true },
    bankDetails: {
        bankName: String,
        accountNumber: String,
        ifscCode: String,
        accountHolder: String
    },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' }
});

const payrollSchema = new mongoose.Schema({
    month: { type: String, required: true }, // "2026-04"
    monthLabel: { type: String },            // "April 2026"
    year: { type: Number, required: true },
    status: {
        type: String,
        enum: ['draft', 'approved', 'disbursed'],
        default: 'draft'
    },
    totalGross: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    totalNet: { type: Number, default: 0 },
    employeeCount: { type: Number, default: 0 },
    records: [payrollRecordSchema],
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date }
}, { timestamps: true });

// Unique constraint: one payroll run per month
payrollSchema.index({ month: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
