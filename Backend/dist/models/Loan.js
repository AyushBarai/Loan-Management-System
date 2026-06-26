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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loan = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// ─── Schema ──────────────────────────────────────────────────────────
const loanSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    applicationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Application', required: true },
    principal: { type: Number, required: true, min: 50000, max: 500000 },
    tenureDays: { type: Number, required: true, min: 30, max: 365 },
    interestRate: { type: Number, default: 12 }, // 12% p.a., fixed
    simpleInterest: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
    totalPaid: { type: Number, default: 0 },
    outstandingBalance: { type: Number, required: true },
    status: {
        type: String,
        enum: ['applied', 'sanctioned', 'rejected', 'disbursed', 'closed'],
        default: 'applied',
    },
    statusHistory: [
        {
            status: { type: String, required: true },
            changedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            reason: { type: String },
            timestamp: { type: Date, default: Date.now },
        },
    ],
    rejectionReason: { type: String },
    rejectedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    sanctionedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    sanctionedAt: { type: Date },
    disbursedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    disbursedAt: { type: Date },
    closedAt: { type: Date },
}, { timestamps: true });
// ─── Index for fast lookups ───────────────────────────────────────────
loanSchema.index({ userId: 1, status: 1 });
exports.Loan = mongoose_1.default.model('Loan', loanSchema);
