import mongoose from 'mongoose';
import Product from '../models/Product';
import type { CatalogSearchFilters } from './catalogSearchService';
import { buildCatalogQuery } from './catalogSearchService';
import { generateEmbedding } from '../ai/embeddings';
import { ensureProductCollection, getQdrantClient } from '../vector/qdrantClient';
import { appEnv } from '../config/env';

/**
 * @fileoverview Hybrid search service that combines Qdrant semantic search and MongoDB filtering.
 */

export interface HybridSearchProduct {
  id: string;
  name: string;
  price: number;
  brand: string | null;
  category: string;
  countInStock: number;
}

export interface HybridSearchResult {
  products: HybridSearchProduct[];
  totalProducts: number;
  message: string;
}

interface QdrantCandidate {
  productId: string;
  score: number;
}

function toHybridSearchProduct(product: any): HybridSearchProduct {
  return {
    id: String(product._id),
    name: String(product.name),
    price: Number(product.price),
    brand: product.brand ? String(product.brand) : null,
    category: String(product.category),
    countInStock: Number(product.countInStock),
  };
}

function buildEmbeddingText(query: string, filters: CatalogSearchFilters): string {
  const terms: string[] = [query];

  if (filters.category) terms.push(`category: ${filters.category}`);
  if (filters.subCategory) terms.push(`subCategory: ${filters.subCategory}`);
  if (filters.type) terms.push(`type: ${filters.type}`);
  if (filters.gender) terms.push(`gender: ${filters.gender}`);
  if (filters.brand) terms.push(`brand: ${filters.brand}`);
  if (filters.color) terms.push(`color: ${filters.color}`);
  if (filters.material) terms.push(`material: ${filters.material}`);

  return terms.join(' | ');
}

async function vectorSearch(queryEmbedding: number[], limit: number): Promise<QdrantCandidate[]> {
  await ensureProductCollection();

  const clientAny = (await getQdrantClient()) as any;
  let points: any[] = [];

  if (typeof clientAny.queryPoints === 'function') {
    const response = await clientAny.queryPoints(appEnv.qdrantCollectionName, {
      query: queryEmbedding,
      limit,
      with_payload: true,
      with_vector: false,
    });
    points = Array.isArray(response?.points) ? response.points : [];
  } else if (typeof clientAny.search === 'function') {
    const response = await clientAny.search(appEnv.qdrantCollectionName, {
      vector: queryEmbedding,
      limit,
      with_payload: true,
      with_vector: false,
    });
    points = Array.isArray(response) ? response : [];
  }

  return points
    .map((point) => {
      const payloadProductId = typeof point?.payload?.productId === 'string' ? point.payload.productId : undefined;
      const rawId = point?.id;
      const productId = payloadProductId ?? (typeof rawId === 'string' ? rawId : String(rawId ?? ''));

      return {
        productId,
        score: Number(point?.score ?? 0),
      };
    })
    .filter((candidate) => candidate.productId && mongoose.Types.ObjectId.isValid(candidate.productId));
}

/**
 * Function: hybridSearch
 * ----------------------------------------
 * Purpose:
 *   Combines semantic search (Qdrant) with structured filtering (MongoDB).
 *
 * Steps:
 *   1. Convert user query to embedding.
 *   2. Query Qdrant for top matches.
 *   3. Extract product IDs.
 *   4. Query MongoDB for full product details.
 *   5. Apply filters (price, category).
 *   6. Return enriched results.
 */
export async function hybridSearch(query: string, filters: CatalogSearchFilters): Promise<HybridSearchResult> {
  const limit = Math.max(1, Math.min(20, filters.limit ?? 5));
  const embeddingText = buildEmbeddingText(query, filters);
  const queryEmbedding = await generateEmbedding(embeddingText);
  const candidates = await vectorSearch(queryEmbedding, limit * 4);

  if (candidates.length === 0) {
    return {
      products: [],
      totalProducts: 0,
      message: 'No products found',
    };
  }

  const candidateIds = Array.from(new Set(candidates.map((candidate) => candidate.productId)));
  const baseFilters = {
    ...filters,
    search: undefined,
  };

  const mongoQuery = buildCatalogQuery(baseFilters);
  (mongoQuery as Record<string, unknown>)._id = { $in: candidateIds.map((id) => new mongoose.Types.ObjectId(id)) };

  const products = await Product.find(mongoQuery).select('_id name price brand category countInStock').lean();

  if (products.length === 0) {
    return {
      products: [],
      totalProducts: 0,
      message: 'No products found',
    };
  }

  const rankMap = new Map<string, number>();
  candidates.forEach((candidate, index) => {
    if (!rankMap.has(candidate.productId)) {
      rankMap.set(candidate.productId, index);
    }
  });

  const ordered = products
    .sort((left, right) => {
      const leftRank = rankMap.get(String(left._id)) ?? Number.MAX_SAFE_INTEGER;
      const rightRank = rankMap.get(String(right._id)) ?? Number.MAX_SAFE_INTEGER;
      return leftRank - rightRank;
    })
    .slice(0, limit)
    .map(toHybridSearchProduct);

  return {
    products: ordered,
    totalProducts: ordered.length,
    message: ordered.length > 0 ? 'Hybrid search results found' : 'No products found',
  };
}
