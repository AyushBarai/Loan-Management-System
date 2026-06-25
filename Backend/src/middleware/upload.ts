import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

// ─── Storage: disk storage with UUID filenames ────────────────────────
// LEARN: We rename files to UUIDs to:
//   1. Prevent directory traversal attacks (../../etc/passwd)
//   2. Avoid filename collisions when multiple users upload
//   3. Not expose original filenames in URLs
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_PATH);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

// ─── File filter: validate MIME type ─────────────────────────────────
// LEARN: NEVER trust the file extension alone — it can be spoofed.
// Check the MIME type (content-type header from the client) AND
// the extension. Both must be in our allowlist.
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    ALLOWED_TYPES.includes(file.mimetype) &&
    ALLOWED_EXTENSIONS.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, and PNG files up to 5MB are allowed'));
  }
};

export const uploadSalarySlip = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('salarySlip'); // Field name must match frontend FormData key