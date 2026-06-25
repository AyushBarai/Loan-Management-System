"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeads = exports.getLoanPayments = exports.getLoansByStatus = exports.recordPayment = exports.disburseLoan = exports.sanctionLoan = exports.getMyLoans = exports.applyForLoan = void 0;
const Loan_1 = require("../models/Loan");
const Payment_1 = require("../models/Payment");
const Application_1 = require("../models/Application");
const bre_1 = require("../utils/bre");
const mongoose_1 = __importDefault(require("mongoose"));
// ─── POST /api/borrower/loans ─────────────────────────────────────────
// Step 4: Apply for loan (borrower only)
const applyForLoan = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { principal, tenureDays } = req.body;
        // Validate ranges
        if (principal < 50000 || principal > 500000) {
            res.status(400).json({ success: false, message: 'Loan amount must be ₹50K–₹5L' });
            return;
        }
        if (tenureDays < 30 || tenureDays > 365) {
            res.status(400).json({ success: false, message: 'Tenure must be 30–365 days' });
            return;
        }
        // Check application exists and BRE passed
        const application = await Application_1.Application.findOne({ userId });
        if (!application || !application.breApproved || !application.salarySlipPath) {
            res.status(400).json({
                success: false,
                message: 'Complete all application steps before applying',
            });
            return;
        }
        // Prevent duplicate active loans
        const existingLoan = await Loan_1.Loan.findOne({
            userId,
            status: { $in: ['applied', 'sanctioned', 'disbursed'] },
        });
        if (existingLoan) {
            res.status(409).json({
                success: false,
                message: 'You already have an active loan application',
            });
            return;
        }
        const { simpleInterest, totalRepayment, interestRate } = (0, bre_1.calculateLoanDetails)(Number(principal), Number(tenureDays));
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const loan = await Loan_1.Loan.create({
            userId,
            applicationId: application._id,
            principal: Number(principal),
            tenureDays: Number(tenureDays),
            interestRate,
            simpleInterest,
            totalRepayment,
            outstandingBalance: totalRepayment,
            totalPaid: 0,
            status: 'applied',
            statusHistory: [{ status: 'applied', changedBy: userObjectId, timestamp: new Date() }],
        });
        await Application_1.Application.findOneAndUpdate({ userId }, { completedSteps: 3 });
        res.status(201).json({
            success: true,
            message: 'Loan application submitted',
            data: loan,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to apply';
        res.status(500).json({ success: false, message });
    }
};
exports.applyForLoan = applyForLoan;
// ─── GET /api/borrower/loans/my ───────────────────────────────────────
const getMyLoans = async (req, res) => {
    try {
        const loans = await Loan_1.Loan.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: loans });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch loans' });
    }
};
exports.getMyLoans = getMyLoans;
// ─── PATCH /api/executive/loans/:id/sanction ─────────────────────────
// Sanction role: approve or reject an applied loan
const sanctionLoan = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'
        const executiveId = req.user.userId;
        const loan = await Loan_1.Loan.findById(id);
        if (!loan) {
            res.status(404).json({ success: false, message: 'Loan not found' });
            return;
        }
        if (loan.status !== 'applied') {
            res.status(400).json({
                success: false,
                message: `Cannot sanction a loan with status '${loan.status}'`,
            });
            return;
        }
        const execObjectId = new mongoose_1.default.Types.ObjectId(executiveId);
        if (action === 'approve') {
            loan.status = 'sanctioned';
            loan.sanctionedBy = execObjectId;
            loan.sanctionedAt = new Date();
        }
        else if (action === 'reject') {
            if (!rejectionReason) {
                res.status(400).json({ success: false, message: 'Rejection reason is required' });
                return;
            }
            loan.status = 'rejected';
            loan.rejectionReason = rejectionReason;
            loan.rejectedBy = execObjectId;
        }
        else {
            res.status(400).json({ success: false, message: "Action must be 'approve' or 'reject'" });
            return;
        }
        loan.statusHistory.push({
            status: loan.status,
            changedBy: execObjectId,
            reason: rejectionReason,
            timestamp: new Date(),
        });
        await loan.save();
        res.json({ success: true, message: `Loan ${action}d`, data: loan });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Sanction action failed';
        res.status(500).json({ success: false, message });
    }
};
exports.sanctionLoan = sanctionLoan;
// ─── PATCH /api/executive/loans/:id/disburse ─────────────────────────
const disburseLoan = async (req, res) => {
    try {
        const { id } = req.params;
        const executiveId = req.user.userId;
        const execObjectId = new mongoose_1.default.Types.ObjectId(executiveId);
        const loan = await Loan_1.Loan.findById(id);
        if (!loan) {
            res.status(404).json({ success: false, message: 'Loan not found' });
            return;
        }
        if (loan.status !== 'sanctioned') {
            res.status(400).json({
                success: false,
                message: `Cannot disburse a loan with status '${loan.status}'`,
            });
            return;
        }
        loan.status = 'disbursed';
        loan.disbursedBy = execObjectId;
        loan.disbursedAt = new Date();
        loan.statusHistory.push({ status: 'disbursed', changedBy: execObjectId, timestamp: new Date() });
        await loan.save();
        res.json({ success: true, message: 'Loan disbursed', data: loan });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Disbursal failed';
        res.status(500).json({ success: false, message });
    }
};
exports.disburseLoan = disburseLoan;
// ─── POST /api/executive/loans/:id/payment ───────────────────────────
// Collection role: record a payment
const recordPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { utrNumber, amount, paymentDate } = req.body;
        const executiveId = req.user.userId;
        if (!utrNumber || !amount || !paymentDate) {
            res.status(400).json({ success: false, message: 'UTR, amount, and date are required' });
            return;
        }
        const loan = await Loan_1.Loan.findById(id);
        if (!loan || loan.status !== 'disbursed') {
            res.status(400).json({ success: false, message: 'Loan not found or not in disbursed state' });
            return;
        }
        // Validate payment doesn't exceed outstanding balance
        const paymentAmount = Number(amount);
        if (paymentAmount <= 0) {
            res.status(400).json({ success: false, message: 'Payment amount must be positive' });
            return;
        }
        if (paymentAmount > loan.outstandingBalance + 0.01) {
            res.status(400).json({
                success: false,
                message: `Payment ₹${paymentAmount} exceeds outstanding balance ₹${loan.outstandingBalance.toFixed(2)}`,
            });
            return;
        }
        // Check UTR uniqueness
        const dupUTR = await Payment_1.Payment.findOne({ utrNumber: utrNumber.toUpperCase() });
        if (dupUTR) {
            res.status(409).json({ success: false, message: 'UTR number already exists' });
            return;
        }
        const execObjectId = new mongoose_1.default.Types.ObjectId(executiveId);
        const newTotalPaid = loan.totalPaid + paymentAmount;
        const newBalance = loan.totalRepayment - newTotalPaid;
        // Create payment record
        const payment = await Payment_1.Payment.create({
            loanId: loan._id,
            userId: loan.userId,
            recordedBy: execObjectId,
            utrNumber: utrNumber.toUpperCase(),
            amount: paymentAmount,
            paymentDate: new Date(paymentDate),
            balanceAfter: Math.max(0, newBalance),
        });
        // Update loan balance
        loan.totalPaid = newTotalPaid;
        loan.outstandingBalance = Math.max(0, newBalance);
        // Auto-close when fully paid
        if (loan.outstandingBalance <= 0.01) {
            loan.status = 'closed';
            loan.closedAt = new Date();
            loan.statusHistory.push({
                status: 'closed',
                changedBy: execObjectId,
                reason: 'Loan fully repaid',
                timestamp: new Date(),
            });
        }
        await loan.save();
        res.status(201).json({
            success: true,
            message: loan.status === 'closed' ? 'Payment recorded. Loan is now closed!' : 'Payment recorded',
            data: { payment, loan },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Payment recording failed';
        res.status(500).json({ success: false, message });
    }
};
exports.recordPayment = recordPayment;
// ─── GET /api/executive/loans ─────────────────────────────────────────
// Get loans filtered by status for each module
const getLoansByStatus = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const loans = await Loan_1.Loan.find(filter)
            .populate('userId', 'name email')
            .populate('applicationId', 'fullName pan monthlySalary employmentMode')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: loans });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch loans' });
    }
};
exports.getLoansByStatus = getLoansByStatus;
// ─── GET /api/executive/loans/:id/payments ───────────────────────────
const getLoanPayments = async (req, res) => {
    try {
        const payments = await Payment_1.Payment.find({ loanId: req.params.id })
            .populate('recordedBy', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: payments });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch payments' });
    }
};
exports.getLoanPayments = getLoanPayments;
// ─── GET /api/executive/leads ─────────────────────────────────────────
// Sales module: users who registered but haven't applied yet
const getLeads = async (req, res) => {
    try {
        const { User } = await Promise.resolve().then(() => __importStar(require('../models/User')));
        // Find all borrower users
        const borrowers = await User.find({ role: 'borrower' }).lean();
        const borrowerIds = borrowers.map((b) => b._id.toString());
        // Find those who have applied (have a loan)
        const appliedUserIds = await Loan_1.Loan.distinct('userId');
        const appliedSet = new Set(appliedUserIds.map((id) => id.toString()));
        // "Leads" = registered but not applied
        const leads = borrowers.map((b) => ({
            ...b,
            hasApplied: appliedSet.has(b._id.toString()),
        }));
        res.json({ success: true, data: leads });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch leads' });
    }
};
exports.getLeads = getLeads;
