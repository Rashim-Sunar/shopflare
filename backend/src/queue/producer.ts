import amqplib from 'amqplib';
import { appEnv } from '../config/env';

/**
 * @fileoverview RabbitMQ producer for product change events.
 */

export interface ProductUpdateMessage {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand?: string;
  updatedAt?: string;
}

function toQueuePayload(product: ProductUpdateMessage): ProductUpdateMessage {
  return {
    ...product,
    updatedAt: product.updatedAt ?? new Date().toISOString(),
  };
}

/**
 * Function: publishProductUpdate
 * ----------------------------------------
 * Purpose:
 *   Publishes product changes to RabbitMQ queue for async processing.
 *
 * Inputs:
 *   - product object (id, name, description, price, stock).
 *
 * Outputs:
 *   - Sends message to "product_updates" queue.
 *
 * Steps:
 *   1. Connect to RabbitMQ.
 *   2. Create channel.
 *   3. Assert queue "product_updates".
 *   4. Serialize product data.
 *   5. Publish message to queue.
 *   6. Close connection safely.
 */
export async function publishProductUpdate(product: ProductUpdateMessage): Promise<void> {
  const connection = await amqplib.connect(appEnv.rabbitMqUrl);
  const channel = await connection.createChannel();

  try {
    await channel.assertQueue(appEnv.rabbitMqQueueName, {
      durable: true,
      deadLetterExchange: '',
      deadLetterRoutingKey: appEnv.rabbitMqDlqName,
    });

    await channel.assertQueue(appEnv.rabbitMqDlqName, { durable: true });

    const payload = toQueuePayload(product);

    const published = channel.sendToQueue(appEnv.rabbitMqQueueName, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      contentType: 'application/json',
      timestamp: Date.now(),
    });

    if (!published) {
      throw new Error('RabbitMQ sendToQueue returned false for product update event');
    }

    console.log(`[QUEUE] Published product update event for productId=${product.id}`);
  } finally {
    await channel.close();
    await connection.close();
  }
}

/**
 * Function: publishProductUpdatesBatch
 * ----------------------------------------
 * Purpose:
 *   Publishes multiple product change events to RabbitMQ using a single connection.
 *
 * Inputs:
 *   - products (ProductUpdateMessage[]): Product updates to enqueue.
 *
 * Outputs:
 *   - Promise<number>: Count of published messages.
 *
 * Steps:
 *   1. Connect to RabbitMQ and create one channel.
 *   2. Assert the main queue and DLQ once.
 *   3. Serialize and publish each product payload.
 *   4. Close channel and connection safely.
 */
export async function publishProductUpdatesBatch(products: ProductUpdateMessage[]): Promise<number> {
  if (products.length === 0) {
    return 0;
  }

  const connection = await amqplib.connect(appEnv.rabbitMqUrl);
  const channel = await connection.createChannel();

  try {
    await channel.assertQueue(appEnv.rabbitMqQueueName, {
      durable: true,
      deadLetterExchange: '',
      deadLetterRoutingKey: appEnv.rabbitMqDlqName,
    });

    await channel.assertQueue(appEnv.rabbitMqDlqName, { durable: true });

    let publishedCount = 0;

    for (const product of products) {
      const payload = toQueuePayload(product);
      const published = channel.sendToQueue(appEnv.rabbitMqQueueName, Buffer.from(JSON.stringify(payload)), {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now(),
      });

      if (!published) {
        throw new Error(`RabbitMQ sendToQueue returned false for productId=${product.id}`);
      }

      publishedCount += 1;
    }

    console.log(`[QUEUE] Batch published ${publishedCount} product update events`);
    return publishedCount;
  } finally {
    await channel.close();
    await connection.close();
  }
}
