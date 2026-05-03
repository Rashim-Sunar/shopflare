import dotenv from 'dotenv';

/**
 * @fileoverview Centralized environment validation for the backend runtime.
 */

dotenv.config();

export interface AppEnv {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  mongoUri: string;
  secretStr: string;
  expiringDay: string;
  openRouterApiKey: string;
  openAiApiKey?: string;
  internalApiToken: string;
  rabbitMqUrl: string;
  rabbitMqQueueName: string;
  rabbitMqDlqName: string;
  policyRabbitMqQueueName: string;
  policyRabbitMqDlqName: string;
  qdrantUrl: string;
  qdrantCollectionName: string;
  policyQdrantCollectionName: string;
  embeddingProvider: 'openrouter' | 'openai';
  embeddingModel: string;
  embeddingVectorSize: number;
  enableProductChangeStream: boolean;
}

function readRequiredEnv(key: 'MONGO_URI' | 'SECRET_STR' | 'EXPIRING_DAY' | 'OPENROUTER_API_KEY'): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function readOptionalEnv(key: string): string | undefined {
  const value = process.env[key];
  return value && value.trim() ? value.trim() : undefined;
}

/**
 * @function getAppEnv
 * @description Reads, validates, and normalizes the environment variables used by the server.
 *
 * @steps
 * 1. Read required variables from process.env and fail fast if any are missing.
 * 2. Normalize optional values like PORT and NODE_ENV into typed runtime values.
 * 3. Return a single config object so the rest of the app does not touch raw process.env.
 *
 * @returns {AppEnv} Strongly typed application environment settings.
 */
export function getAppEnv(): AppEnv {
  const rawPort = process.env.PORT ?? '3000';
  const parsedPort = Number.parseInt(rawPort, 10);
  const embeddingProviderRaw = (process.env.EMBEDDING_PROVIDER ?? 'openrouter').toLowerCase();
  const embeddingProvider: AppEnv['embeddingProvider'] = embeddingProviderRaw === 'openai' ? 'openai' : 'openrouter';
  const parsedEmbeddingVectorSize = Number.parseInt(process.env.EMBEDDING_VECTOR_SIZE ?? '1536', 10);

  return {
    nodeEnv: (process.env.NODE_ENV ?? 'development') as AppEnv['nodeEnv'],
    port: Number.isNaN(parsedPort) ? 3000 : parsedPort,
    mongoUri: readRequiredEnv('MONGO_URI'),
    secretStr: readRequiredEnv('SECRET_STR'),
    expiringDay: readRequiredEnv('EXPIRING_DAY'),
    openRouterApiKey: readRequiredEnv('OPENROUTER_API_KEY'),
    openAiApiKey: readOptionalEnv('OPENAI_API_KEY'),
    internalApiToken: process.env.INTERNAL_API_TOKEN ?? 'shopflare-internal-token',
    rabbitMqUrl: process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
    rabbitMqQueueName: process.env.RABBITMQ_QUEUE_NAME ?? 'product_updates',
    rabbitMqDlqName: process.env.RABBITMQ_DLQ_NAME ?? 'product_updates_dlq',
    policyRabbitMqQueueName: process.env.POLICY_RABBITMQ_QUEUE_NAME ?? 'policy_ingestion',
    policyRabbitMqDlqName: process.env.POLICY_RABBITMQ_DLQ_NAME ?? 'policy_ingestion_dlq',
    qdrantUrl: process.env.QDRANT_URL ?? 'http://localhost:6333',
    qdrantCollectionName: process.env.QDRANT_COLLECTION_NAME ?? 'products',
    policyQdrantCollectionName: process.env.POLICY_QDRANT_COLLECTION_NAME ?? 'customer_rights',
    embeddingProvider,
    embeddingModel: process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small',
    embeddingVectorSize: Number.isNaN(parsedEmbeddingVectorSize) ? 1536 : parsedEmbeddingVectorSize,
    enableProductChangeStream: (process.env.ENABLE_PRODUCT_CHANGE_STREAM ?? 'false').toLowerCase() === 'true',
  };
}

export const appEnv = getAppEnv();