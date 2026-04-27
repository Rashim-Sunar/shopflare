import { workerEnv } from './config';
import crypto from 'crypto';

/**
 * @fileoverview Qdrant upsert utilities for worker ingestion.
 */

export interface ProductVectorPayload {
  productId: string;
  name: string;
  price: number;
  category: string;
  description: string;
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
 * Function: ensureProductCollection
 * ----------------------------------------
 * Purpose:
 *   Ensures the product embedding collection exists before writes.
 *
 * Inputs:
 *   - none.
 *
 * Outputs:
 *   - Promise<void> when collection is available.
 *
 * Steps:
 *   1. Exit early if collection is already confirmed.
 *   2. Attempt to fetch existing collection metadata.
 *   3. Create collection if missing.
 *   4. Cache readiness flag for future calls.
 */
async function ensureProductCollection(): Promise<void> {
  const client = await getQdrantClient();

  if (collectionReady) {
    return;
  }

  try {
    await client.getCollection(workerEnv.qdrantCollectionName);
    collectionReady = true;
    return;
  } catch {
    await client.createCollection(workerEnv.qdrantCollectionName, {
      vectors: {
        size: workerEnv.embeddingVectorSize,
        distance: 'Cosine',
      },
    });
    collectionReady = true;
  }
}

/**
 * Function: upsertProductVector
 * ----------------------------------------
 * Purpose:
 *   Stores or updates product embeddings in Qdrant.
 *
 * Steps:
 *   1. Initialize Qdrant client.
 *   2. Check if collection exists.
 *   3. Create collection if not exists.
 *   4. Upsert vector with payload.
 */
export async function upsertProductVector(id: string, vector: number[], payload: ProductVectorPayload): Promise<void> {
  const client = await getQdrantClient();
  await ensureProductCollection();
  const pointId = toStableUuid(id);

  await client.upsert(workerEnv.qdrantCollectionName, {
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

async function getQdrantClient(): Promise<any> {
  if (!qdrantClient) {
    const { QdrantClient } = await import('@qdrant/js-client-rest');
    qdrantClient = new QdrantClient({
      url: workerEnv.qdrantUrl,
    });
  }

  return qdrantClient;
}
