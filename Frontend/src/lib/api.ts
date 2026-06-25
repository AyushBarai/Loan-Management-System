export type UserRole = 'borrower' | 'admin' | 'sales' | 'sanction' | 'disbursement' | 'collection';
export type LoanStatus = 'applied' | 'sanctioned' | 'rejected' | 'disbursed' | 'closed';
export type EmploymentMode = 'salaried' | 'self-employed' | 'unemployed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Application {
  _id: string;
  userId: string;
  fullName: string;
  pan: string;
  dateOfBirth: string;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  breApproved: boolean;
  breFailedRules: string[];
  salarySlipPath?: string;
  completedSteps: number;
}

export interface Loan {
  _id: string;
  userId: string | User;
  applicationId: string | Application;
  principal: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  totalPaid: number;
  outstandingBalance: number;
  status: LoanStatus;
  rejectionReason?: string;
  sanctionedAt?: string;
  disbursedAt?: string;
  closedAt?: string;
  createdAt: string;
}

export interface Payment {
  _id: string;
  loanId: string;
  utrNumber: string;
  amount: number;
  paymentDate: string;
  balanceAfter: number;
  recordedBy: { name: string };
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}