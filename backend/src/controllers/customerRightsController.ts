import type { NextFunction, Response } from 'express';
import path from 'path';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import type { AuthenticatedRequest } from '../types/http';
import type { PolicyDocumentRecord } from '../types/policy';
import { createPolicyDocument, listPolicyDocuments, updatePolicyDocumentStatus } from '../services/policyRightsService';
import { publishPolicyIngestionJob } from '../queue/policyProducer';
import { appEnv } from '../config/env';

interface CustomerRightsUploadBody {
  name?: string;
  version?: string;
  isActive?: string;
}

interface CustomerRightsListResponse {
  status: 'success';
  documents: PolicyDocumentRecord[];
}

interface CustomerRightsUploadResponse {
  status: 'success';
  document: PolicyDocumentRecord;
  message: string;
}

interface CustomerRightsStatusUpdateBody {
  status?: 'queued' | 'processing' | 'completed' | 'failed';
  chunkCount?: number;
  processingError?: string;
}

/**
 * Function: getCustomerRightsDocuments
 * ----------------------------------------
 * Purpose:
 *   Returns the uploaded customer-rights policy documents for the admin dashboard.
 */
export const getCustomerRightsDocuments = asyncHandler(
  async (_req: AuthenticatedRequest, res: Response<CustomerRightsListResponse>) => {
    const documents = await listPolicyDocuments();

    res.status(200).json({
      status: 'success',
      documents,
    });
  }
);

/**
 * Function: uploadCustomerRightsDocument
 * ----------------------------------------
 * Purpose:
 *   Stores a policy PDF record and publishes an async ingestion job.
 */
export const uploadCustomerRightsDocument = asyncHandler(
  async (
    req: AuthenticatedRequest<never, CustomerRightsUploadResponse, CustomerRightsUploadBody>,
    res: Response<CustomerRightsUploadResponse>,
    next: NextFunction
  ) => {
    const uploadedFile = req.file as Express.Multer.File | undefined;

    if (!uploadedFile) {
      next(new AppError('A PDF file is required', 400));
      return;
    }

    if (uploadedFile.mimetype !== 'application/pdf') {
      next(new AppError('Only PDF files are allowed', 400));
      return;
    }

    const name = req.body.name?.trim() || uploadedFile.originalname.replace(/\.pdf$/i, '').trim() || 'Customer Rights Policy';
    const version = req.body.version?.trim() || '1.0.0';
    const isActive = String(req.body.isActive ?? 'true').toLowerCase() !== 'false';
    const filePath = path.resolve(uploadedFile.path);
    const document = await createPolicyDocument({
      name,
      version,
      isActive,
      originalName: uploadedFile.originalname,
      fileName: uploadedFile.filename,
      filePath,
      mimeType: uploadedFile.mimetype,
      size: uploadedFile.size,
      uploadedBy: req.user?._id,
    });

    await publishPolicyIngestionJob({
      documentId: String(document._id),
      filePath,
      originalName: uploadedFile.originalname,
      version,
      uploadedAt: new Date().toISOString(),
      isActive,
    });

    res.status(201).json({
      status: 'success',
      document,
      message: 'Policy document uploaded and queued for ingestion',
    });
  }
);

/**
 * Function: updateCustomerRightsDocumentStatus
 * ----------------------------------------
 * Purpose:
 *   Receives internal worker callbacks and updates policy ingestion progress.
 */
export const updateCustomerRightsDocumentStatus = asyncHandler(
  async (
    req: AuthenticatedRequest<{ id: string }, { status: 'success'; document: PolicyDocumentRecord | null }, CustomerRightsStatusUpdateBody>,
    res: Response<{ status: 'success'; document: PolicyDocumentRecord | null }>,
    next: NextFunction
  ) => {
    const internalToken = req.header('x-internal-token');

    if (internalToken !== appEnv.internalApiToken) {
      next(new AppError('Unauthorized internal callback', 401));
      return;
    }

    const { id } = req.params;
    const { status, chunkCount, processingError } = req.body;

    if (!status) {
      next(new AppError('status is required', 400));
      return;
    }

    const document = await updatePolicyDocumentStatus(id, {
      status,
      chunkCount,
      processingError,
    });

    if (!document) {
      next(new AppError('Policy document not found', 404));
      return;
    }

    res.status(200).json({
      status: 'success',
      document,
    });
  }
);
