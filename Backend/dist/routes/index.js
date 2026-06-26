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
const express_1 = require("express");
const authCtrl = __importStar(require("../controllers/authController"));
const appCtrl = __importStar(require("../controllers/applicationController"));
const loanCtrl = __importStar(require("../controllers/loanController"));
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// ──────────────────────────────────────────────────────────────────────
// Auth routes (public)
// ──────────────────────────────────────────────────────────────────────
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', auth_1.authenticate, authCtrl.getMe);
// ──────────────────────────────────────────────────────────────────────
// Borrower routes (borrower role only)
// ──────────────────────────────────────────────────────────────────────
router.post('/borrower/application/personal', auth_1.authenticate, auth_1.borrowerOnly, appCtrl.savePersonalDetails);
router.post('/borrower/application/upload', auth_1.authenticate, auth_1.borrowerOnly, (req, res, next) => {
    (0, upload_1.uploadSalarySlip)(req, res, (err) => {
        if (err) {
            res.status(400).json({ success: false, message: err.message });
            return;
        }
        next();
    });
}, appCtrl.uploadDocument);
router.get('/borrower/application', auth_1.authenticate, auth_1.borrowerOnly, appCtrl.getMyApplication);
router.post('/borrower/loans', auth_1.authenticate, auth_1.borrowerOnly, loanCtrl.applyForLoan);
router.get('/borrower/loans/my', auth_1.authenticate, auth_1.borrowerOnly, loanCtrl.getMyLoans);
// ──────────────────────────────────────────────────────────────────────
// Executive routes — each protected by role
// ──────────────────────────────────────────────────────────────────────
// Sales: view leads (registered but not applied)
router.get('/executive/leads', auth_1.authenticate, (0, auth_1.authorize)('admin', 'sales'), loanCtrl.getLeads);
// Sanction: view applied loans + approve/reject
router.get('/executive/loans', auth_1.authenticate, auth_1.executiveOnly, loanCtrl.getLoansByStatus);
router.patch('/executive/loans/:id/sanction', auth_1.authenticate, (0, auth_1.authorize)('admin', 'sanction'), loanCtrl.sanctionLoan);
// Disbursement
router.patch('/executive/loans/:id/disburse', auth_1.authenticate, (0, auth_1.authorize)('admin', 'disbursement'), loanCtrl.disburseLoan);
// Collection: payments
router.post('/executive/loans/:id/payment', auth_1.authenticate, (0, auth_1.authorize)('admin', 'collection'), loanCtrl.recordPayment);
router.get('/executive/loans/:id/payments', auth_1.authenticate, auth_1.executiveOnly, loanCtrl.getLoanPayments);
exports.default = router;
