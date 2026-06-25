import { Router } from 'express';
import * as authCtrl from '../controllers/authController';
import * as appCtrl from '../controllers/applicationController';
import * as loanCtrl from '../controllers/loanController';
import { authenticate, authorize, borrowerOnly, executiveOnly } from '../middleware/auth';
import { uploadSalarySlip } from '../middleware/upload';

const router = Router();

// ──────────────────────────────────────────────────────────────────────
// Auth routes (public)
// ──────────────────────────────────────────────────────────────────────
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', authenticate, authCtrl.getMe);

// ──────────────────────────────────────────────────────────────────────
// Borrower routes (borrower role only)
// ──────────────────────────────────────────────────────────────────────
router.post(
  '/borrower/application/personal',
  authenticate,
  borrowerOnly,
  appCtrl.savePersonalDetails
);
router.post(
  '/borrower/application/upload',
  authenticate,
  borrowerOnly,
  (req, res, next) => {
    uploadSalarySlip(req, res, (err) => {
      if (err) {
        res.status(400).json({ success: false, message: err.message });
        return;
      }
      next();
    });
  },
  appCtrl.uploadDocument
);
router.get('/borrower/application', authenticate, borrowerOnly, appCtrl.getMyApplication);
router.post('/borrower/loans', authenticate, borrowerOnly, loanCtrl.applyForLoan);
router.get('/borrower/loans/my', authenticate, borrowerOnly, loanCtrl.getMyLoans);

// ──────────────────────────────────────────────────────────────────────
// Executive routes — each protected by role
// ──────────────────────────────────────────────────────────────────────

// Sales: view leads (registered but not applied)
router.get(
  '/executive/leads',
  authenticate,
  authorize('admin', 'sales'),
  loanCtrl.getLeads
);

// Sanction: view applied loans + approve/reject
router.get(
  '/executive/loans',
  authenticate,
  executiveOnly,
  loanCtrl.getLoansByStatus
);
router.patch(
  '/executive/loans/:id/sanction',
  authenticate,
  authorize('admin', 'sanction'),
  loanCtrl.sanctionLoan
);

// Disbursement
router.patch(
  '/executive/loans/:id/disburse',
  authenticate,
  authorize('admin', 'disbursement'),
  loanCtrl.disburseLoan
);

// Collection: payments
router.post(
  '/executive/loans/:id/payment',
  authenticate,
  authorize('admin', 'collection'),
  loanCtrl.recordPayment
);
router.get(
  '/executive/loans/:id/payments',
  authenticate,
  executiveOnly,
  loanCtrl.getLoanPayments
);

export default router;