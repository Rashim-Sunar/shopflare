import Product from '../models/Product';
import { appEnv } from '../config/env';
import { publishProductUpdate } from './producer';

/**
 * @fileoverview Optional MongoDB change stream bridge that mirrors product changes to RabbitMQ.
 */

let watcherStarted = false;

/**
 * Function: startProductChangeStreamWatcher
 * ----------------------------------------
 * Purpose:
 *   Watches product collection mutations and emits queue events automatically.
 *
 * Inputs:
 *   - none.
 *
 * Outputs:
 *   - Starts background watcher when enabled.
 *
 * Steps:
 *   1. Exit early when feature flag is disabled.
 *   2. Attach change stream on insert/update/replace operations.
 *   3. Resolve latest product snapshot.
 *   4. Publish update event to RabbitMQ asynchronously.
 */
export function startProductChangeStreamWatcher(): void {
  if (!appEnv.enableProductChangeStream || watcherStarted) {
    return;
  }

  const changeStream = Product.watch([], { fullDocument: 'updateLookup' });
  watcherStarted = true;

  changeStream.on('change', (change: any) => {
    if (!['insert', 'update', 'replace'].includes(change.operationType)) {
      return;
    }

    const doc = change.fullDocument;
    if (!doc) {
      return;
    }

    void publishProductUpdate({
      id: String(doc._id),
      name: String(doc.name ?? ''),
      description: String(doc.description ?? ''),
      price: Number(doc.price ?? 0),
      stock: Number(doc.countInStock ?? 0),
      category: String(doc.category ?? ''),
      brand: doc.brand ? String(doc.brand) : undefined,
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
    }).catch((error: unknown) => {
      console.error('[QUEUE] Failed publishing product update from change stream', error);
    });
  });

  changeStream.on('error', (error: unknown) => {
    console.error('[QUEUE] Product change stream error', error);
  });

  console.log('[QUEUE] Product change stream watcher started');
}
