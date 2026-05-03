import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { AppError } from '../utils/AppError';

/**
 * @fileoverview Multer configuration for customer-rights PDF uploads.
 */

const policyUploadDir = path.resolve(process.cwd(), 'uploads', 'customer-rights');

if (!fs.existsSync(policyUploadDir)) {
  fs.mkdirSync(policyUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, policyUploadDir);
  },
  filename: (_req, file, cb) => {
    const safeBaseName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeBaseName}`);
  },
});

function fileFilter(_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
  if (file.mimetype !== 'application/pdf') {
    cb(new AppError('Only PDF files are allowed', 400));
    return;
  }

  cb(null, true);
}

export const policyPdfUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

export function getPolicyUploadDir(): string {
  return policyUploadDir;
}
