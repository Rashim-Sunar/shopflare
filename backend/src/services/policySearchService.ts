import { generateEmbedding } from '../ai/embeddings';
import { ensurePolicyCollection, getQdrantClient } from '../vector/qdrantClient';
import { appEnv } from '../config/env';

/**
 * @fileoverview Policy RAG retrieval service for customer-rights queries.
 */

export interface PolicyChunkResult {
  documentId: string;
  documentName: string;
  version: string;
  chunkIndex: number;
  text: string;
  score: number;
  isActive: boolean;
}

/**
 * Function: searchPolicyContext
 * ----------------------------------------
 * Purpose:
 *   Retrieves the most relevant policy chunks from Qdrant for a user query.
 */
export async function searchPolicyContext(query: string, limit = 4): Promise<PolicyChunkResult[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  await ensurePolicyCollection();
  const queryEmbedding = await generateEmbedding(trimmedQuery);
  const clientAny = (await getQdrantClient()) as any;
  let points: any[] = [];

  if (typeof clientAny.queryPoints === 'function') {
    const response = await clientAny.queryPoints(appEnv.policyQdrantCollectionName, {
      query: queryEmbedding,
      limit,
      with_payload: true,
      with_vector: false,
    });
    points = Array.isArray(response?.points) ? response.points : [];
  } else if (typeof clientAny.search === 'function') {
    const response = await clientAny.search(appEnv.policyQdrantCollectionName, {
      vector: queryEmbedding,
      limit,
      with_payload: true,
      with_vector: false,
    });
    points = Array.isArray(response) ? response : [];
  }

  return points
    .map((point) => ({
      documentId: String(point?.payload?.documentId ?? point?.payload?.policyDocumentId ?? ''),
      documentName: String(point?.payload?.documentName ?? point?.payload?.name ?? 'Customer Rights Policy'),
      version: String(point?.payload?.version ?? '1.0.0'),
      chunkIndex: Number(point?.payload?.chunkIndex ?? 0),
      text: String(point?.payload?.text ?? ''),
      score: Number(point?.score ?? 0),
      isActive: Boolean(point?.payload?.isActive ?? true),
    }))
    .filter((chunk) => chunk.documentId && chunk.text && chunk.isActive);
}
