"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
// ─── Sign a JWT ───────────────────────────────────────────────────────
// LEARN: JWT = Header.Payload.Signature (base64url encoded)
// The signature is computed with HMAC-SHA256 using JWT_SECRET.
// Anyone with the secret can verify the token — keep it private!
function signToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
}
// ─── Verify a JWT ─────────────────────────────────────────────────────
// Returns the decoded payload or throws if invalid/expired.
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
