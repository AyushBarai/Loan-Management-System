import jwt from 'jsonwebtoken';
import { JwtPayload } from '.';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ─── Sign a JWT ───────────────────────────────────────────────────────
// LEARN: JWT = Header.Payload.Signature (base64url encoded)
// The signature is computed with HMAC-SHA256 using JWT_SECRET.
// Anyone with the secret can verify the token — keep it private!
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

// ─── Verify a JWT ─────────────────────────────────────────────────────
// Returns the decoded payload or throws if invalid/expired.
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}