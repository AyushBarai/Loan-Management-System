"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyApplication = exports.uploadDocument = exports.savePersonalDetails = void 0;
IMPORT_CHECK;
// ─── POST /api/borrower/application/personal ──────────────────────────
// Step 2: Save personal details + run BRE
const savePersonalDetails = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { fullName, pan, dateOfBirth, monthlySalary, employmentMode } = req.body;
        // Validate required fields
        if (!fullName || !pan || !dateOfBirth || !monthlySalary || !employmentMode) {
            res.status(400).json({ success: false, message: 'All fields are required' });
            return;
        }
        // Run BRE on the server
        const breResult = runBRE({
            dateOfBirth: new Date(dateOfBirth),
            monthlySalary: Number(monthlySalary),
            pan: pan.toUpperCase(),
            employmentMode: employmentMode,
        });
        // Upsert: create or update the application for this user
        const application = await Application.findOneAndUpdate({ userId }, {
            userId,
            fullName,
            pan: pan.toUpperCase(),
            dateOfBirth: new Date(dateOfBirth),
            monthlySalary: Number(monthlySalary),
            employmentMode,
            breApproved: breResult.passed,
            breFailedRules: breResult.failedRules,
            completedSteps: breResult.passed ? Math.max(1, 1) : 0,
        }, { upsert: true, new: true, runValidators: true });
        if (!breResult.passed) {
            res.status(422).json({
                success: false,
                message: 'Application rejected by eligibility check',
                breErrors: breResult.failedRules,
                applicationId: application._id,
            });
            return;
        }
        res.json({
            success: true,
            message: 'Eligibility check passed',
            data: { applicationId: application._id, breApproved: true },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to save details';
        res.status(500).json({ success: false, message });
    }
};
exports.savePersonalDetails = savePersonalDetails;
// ─── POST /api/borrower/application/upload ────────────────────────────
// Step 3: Upload salary slip
const uploadDocument = async (req, res) => {
    try {
        const userId = req.user.userId;
        const application = await Application.findOne({ userId });
        if (!application || !application.breApproved) {
            res.status(400).json({
                success: false,
                message: 'Complete personal details and pass eligibility check first',
            });
            return;
        }
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }
        await Application.findOneAndUpdate({ userId }, {
            salarySlipPath: req.file.path,
            salarySlipOriginalName: req.file.originalname,
            completedSteps: 2,
        });
        res.json({
            success: true,
            message: 'Salary slip uploaded successfully',
            data: { filename: req.file.filename, originalName: req.file.originalname },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed';
        res.status(500).json({ success: false, message });
    }
};
exports.uploadDocument = uploadDocument;
// ─── GET /api/borrower/application ───────────────────────────────────
// Get current borrower's application status
const getMyApplication = async (req, res) => {
    try {
        const userId = req.user.userId;
        const application = await Application.findOne({ userId });
        if (!application) {
            res.json({ success: true, data: null });
            return;
        }
        res.json({ success: true, data: application });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch application';
        res.status(500).json({ success: false, message });
    }
};
exports.getMyApplication = getMyApplication;
