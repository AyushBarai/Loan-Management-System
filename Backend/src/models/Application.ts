import mongoose, { Document, Schema } from 'mongoose';
import { EmploymentMode } from '../types';

// ─── Interface ───────────────────────────────────────────────────────
export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  // Step 2: Personal details
  fullName: string;
  pan: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  // BRE result cached on server
  breApproved: boolean;
  breFailedRules: string[];
  // Step 3: File upload
  salarySlipPath?: string;
  salarySlipOriginalName?: string;
  // Step tracking
  completedSteps: number; // 1=personal, 2=upload, 3=loan-applied
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────────────────
const applicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One application per borrower
    },
    fullName: { type: String, required: true, trim: true },
    pan: {
      type: String,
      required: true,
      uppercase: true,
      // LEARN: PAN format = 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F)
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'],
    },
    dateOfBirth: { type: Date, required: true },
    monthlySalary: { type: Number, required: true, min: 0 },
    employmentMode: {
      type: String,
      enum: ['salaried', 'self-employed', 'unemployed'],
      required: true,
    },
    breApproved: { type: Boolean, default: false },
    breFailedRules: [{ type: String }],
    salarySlipPath: { type: String },
    salarySlipOriginalName: { type: String },
    completedSteps: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Application = mongoose.model<IApplication>('Application', applicationSchema);