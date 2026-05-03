import PolicyDocument from '../models/PolicyDocument';
import type { PolicyDocumentInput, PolicyDocumentRecord, PolicyDocumentStatus } from '../types/policy';

/**
 * @fileoverview Service layer for customer-rights policy documents.
 */

export interface CreatePolicyDocumentInput extends PolicyDocumentInput {
  processingError?: string;
  chunkCount?: number;
  status?: PolicyDocumentStatus;
}

/**
 * Function: createPolicyDocument
 * ----------------------------------------
 * Purpose:
 *   Persists a policy document metadata record before RabbitMQ ingestion starts.
 *
 * Inputs:
 *   - policy document metadata collected from the upload controller.
 *
 * Outputs:
 *   - The saved policy document record.
 *
 * Steps:
 *   1. Create a new PolicyDocument document with queued status.
 *   2. Persist it to MongoDB.
 *   3. Return the saved record for downstream queue publishing.
 */
export async function createPolicyDocument(input: CreatePolicyDocumentInput): Promise<PolicyDocumentRecord> {
  const document = await PolicyDocument.create({
    ...input,
    status: input.status ?? 'queued',
    processingError: input.processingError ?? '',
    chunkCount: input.chunkCount ?? 0,
  });

  return document.toObject() as PolicyDocumentRecord;
}

/**
 * Function: listPolicyDocuments
 * ----------------------------------------
 * Purpose:
 *   Returns the policy document list sorted by newest first for the admin UI.
 */
export async function listPolicyDocuments(): Promise<PolicyDocumentRecord[]> {
  const documents = await PolicyDocument.find().sort({ createdAt: -1 }).lean();
  return documents as PolicyDocumentRecord[];
}

/**
 * Function: updatePolicyDocumentStatus
 * ----------------------------------------
 * Purpose:
 *   Updates ingestion status, chunk counts, and error details for a policy document.
 */
export async function updatePolicyDocumentStatus(
  documentId: string,
  updates: {
    status?: PolicyDocumentStatus;
    chunkCount?: number;
    processingError?: string;
  }
): Promise<PolicyDocumentRecord | null> {
  const document = await PolicyDocument.findByIdAndUpdate(
    documentId,
    {
      ...(updates.status ? { status: updates.status } : {}),
      ...(typeof updates.chunkCount === 'number' ? { chunkCount: updates.chunkCount } : {}),
      ...(updates.processingError !== undefined ? { processingError: updates.processingError } : {}),
    },
    { new: true }
  ).lean();

  return document as PolicyDocumentRecord | null;
}
