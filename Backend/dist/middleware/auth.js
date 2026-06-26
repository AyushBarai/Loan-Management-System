"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executiveOnly = exports.borrowerOnly = exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
// ─── Middleware 1: authenticate ───────────────────────────────────────
// Extracts Bearer token from Authorization header, verifies it,
// and attaches payload to req.user. Returns 401 if missing/invalid.
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'No token provided' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch {
        // LEARN: jwt.verify throws TokenExpiredError or JsonWebTokenError.
        // We return 401 (Unauthorized) — not 403 — because the identity is unknown.
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
// ─── Middleware 2: authorize (RBAC) ───────────────────────────────────
// Usage: authorize('admin', 'sanction') — pass any number of allowed roles.
// Returns 403 (Forbidden) if the authenticated user's role isn't in the list.
// LEARN: 401 = "Who are you?" (not authenticated)
//        403 = "I know who you are, but you can't do this" (not authorized)
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized for this action`,
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
// ─── Helper: borrowers only ───────────────────────────────────────────
exports.borrowerOnly = (0, exports.authorize)('borrower');
// ─── Helper: any executive or admin ──────────────────────────────────
exports.executiveOnly = (0, exports.authorize)('admin', 'sales', 'sanction', 'disbursement', 'collection');
