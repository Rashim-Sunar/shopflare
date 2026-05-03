import { appEnv } from '../config/env';

/**
 * @fileoverview Qdrant client and collection helpers for product embeddings.
 */

export interface ProductVectorPayload {
  productId: string;
  name: string;
  price: number;
  category: string;
  description: string;
}

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

/**
 * Function: ensureProductCollection
 * ----------------------------------------
 * Purpose:
 *   Ensures the Qdrant collection exists before read/write operations.
 *
 * Inputs:
 *   - none.
 *
 * Outputs:
 *   - Promise<void> after collection validation.
 *
 * Steps:
 *   1. Check in-memory readiness flag.
 *   2. Query Qdrant for existing collection.
 *   3. Create collection if missing.
 *   4. Mark collection as ready.
 */
export async function ensureProductCollection(): Promise<void> {
  const client = await getQdrantClient();

  if (collectionReady) {
    return;
  }

  try {
    await client.getCollection(appEnv.qdrantCollectionName);
    collectionReady = true;
    return;
  } catch {
    await client.createCollection(appEnv.qdrantCollectionName, {
      vectors: {
        size: appEnv.embeddingVectorSize,
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

  await client.upsert(appEnv.qdrantCollectionName, {
    wait: true,
    points: [
      {
        id,
        vector,
        payload: payload as unknown as Record<string, unknown>,
      },
    ],
  });
}

/**
 * Function: ensurePolicyCollection
 * ----------------------------------------
 * Purpose:
 *   Ensures the policy Qdrant collection exists before search or write operations.
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

  await client.upsert(appEnv.policyQdrantCollectionName, {
    wait: true,
    points: [
      {
        id,
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
