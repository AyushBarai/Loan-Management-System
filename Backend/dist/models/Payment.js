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
exports.Payment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const paymentSchema = new mongoose_1.Schema({
    loanId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Loan', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    recordedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    utrNumber: {
        type: String,
        required: [true, 'UTR number is required'],
        unique: true, // MongoDB unique index ensures no duplicates
        trim: true,
        uppercase: true,
    },
    amount: {
        type: Number,
        required: true,
        min: [1, 'Payment amount must be at least ₹1'],
    },
    paymentDate: { type: Date, required: true },
    balanceAfter: { type: Number, required: true },
}, { timestamps: true });
// LEARN: A compound index on (loanId, utrNumber) makes the "find all payments
// for a loan" query O(log n) instead of O(n) — critical when loans have many
// payments. The unique constraint on utrNumber alone is already enforced above.
paymentSchema.index({ loanId: 1 });
exports.Payment = mongoose_1.default.model('Payment', paymentSchema);
