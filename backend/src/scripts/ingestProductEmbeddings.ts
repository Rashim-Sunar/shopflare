import Product from '../models/Product';
import { connectDB } from '../config/db';
import { publishProductUpdatesBatch, type ProductUpdateMessage } from '../queue/producer';

/**
 * @fileoverview One-time ingestion script that queues existing products for embedding generation.
 */

interface IngestionArgs {
  includeUnpublished: boolean;
  batchSize: number;
}

function parseArgs(argv: string[]): IngestionArgs {
  const includeUnpublished = argv.includes('--include-unpublished');
  const batchSizeArg = argv.find((arg) => arg.startsWith('--batch-size='));
  const batchSizeValue = batchSizeArg ? Number.parseInt(batchSizeArg.split('=')[1], 10) : 250;

  return {
    includeUnpublished,
    batchSize: Number.isFinite(batchSizeValue) && batchSizeValue > 0 ? batchSizeValue : 250,
  };
}

function toProductUpdateMessage(product: any): ProductUpdateMessage {
  return {
    id: String(product._id),
    name: String(product.name ?? ''),
    description: String(product.description ?? ''),
    price: Number(product.price ?? 0),
    stock: Number(product.countInStock ?? 0),
    category: String(product.category ?? ''),
    brand: product.brand ? String(product.brand) : undefined,
    updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString(),
  };
}

/**
 * Function: ingestProductEmbeddings
 * ----------------------------------------
 * Purpose:
 *   Queues existing products for first-time embedding ingestion via RabbitMQ worker.
 *
 * Inputs:
 *   - includeUnpublished (boolean): Whether to include products not visible in catalog.
 *   - batchSize (number): Number of queue messages to publish per batch.
 *
 * Outputs:
 *   - Promise<void> with ingestion summary logs.
 *
 * Steps:
 *   1. Connect to MongoDB.
 *   2. Load product records eligible for ingestion.
 *   3. Split into configurable batches.
 *   4. Publish each batch to RabbitMQ queue.
 *   5. Log totals and exit.
 */
async function ingestProductEmbeddings(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  await connectDB();

  const query = args.includeUnpublished ? {} : { isPublished: true };
  const products = await Product.find(query)
    .select('_id name description price countInStock category brand updatedAt')
    .lean();

  if (products.length === 0) {
    console.log('[INGEST] No products found to ingest');
    process.exit(0);
  }

  let totalPublished = 0;
  for (let index = 0; index < products.length; index += args.batchSize) {
    const batch = products.slice(index, index + args.batchSize).map(toProductUpdateMessage);
    const publishedCount = await publishProductUpdatesBatch(batch);
    totalPublished += publishedCount;
    console.log(
      `[INGEST] Published batch ${Math.floor(index / args.batchSize) + 1} | batchSize=${batch.length} | totalPublished=${totalPublished}`
    );
  }

  console.log(
    `[INGEST] Completed initial queue ingestion | productsLoaded=${products.length} | messagesPublished=${totalPublished} | includeUnpublished=${args.includeUnpublished}`
  );
  process.exit(0);
}

void ingestProductEmbeddings().catch((error: unknown) => {
  console.error('[INGEST] Failed to queue product ingestion', error);
  process.exit(1);
});
