import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  loanId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  recordedBy: mongoose.Types.ObjectId; // collection exec
  utrNumber: string;    // Unique Transaction Reference — must be globally unique
  amount: number;
  paymentDate: Date;
  balanceAfter: number; // outstanding balance after this payment
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    loanId: { type: Schema.Types.ObjectId, ref: 'Loan', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
  },
  { timestamps: true }
);

// LEARN: A compound index on (loanId, utrNumber) makes the "find all payments
// for a loan" query O(log n) instead of O(n) — critical when loans have many
// payments. The unique constraint on utrNumber alone is already enforced above.
paymentSchema.index({ loanId: 1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);