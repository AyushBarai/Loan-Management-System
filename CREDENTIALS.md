# LMS — Login Credentials for Evaluator

## All Role Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | admin@lms.com | Admin@123 | All 4 dashboard modules |
| **Sales** | sales@lms.com | Sales@123 | Sales module only |
| **Sanction** | sanction@lms.com | Sanction@123 | Sanction module only |
| **Disbursement** | disburse@lms.com | Disburse@123 | Disbursement module only |
| **Collection** | collection@lms.com | Collection@123 | Collection module only |
| **Borrower** | borrower@lms.com | Borrower@123 | Borrower portal only |

## Testing the Full Flow

1. Login as **Borrower** → complete 4-step application → apply for loan
2. Login as **Sanction** → approve the loan
3. Login as **Disbursement** → disburse the loan
4. Login as **Collection** → record payments until loan closes
5. Login as **Admin** → verify you can see ALL modules
6. Login as **Sales** → verify you can ONLY see the Sales module

## Creating a New Borrower (BRE Pass)

Use these values to pass the eligibility check:
- **Date of Birth**: Any date making age 23–50
- **Monthly Salary**: ₹30,000 or above
- **PAN**: ABCDE1234F (valid format)
- **Employment**: Salaried or Self-employed

## BRE Fail Test

Use these to trigger rejection:
- **Employment**: Unemployed → instantly rejected
- **Monthly Salary**: ₹10,000 → below minimum
- **PAN**: 12345 → invalid format