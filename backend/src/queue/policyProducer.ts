import amqplib from 'amqplib';
import { appEnv } from '../config/env';

/**
 * @fileoverview RabbitMQ producer for customer-rights PDF ingestion jobs.
 */

export interface PolicyIngestionMessage {
  documentId: string;
  filePath: string;
  originalName: string;
  version: string;
  uploadedAt: string;
  isActive: boolean;
}

/**
 * Function: publishPolicyIngestionJob
 * ----------------------------------------
 * Purpose:
 *   Sends a policy PDF ingestion job to RabbitMQ asynchronously.
 */
export async function publishPolicyIngestionJob(message: PolicyIngestionMessage): Promise<void> {
  const connection = await amqplib.connect(appEnv.rabbitMqUrl);
  const channel = await connection.createChannel();

  try {
    await channel.assertQueue(appEnv.policyRabbitMqQueueName, {
      durable: true,
      deadLetterExchange: '',
      deadLetterRoutingKey: appEnv.policyRabbitMqDlqName,
    });

    await channel.assertQueue(appEnv.policyRabbitMqDlqName, { durable: true });

    const published = channel.sendToQueue(appEnv.policyRabbitMqQueueName, Buffer.from(JSON.stringify(message)), {
      persistent: true,
      contentType: 'application/json',
      timestamp: Date.now(),
    });

    if (!published) {
      throw new Error('RabbitMQ sendToQueue returned false for policy ingestion job');
    }
  } finally {
    await channel.close();
    await connection.close();
  }
}
