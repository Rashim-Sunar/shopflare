import axios from 'axios';
import { appEnv } from '../config/env';

/**
 * @fileoverview Embedding generator that supports OpenAI and OpenRouter providers.
 */

interface EmbeddingResponse {
  data?: Array<{
    embedding?: number[];
  }>;
}

function normalizeEmbeddingInput(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

/**
 * Function: generateEmbedding
 * ----------------------------------------
 * Purpose:
 *   Converts natural language text into an embedding vector for semantic search.
 *
 * Inputs:
 *   - text (string): Input text to vectorize.
 *
 * Outputs:
 *   - Promise<number[]>: Dense vector embedding.
 *
 * Steps:
 *   1. Validate and normalize input text.
 *   2. Select provider-specific endpoint and auth header.
 *   3. Call embeddings API with configured model.
 *   4. Return the first embedding vector.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const normalized = normalizeEmbeddingInput(text);

  if (!normalized) {
    throw new Error('Cannot generate embedding for empty text');
  }

  const isOpenAi = appEnv.embeddingProvider === 'openai';
  const endpoint = isOpenAi ? 'https://api.openai.com/v1/embeddings' : 'https://openrouter.ai/api/v1/embeddings';
  const apiKey = isOpenAi ? appEnv.openAiApiKey : appEnv.openRouterApiKey;

  if (!apiKey) {
    throw new Error(`Missing API key for embedding provider: ${appEnv.embeddingProvider}`);
  }

  const model = isOpenAi ? appEnv.embeddingModel : `openai/${appEnv.embeddingModel}`;

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
    throw new Error('Embedding provider returned an empty embedding vector');
  }

  return embedding;
}
