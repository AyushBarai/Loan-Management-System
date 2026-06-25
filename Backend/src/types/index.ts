// Role & Auth Types
export type UserRole = 'borrower' | 'admin' | 'sales' 
| 'sanction' | 'disbursement' | 'collection';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

// Valid transitions:
//   applied  → sanctioned (sanction exec)
//   applied  → rejected   (sanction exec)
//   sanctioned → disbursed (disbursement exec)
//   disbursed  → closed   (auto, when total paid >= total repayment)
export type LoanStatus =
  | 'applied'
  | 'sanctioned'
  | 'rejected'
  | 'disbursed'
  | 'closed';

// Employment Modes
export type EmploymentMode = 'salaried' 
| 'self-employed' | 'unemployed';


// BRE Result
export interface BREResult {
    passed: boolean;
    failedRules: string[];
}

