import axios from 'axios';
import { workerEnv } from './config';

/**
 * @fileoverview Embedding generation helper for queue consumers.
 */

interface EmbeddingResponse {
  data?: Array<{
    embedding?: number[];
  }>;
}

/**
 * Function: generateEmbedding
 * ----------------------------------------
 * Purpose:
 *   Generates vector embeddings for product text payloads.
 *
 * Inputs:
 *   - text (string): Canonicalized product text.
 *
 * Outputs:
 *   - Promise<number[]> with embedding values.
 *
 * Steps:
 *   1. Resolve provider endpoint and API key.
 *   2. Call embedding API with configured model.
 *   3. Validate and return vector data.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (!normalized) {
    throw new Error('Embedding input text is empty');
  }

  const isOpenAi = workerEnv.embeddingProvider === 'openai';
  const endpoint = isOpenAi ? 'https://api.openai.com/v1/embeddings' : 'https://openrouter.ai/api/v1/embeddings';
  const apiKey = isOpenAi ? workerEnv.openAiApiKey : workerEnv.openRouterApiKey;

  if (!apiKey) {
    throw new Error(`Missing API key for embedding provider: ${workerEnv.embeddingProvider}`);
  }

  const model = isOpenAi ? workerEnv.embeddingModel : `openai/${workerEnv.embeddingModel}`;

  const response = await axios.post<EmbeddingResponse>(
    endpoint,
    {
      model,
      input: normalized,
    },
    {
      timeout: 15000,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const embedding = response.data.data?.[0]?.embedding;

  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error('Embedding API returned empty vector');
  }

  return embedding;
}
