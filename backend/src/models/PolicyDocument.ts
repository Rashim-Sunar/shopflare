import mongoose, { Schema } from 'mongoose';
import type { PolicyDocumentRecord, PolicyDocumentStatus } from '../types/policy';

/**
 * @fileoverview Policy document metadata model used for customer-rights ingestion workflows.
 */

const policyDocumentSchema = new Schema<PolicyDocumentRecord>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    version: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    filePath: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'] satisfies PolicyDocumentStatus[],
      default: 'queued',
    },
    processingError: {
      type: String,
      default: '',
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

policyDocumentSchema.index({ name: 1, version: 1 }, { unique: true });
policyDocumentSchema.index({ isActive: 1, createdAt: -1 });

const PolicyDocument = mongoose.model<PolicyDocumentRecord>('PolicyDocument', policyDocumentSchema);

export default PolicyDocument;
