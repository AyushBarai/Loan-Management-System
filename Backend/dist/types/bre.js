"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBRE = runBRE;
exports.calculateLoanDetails = calculateLoanDetails;
// Valid PAN regex: 5 uppercase letters + 4 digits + 1 uppercase letter
// Examples: ABCDE1234F ✓  | abcde1234f ✗ | 12345ABCDF ✗
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
function calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}
function runBRE(input) {
    const failedRules = [];
    const age = calculateAge(input.dateOfBirth);
    // Rule 1: Age must be 23–50
    if (age < 23 || age > 50) {
        failedRules.push(`Age ${age} is not between 23 and 50`);
    }
    // Rule 2: Monthly salary ≥ ₹25,000
    if (input.monthlySalary < 25000) {
        failedRules.push(`Monthly salary ₹${input.monthlySalary.toLocaleString()} is below the minimum ₹25,000`);
    }
    // Rule 3: Valid PAN format
    if (!PAN_REGEX.test(input.pan.toUpperCase())) {
        failedRules.push('PAN does not match the required format (e.g. ABCDE1234F)');
    }
    // Rule 4: Must not be unemployed
    if (input.employmentMode === 'unemployed') {
        failedRules.push('Unemployed applicants are not eligible for a loan');
    }
    return {
        passed: failedRules.length === 0,
        failedRules,
    };
}
// ─── Simple Interest Calculator ──────────────────────────────────────
// SI = (P × R × T) / (365 × 100)
// where: P = principal, R = 12 (%), T = tenure in days
function calculateLoanDetails(principal, tenureDays) {
    const rate = 12; // fixed 12% p.a.
    const simpleInterest = (principal * rate * tenureDays) / (365 * 100);
    const totalRepayment = principal + simpleInterest;
    return {
        simpleInterest: Math.round(simpleInterest * 100) / 100,
        totalRepayment: Math.round(totalRepayment * 100) / 100,
        interestRate: rate,
    };
}
