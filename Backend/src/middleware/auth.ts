import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UserRole, JwtPayload } from '../types';

// ─── Augment Express Request to carry user info ───────────────────────
// LEARN: TypeScript declaration merging — we add `user` to the built-in
// Express Request type so every controller can do `req.user.userId`
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ─── Middleware 1: authenticate ───────────────────────────────────────
// Extracts Bearer token from Authorization header, verifies it,
// and attaches payload to req.user. Returns 401 if missing/invalid.
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    // LEARN: jwt.verify throws TokenExpiredError or JsonWebTokenError.
    // We return 401 (Unauthorized) — not 403 — because the identity is unknown.
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// ─── Middleware 2: authorize (RBAC) ───────────────────────────────────
// Usage: authorize('admin', 'sanction') — pass any number of allowed roles.
// Returns 403 (Forbidden) if the authenticated user's role isn't in the list.
// LEARN: 401 = "Who are you?" (not authenticated)
//        403 = "I know who you are, but you can't do this" (not authorized)
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

// ─── Helper: borrowers only ───────────────────────────────────────────
export const borrowerOnly = authorize('borrower');

// ─── Helper: any executive or admin ──────────────────────────────────
export const executiveOnly = authorize('admin', 'sales', 'sanction', 'disbursement', 'collection');