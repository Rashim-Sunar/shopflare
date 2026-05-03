import crypto from 'crypto';
import { appEnv } from '../config/env';

/**
 * @fileoverview Qdrant helpers for policy document embeddings.
 */

export interface PolicyVectorPayload {
  documentId: string;
  documentName: string;
  version: string;
  chunkIndex: number;
  text: string;
  isActive: boolean;
}

let qdrantClient: any;
let collectionReady = false;

function toStableUuid(value: string): string {
  const hash = crypto.createHash('sha256').update(value).digest('hex');
  const timeLow = hash.slice(0, 8);
  const timeMid = hash.slice(8, 12);
  const timeHiAndVersion = `5${hash.slice(13, 16)}`;
  const clockSeqHiAndReserved = ((Number.parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0');
  const clockSeqLow = hash.slice(18, 20);
  const node = hash.slice(20, 32);

  return `${timeLow}-${timeMid}-${timeHiAndVersion}-${clockSeqHiAndReserved}${clockSeqLow}-${node}`;
}

/**
 * Function: ensurePolicyCollection
 * ----------------------------------------
 * Purpose:
 *   Ensures the policy vector collection exists before writes.
 */
export async function ensurePolicyCollection(): Promise<void> {
  const client = await getQdrantClient();

  if (collectionReady) {
    return;
  }

  try {
    await client.getCollection(appEnv.policyQdrantCollectionName);
    collectionReady = true;
    return;
  } catch {
    await client.createCollection(appEnv.policyQdrantCollectionName, {
      vectors: {
        size: appEnv.embeddingVectorSize,
        distance: 'Cosine',
      },
    });
    collectionReady = true;
  }
}

/**
 * Function: upsertPolicyVector
 * ----------------------------------------
 * Purpose:
 *   Stores or updates policy chunk embeddings in Qdrant.
 */
export async function upsertPolicyVector(id: string, vector: number[], payload: PolicyVectorPayload): Promise<void> {
  const client = await getQdrantClient();
  await ensurePolicyCollection();
  const pointId = toStableUuid(id);

  await client.upsert(appEnv.policyQdrantCollectionName, {
    wait: true,
    points: [
      {
        id: pointId,
        vector,
        payload: payload as unknown as Record<string, unknown>,
      },
    ],
  });
}

export async function getQdrantClient(): Promise<any> {
  if (!qdrantClient) {
    const { QdrantClient } = await import('@qdrant/js-client-rest');
    qdrantClient = new QdrantClient({
      url: appEnv.qdrantUrl,
    });
  }

  return qdrantClient;
}
