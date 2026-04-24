import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import Product from '../src/models/Product';
import User from '../src/models/User';
import { normalizeProductBatch, RawProductData } from '../src/utils/productNormalizer';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in .env file');
  process.exit(1);
}

/**
 * Get or create an admin user
 */
async function getOrCreateAdminUser() {
  try {
    let adminUser = await User.findOne({ role: 'admin' });

    if (!adminUser) {
      console.log('📝 Admin user not found, creating...');
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@ecommerce.com',
        password: 'admin@12345',
        role: 'admin',
      });
      console.log(`✅ Created admin user: ${adminUser._id}`);
    } else {
      console.log(`📦 Using existing admin user: ${adminUser._id}`);
    }

    return adminUser;
  } catch (error) {
    throw new Error(`Failed to get/create admin user: ${(error as Error).message}`);
  }
}

/**
 * Load raw products from JSON file
 */
function loadProductsFromJson(filePath: string): RawProductData[] {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const products = JSON.parse(rawData);

    if (!Array.isArray(products)) {
      throw new Error('Expected products JSON to be an array');
    }

    console.log(`📖 Loaded ${products.length} raw products from ${filePath}`);
    return products;
  } catch (error) {
    throw new Error(`Failed to load products JSON: ${(error as Error).message}`);
  }
}

/**
 * Calculate statistics from normalized products
 */
function calculateStatistics(products: any[]) {
  const stats: Record<string, Record<string, number>> = {};

  products.forEach((product) => {
    const gender = product.gender || 'Unknown';
    const type = product.type || 'Unknown';

    if (!stats[gender]) {
      stats[gender] = {};
    }

    stats[gender][type] = (stats[gender][type] || 0) + 1;
  });

  return stats;
}

/**
 * Main seed function
 */
async function seedDatabase() {
  let connection: any = null;

  try {
    // Connect to MongoDB
    connection = await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get or create admin user
    const adminUser = await getOrCreateAdminUser();

    // Load raw products from JSON
    const jsonPath = path.join(__dirname, '../../data/products.json');
    const rawProducts = loadProductsFromJson(jsonPath);

    // Normalize products
    const normalizedProducts = normalizeProductBatch(rawProducts, String(adminUser._id));

    if (normalizedProducts.length === 0) {
      console.warn('⚠️  No valid products after normalization. Exiting.');
      process.exit(0);
    }

    console.log(`✅ Normalized ${normalizedProducts.length} products (skipped ${rawProducts.length - normalizedProducts.length})`);

    // Clear existing products
    const deletedCount = await Product.deleteMany({});
    console.log(`🗑️  Cleared ${deletedCount.deletedCount} existing products`);

    // Batch insert normalized products
    const insertedProducts = await Product.insertMany(normalizedProducts, { ordered: false });
    console.log(`✅ Successfully inserted ${insertedProducts.length} products into database`);

    // Calculate and display statistics
    const stats = calculateStatistics(insertedProducts);
    console.log('\n📊 ===== SEEDING STATISTICS =====');
    Object.entries(stats).forEach(([gender, types]) => {
      console.log(`\n👥 ${gender}:`);
      Object.entries(types).forEach(([type, count]) => {
        console.log(`   📦 ${type}: ${count} products`);
      });
    });

    // Display additional metrics
    const publishedCount = await Product.countDocuments({ isPublished: true });
    const featuredCount = await Product.countDocuments({ isFeatured: true });
    const avgRating = await Product.aggregate([{ $group: { _id: null, avgRating: { $avg: '$rating' } } }]);

    console.log('\n📈 ===== ADDITIONAL METRICS =====');
    console.log(`📊 Total products: ${insertedProducts.length}`);
    console.log(`✅ Published: ${publishedCount}`);
    console.log(`⭐ Featured: ${featuredCount}`);
    if (avgRating.length > 0) {
      console.log(`⭐ Average rating: ${avgRating[0].avgRating.toFixed(2)}`);
    }

    console.log('\n✨ ===== SEEDING COMPLETED SUCCESSFULLY =====\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await mongoose.disconnect();
    }
  }
}

seedDatabase();
