"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSalarySlip = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
// ─── Storage: disk storage with UUID filenames ────────────────────────
// LEARN: We rename files to UUIDs to:
//   1. Prevent directory traversal attacks (../../etc/passwd)
//   2. Avoid filename collisions when multiple users upload
//   3. Not expose original filenames in URLs
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_PATH);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, `${(0, uuid_1.v4)()}${ext}`);
    },
});
// ─── File filter: validate MIME type ─────────────────────────────────
// LEARN: NEVER trust the file extension alone — it can be spoofed.
// Check the MIME type (content-type header from the client) AND
// the extension. Both must be in our allowlist.
const fileFilter = (_req, file, cb) => {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (ALLOWED_TYPES.includes(file.mimetype) &&
        ALLOWED_EXTENSIONS.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only PDF, JPG, and PNG files up to 5MB are allowed'));
    }
};
exports.uploadSalarySlip = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
}).single('salarySlip'); // Field name must match frontend FormData key
