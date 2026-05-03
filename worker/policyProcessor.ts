import fs from 'fs/promises';
import axios from 'axios';
import { workerEnv } from './config';
import { generateEmbedding } from './embeddings';
import { upsertPolicyVector } from './qdrantClient';

/**
 * @fileoverview Policy PDF ingestion processor used by the embedding worker.
 */

export interface PolicyIngestionMessage {
  documentId: string;
  filePath: string;
  originalName: string;
  version: string;
  uploadedAt: string;
  isActive: boolean;
  retryCount?: number;
}

export interface PolicyIngestionResult {
  documentId: string;
  chunkCount: number;
}

async function updatePolicyStatus(documentId: string, status: 'queued' | 'processing' | 'completed' | 'failed', chunkCount?: number, processingError?: string): Promise<void> {
  await axios.patch(
    `${workerEnv.backendUrl}/api/admin/customer-rights/${documentId}/status`,
    {
      status,
      ...(typeof chunkCount === 'number' ? { chunkCount } : {}),
      ...(processingError ? { processingError } : {}),
    },
    {
      headers: {
        'x-internal-token': workerEnv.internalApiToken,
      },
    }
  );
}

function splitIntoChunks(text: string, chunkSize = 350, overlap = 50): string[] {
  const words = text
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);

  if (words.length === 0) {
    return [];
  }

  const chunks: string[] = [];
  const step = Math.max(1, chunkSize - overlap);

  for (let index = 0; index < words.length; index += step) {
    chunks.push(words.slice(index, index + chunkSize).join(' '));
  }

  return chunks;
}

async function extractPdfText(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath);
  const { PDFParse } = await import('pdf-parse');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- load/getText are usable at runtime but typed as private
  const parser: any = new PDFParse({ data: new Uint8Array(buffer) });
  await parser.load();
  const result = await parser.getText();

  return result.text.trim();
}

/**
 * Function: processPolicyDocument
 * ----------------------------------------
 * Purpose:
 *   Process uploaded PDF and store embeddings in Qdrant.
 *
 * Steps:
 *   1. Read PDF file.
 *   2. Extract text.
 *   3. Chunk text into smaller segments (~300–500 tokens).
 *   4. Generate embeddings.
 *   5. Store vectors in Qdrant with metadata.
 *   6. Mark job as completed.
 */
export async function processPolicyDocument(message: PolicyIngestionMessage): Promise<PolicyIngestionResult> {
  await updatePolicyStatus(message.documentId, 'processing');

  try {
    const extractedText = await extractPdfText(message.filePath);

    if (!extractedText) {
      throw new Error(`No text could be extracted from policy file: ${message.originalName}`);
    }

    const chunks = splitIntoChunks(extractedText, 350, 50);

    if (chunks.length === 0) {
      throw new Error(`Policy file produced no chunks: ${message.originalName}`);
    }

    for (let index = 0; index < chunks.length; index += 1) {
      const chunkText = chunks[index];
      const embeddingInput = [
        `policy: ${message.originalName}`,
        `version: ${message.version}`,
        `chunk: ${index + 1}/${chunks.length}`,
        chunkText,
      ].join(' | ');

      const vector = await generateEmbedding(embeddingInput);
      await upsertPolicyVector(`${message.documentId}:${index}`, vector, {
        documentId: message.documentId,
        documentName: message.originalName,
        version: message.version,
        chunkIndex: index,
        text: chunkText,
        isActive: message.isActive,
      });
    }

    await updatePolicyStatus(message.documentId, 'completed', chunks.length);

    console.log(
      `[WORKER] Processed policy document documentId=${message.documentId} chunks=${chunks.length} queue=${workerEnv.policyRabbitMqQueueName}`
    );

    return {
      documentId: message.documentId,
      chunkCount: chunks.length,
    };
  } catch (error) {
    const messageText = error instanceof Error ? error.message : 'Unknown policy ingestion error';
    await updatePolicyStatus(message.documentId, 'failed', undefined, messageText).catch((updateError: unknown) => {
      console.error('[WORKER] Failed to update policy status', updateError);
    });
    throw error;
  }
}
