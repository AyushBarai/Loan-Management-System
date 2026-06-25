import mongoose, { Document, Schema } from 'mongoose';
import { LoanStatus } from '../types';

// ─── Interface ───────────────────────────────────────────────────────
export interface ILoan extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  // Loan terms
  principal: number;       // Amount borrowed
  tenureDays: number;      // Loan duration in days
  interestRate: number;    // Fixed at 12% p.a.
  simpleInterest: number;  // Calculated: (P × R × T) / (365 × 100)
  totalRepayment: number;  // P + SI
  // Repayment tracking
  totalPaid: number;       // Sum of all payments
  outstandingBalance: number; // totalRepayment - totalPaid
  // Status machine
  status: LoanStatus;
  // Status history (audit trail)
  statusHistory: {
    status: LoanStatus;
    changedBy: mongoose.Types.ObjectId;
    reason?: string;
    timestamp: Date;
  }[];
  // Rejection
  rejectionReason?: string;
  rejectedBy?: mongoose.Types.ObjectId;
  // Executive actions
  sanctionedBy?: mongoose.Types.ObjectId;
  sanctionedAt?: Date;
  disbursedBy?: mongoose.Types.ObjectId;
  disbursedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────────────────
const loanSchema = new Schema<ILoan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
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
        changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        reason: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    rejectionReason: { type: String },
    rejectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    sanctionedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    sanctionedAt: { type: Date },
    disbursedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    disbursedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

// ─── Index for fast lookups ───────────────────────────────────────────
loanSchema.index({ userId: 1, status: 1 });

export const Loan = mongoose.model<ILoan>('Loan', loanSchema);