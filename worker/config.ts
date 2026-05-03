import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

function loadEnvFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath, override: false });
  }
}

loadEnvFile(path.resolve(process.cwd(), '.env'));

/**
 * @fileoverview Runtime environment reader for the embedding worker service.
 */

export interface WorkerEnv {
  rabbitMqUrl: string;
  rabbitMqQueueName: string;
  rabbitMqDlqName: string;
  policyRabbitMqQueueName: string;
  policyRabbitMqDlqName: string;
  backendUrl: string;
  internalApiToken: string;
  qdrantUrl: string;
  qdrantCollectionName: string;
  policyQdrantCollectionName: string;
  embeddingProvider: 'openrouter' | 'openai';
  embeddingModel: string;
  embeddingVectorSize: number;
  embeddingMaxRetries: number;
  openRouterApiKey?: string;
  openAiApiKey?: string;
}

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readOptionalEnv(key: string): string | undefined {
  const value = process.env[key];
  return value && value.trim() ? value.trim() : undefined;
}

export function getWorkerEnv(): WorkerEnv {
  const providerRaw = (process.env.EMBEDDING_PROVIDER ?? 'openrouter').toLowerCase();
  const embeddingProvider: WorkerEnv['embeddingProvider'] = providerRaw === 'openai' ? 'openai' : 'openrouter';

  return {
    rabbitMqUrl: process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
    rabbitMqQueueName: process.env.RABBITMQ_QUEUE_NAME ?? 'product_updates',
    rabbitMqDlqName: process.env.RABBITMQ_DLQ_NAME ?? 'product_updates_dlq',
    policyRabbitMqQueueName: process.env.POLICY_RABBITMQ_QUEUE_NAME ?? 'policy_ingestion',
    policyRabbitMqDlqName: process.env.POLICY_RABBITMQ_DLQ_NAME ?? 'policy_ingestion_dlq',
    backendUrl: process.env.BACKEND_URL ?? 'http://localhost:9000',
    internalApiToken: process.env.INTERNAL_API_TOKEN ?? 'shopflare-internal-token',
    qdrantUrl: process.env.QDRANT_URL ?? 'http://localhost:6333',
    qdrantCollectionName: process.env.QDRANT_COLLECTION_NAME ?? 'products',
    policyQdrantCollectionName: process.env.POLICY_QDRANT_COLLECTION_NAME ?? 'customer_rights',
    embeddingProvider,
    embeddingModel: process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small',
    embeddingVectorSize: parseNumber(process.env.EMBEDDING_VECTOR_SIZE, 1536),
    embeddingMaxRetries: parseNumber(process.env.EMBEDDING_MAX_RETRIES, 3),
    openRouterApiKey: readOptionalEnv('OPENROUTER_API_KEY'),
    openAiApiKey: readOptionalEnv('OPENAI_API_KEY'),
  };
}

export const workerEnv = getWorkerEnv();
