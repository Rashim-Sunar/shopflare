import amqplib, { type ConsumeMessage } from 'amqplib';
import { workerEnv } from './config';
import { generateEmbedding } from './embeddings';
import { upsertProductVector } from './qdrantClient';

/**
 * @fileoverview RabbitMQ consumer that converts product updates into Qdrant vectors.
 */

interface ProductUpdateMessage {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand?: string;
  updatedAt?: string;
  retryCount?: number;
}

function toEmbeddingText(product: ProductUpdateMessage): string {
  return [
    `name: ${product.name}`,
    `description: ${product.description}`,
    `category: ${product.category}`,
    `brand: ${product.brand ?? 'unknown'}`,
    `price: ${product.price}`,
    `stock: ${product.stock}`,
  ].join(' | ');
}

function parseMessage(message: ConsumeMessage): ProductUpdateMessage {
  return JSON.parse(message.content.toString()) as ProductUpdateMessage;
}

async function requeueOrDeadLetter(channel: amqplib.Channel, message: ConsumeMessage, payload: ProductUpdateMessage, error: unknown): Promise<void> {
  const currentRetry = payload.retryCount ?? 0;
  const nextRetry = currentRetry + 1;

  if (nextRetry <= workerEnv.embeddingMaxRetries) {
    const nextPayload: ProductUpdateMessage = {
      ...payload,
      retryCount: nextRetry,
    };

    channel.sendToQueue(workerEnv.rabbitMqQueueName, Buffer.from(JSON.stringify(nextPayload)), {
      persistent: true,
      contentType: 'application/json',
      timestamp: Date.now(),
    });
    channel.ack(message);
    console.error(`[WORKER] Retry ${nextRetry}/${workerEnv.embeddingMaxRetries} for productId=${payload.id}`, error);
    return;
  }

  channel.sendToQueue(workerEnv.rabbitMqDlqName, message.content, {
    persistent: true,
    contentType: 'application/json',
    timestamp: Date.now(),
  });
  channel.ack(message);
  console.error(`[WORKER] Sent message to DLQ for productId=${payload.id}`, error);
}

/**
 * Function: consumeProductUpdates
 * ----------------------------------------
 * Purpose:
 *   Consumes product update messages and syncs embeddings to Qdrant.
 *
 * Steps:
 *   1. Connect to RabbitMQ.
 *   2. Subscribe to "product_updates" queue.
 *   3. Parse incoming message.
 *   4. Generate embedding using OpenRouter/OpenAI.
 *   5. Connect to Qdrant.
 *   6. Upsert vector with payload.
 *   7. Acknowledge message.
 */
export async function consumeProductUpdates(): Promise<void> {
  const connection = await amqplib.connect(workerEnv.rabbitMqUrl);
  const channel = await connection.createChannel();

  await channel.assertQueue(workerEnv.rabbitMqQueueName, {
    durable: true,
    deadLetterExchange: '',
    deadLetterRoutingKey: workerEnv.rabbitMqDlqName,
  });
  await channel.assertQueue(workerEnv.rabbitMqDlqName, { durable: true });

  channel.prefetch(10);

  console.log(`[WORKER] Waiting for messages on queue=${workerEnv.rabbitMqQueueName}`);

  await channel.consume(workerEnv.rabbitMqQueueName, async (message) => {
    if (!message) {
      return;
    }

    try {
      const payload = parseMessage(message);
      const embeddingInput = toEmbeddingText(payload);
      const vector = await generateEmbedding(embeddingInput);

      await upsertProductVector(payload.id, vector, {
        productId: payload.id,
        name: payload.name,
        price: payload.price,
        category: payload.category,
        description: payload.description,
      });

      channel.ack(message);
      console.log(`[WORKER] Upserted vector for productId=${payload.id}`);
    } catch (error: unknown) {
      try {
        const payload = parseMessage(message);
        await requeueOrDeadLetter(channel, message, payload, error);
      } catch (parseError: unknown) {
        channel.nack(message, false, false);
        console.error('[WORKER] Dropped invalid queue message payload', parseError);
      }
    }
  });
}

void consumeProductUpdates().catch((error: unknown) => {
  console.error('[WORKER] Failed to start consumer', error);
  process.exit(1);
});
