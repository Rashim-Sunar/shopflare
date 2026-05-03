import type { Types } from 'mongoose';

/**
 * @fileoverview Shared policy document types for Customer Rights management and RAG ingestion.
 */

export type PolicyDocumentStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface PolicyDocumentInput {
  name: string;
  version: string;
  isActive: boolean;
  uploadedBy?: Types.ObjectId;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
}

export interface PolicyDocumentRecord extends PolicyDocumentInput {
  _id: Types.ObjectId;
  status: PolicyDocumentStatus;
  processingError?: string;
  chunkCount: number;
  createdAt: Date;
  updatedAt: Date;
}
