// LEARN: Mirror BRE on client for instant feedback.
// The server ALWAYS re-validates — client is UX only, not security.

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export interface BREClientResult {
  passed: boolean;
  errors: Record<string, string>;
}

export function clientBRE(data: {
  dateOfBirth: string;
  monthlySalary: number;
  pan: string;
  employmentMode: string;
}): BREClientResult {
  const errors: Record<string, string> = {};
  const age = calculateAge(new Date(data.dateOfBirth));

  if (age < 23 || age > 50) errors.dateOfBirth = `Age ${age} must be between 23 and 50`;
  if (data.monthlySalary < 25000) errors.monthlySalary = 'Monthly salary must be at least ₹25,000';
  if (!PAN_REGEX.test(data.pan.toUpperCase())) errors.pan = 'Invalid PAN (e.g. ABCDE1234F)';
  if (data.employmentMode === 'unemployed') errors.employmentMode = 'Unemployed applicants are not eligible';

  return { passed: Object.keys(errors).length === 0, errors };
}

export function calculateLoanDetails(principal: number, tenureDays: number) {
  const rate = 12;
  const si = (principal * rate * tenureDays) / (365 * 100);
  return {
    simpleInterest: Math.round(si * 100) / 100,
    totalRepayment: Math.round((principal + si) * 100) / 100,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}