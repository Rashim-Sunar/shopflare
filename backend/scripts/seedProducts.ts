import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product';
import User from '../src/models/User';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in .env file');
  process.exit(1);
}

const sampleProducts = [
  {
    name: 'Premium Cotton T-Shirt',
    description: 'High-quality 100% cotton t-shirt perfect for everyday wear. Comfortable and breathable.',
    price: 1500,
    discountPrice: 1200,
    countInStock: 50,
    sku: 'TSH-001',
    category: 'T-Shirts',
    brand: 'StyleHub',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Navy'],
    collections: 'New Arrivals',
    material: 'Cotton',
    gender: 'Men',
    images: [
      {
        url: 'https://via.placeholder.com/500x500?text=Premium+Cotton+T-Shirt',
        altText: 'Premium Cotton T-Shirt',
      },
    ],
    isFeatured: true,
    isPublished: true,
    rating: 4.8,
    numReviews: 45,
    tags: ['cotton', 'casual', 'bestseller'],
    metaTitle: 'Premium Cotton T-Shirt | StyleHub',
    metaDescription: 'High-quality 100% cotton t-shirt for everyday wear',
  },
  {
    name: 'Formal Dress Shirt',
    description: 'Elegant formal shirt with a perfect fit. Ideal for office and special occasions.',
    price: 2500,
    discountPrice: 2000,
    countInStock: 30,
    sku: 'FSH-001',
    category: 'Formal Shirts',
    brand: 'ElegantWear',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Light Blue', 'Pink'],
    collections: 'Best Seller',
    material: 'Cotton',
    gender: 'Men',
    images: [
      {
        url: 'https://via.placeholder.com/500x500?text=Formal+Dress+Shirt',
        altText: 'Formal Dress Shirt',
      },
    ],
    isFeatured: true,
    isPublished: true,
    rating: 4.9,
    numReviews: 78,
    tags: ['formal', 'office', 'bestseller'],
    metaTitle: 'Formal Dress Shirt | ElegantWear',
    metaDescription: 'Elegant formal shirt perfect for office and special occasions',
  },
  {
    name: 'Summer Casual Jeans',
    description: 'Comfortable and stylish jeans for summer. Perfect fit with modern design.',
    price: 2200,
    discountPrice: 1800,
    countInStock: 40,
    sku: 'JNS-001',
    category: 'Jeans',
    brand: 'DenimPro',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Light Blue', 'Dark Blue', 'Black'],
    collections: 'New Arrivals',
    material: 'Denim',
    gender: 'Unisex',
    images: [
      {
        url: 'https://via.placeholder.com/500x500?text=Summer+Casual+Jeans',
        altText: 'Summer Casual Jeans',
      },
    ],
    isFeatured: true,
    isPublished: true,
    rating: 4.7,
    numReviews: 92,
    tags: ['jeans', 'casual', 'unisex'],
    metaTitle: 'Summer Casual Jeans | DenimPro',
    metaDescription: 'Comfortable and stylish jeans perfect for summer',
  },
  {
    name: 'Women\'s Designer Saree',
    description: 'Elegant traditional saree with modern patterns. Perfect for festivals and special occasions.',
    price: 3500,
    discountPrice: 2800,
    countInStock: 20,
    sku: 'SRE-001',
    category: 'Sarees',
    brand: 'TraditionalFashion',
    sizes: ['One Size'],
    colors: ['Red', 'Blue', 'Green', 'Purple'],
    collections: 'Best Seller',
    material: 'Silk',
    gender: 'Women',
    images: [
      {
        url: 'https://via.placeholder.com/500x500?text=Women+Designer+Saree',
        altText: 'Women Designer Saree',
      },
    ],
    isFeatured: true,
    isPublished: true,
    rating: 4.9,
    numReviews: 56,
    tags: ['saree', 'traditional', 'festival'],
    metaTitle: 'Women Designer Saree | TraditionalFashion',
    metaDescription: 'Elegant traditional saree perfect for festivals',
  },
  {
    name: 'Casual Sports Jacket',
    description: 'Lightweight sports jacket for casual outings. Water-resistant and stylish.',
    price: 3000,
    discountPrice: 2400,
    countInStock: 25,
    sku: 'JKT-001',
    category: 'Jackets',
    brand: 'SportZone',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Gray', 'Navy'],
    collections: 'New Arrivals',
    material: 'Polyester',
    gender: 'Men',
    images: [
      {
        url: 'https://via.placeholder.com/500x500?text=Casual+Sports+Jacket',
        altText: 'Casual Sports Jacket',
      },
    ],
    isFeatured: false,
    isPublished: true,
    rating: 4.6,
    numReviews: 34,
    tags: ['jacket', 'sports', 'casual'],
    metaTitle: 'Casual Sports Jacket | SportZone',
    metaDescription: 'Lightweight sports jacket perfect for casual outings',
  },
  {
    name: 'Women\'s Casual Tee',
    description: 'Soft and comfortable casual t-shirt for women. Available in multiple colors.',
    price: 1200,
    discountPrice: 900,
    countInStock: 60,
    sku: 'WTH-001',
    category: 'T-Shirts',
    brand: 'FashionHub',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Pink', 'Yellow'],
    collections: 'New Arrivals',
    material: 'Cotton',
    gender: 'Women',
    images: [
      {
        url: 'https://via.placeholder.com/500x500?text=Women+Casual+Tee',
        altText: 'Women Casual Tee',
      },
    ],
    isFeatured: true,
    isPublished: true,
    rating: 4.5,
    numReviews: 102,
    tags: ['tshirt', 'women', 'casual'],
    metaTitle: 'Women Casual Tee | FashionHub',
    metaDescription: 'Soft and comfortable casual t-shirt for women',
  },
  {
    name: 'Premium Denim Jacket',
    description: 'Classic denim jacket that never goes out of style. Perfect for any season.',
    price: 2800,
    discountPrice: 2200,
    countInStock: 35,
    sku: 'DNM-JKT-001',
    category: 'Jackets',
    brand: 'DenimPro',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Light Blue', 'Dark Blue', 'Black'],
    collections: 'Best Seller',
    material: 'Denim',
    gender: 'Unisex',
    images: [
      {
        url: 'https://via.placeholder.com/500x500?text=Premium+Denim+Jacket',
        altText: 'Premium Denim Jacket',
      },
    ],
    isFeatured: true,
    isPublished: true,
    rating: 4.8,
    numReviews: 123,
    tags: ['denim', 'jacket', 'classic', 'bestseller'],
    metaTitle: 'Premium Denim Jacket | DenimPro',
    metaDescription: 'Classic denim jacket perfect for any season',
  },
  {
    name: 'Elegant Sweater',
    description: 'Cozy and warm sweater perfect for winter. Available in multiple colors.',
    price: 2000,
    discountPrice: 1600,
    countInStock: 45,
    sku: 'SWE-001',
    category: 'Sweaters',
    brand: 'CozyWear',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Gray', 'Black', 'Cream', 'Navy'],
    collections: 'New Arrivals',
    material: 'Wool',
    gender: 'Women',
    images: [
      {
        url: 'https://via.placeholder.com/500x500?text=Elegant+Sweater',
        altText: 'Elegant Sweater',
      },
    ],
    isFeatured: false,
    isPublished: true,
    rating: 4.7,
    numReviews: 67,
    tags: ['sweater', 'winter', 'women', 'cozy'],
    metaTitle: 'Elegant Sweater | CozyWear',
    metaDescription: 'Cozy and warm sweater perfect for winter',
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get the first user (admin or any available user)
    const adminUser = await User.findOne();

    if (!adminUser) {
      console.error('❌ No user found in database. Please create a user first.');
      process.exit(1);
    }

    console.log(`📦 Using user: ${adminUser._id}`);

    // Add user ID to each product
    const productsWithUser = sampleProducts.map((product) => ({
      ...product,
      user: adminUser._id,
    }));

    // Clear existing products (optional - comment out if you want to keep them)
    // await Product.deleteMany({});
    // console.log('🗑️  Cleared existing products');

    // Insert new products
    const result = await Product.insertMany(productsWithUser);
    console.log(`✅ Successfully seeded ${result.length} products!`);

    // Display summary
    const published = await Product.countDocuments({ isPublished: true });
    const featured = await Product.countDocuments({ isFeatured: true });
    console.log(`📊 Published products: ${published}`);
    console.log(`⭐ Featured products: ${featured}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
