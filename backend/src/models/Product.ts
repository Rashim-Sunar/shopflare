import mongoose, { Schema } from 'mongoose';
import type { IProduct, ProductModel } from '../types/product';

/**
 * @fileoverview Typed Product model capturing catalog, inventory, and SEO metadata.
 */

const productSchema = new Schema<IProduct, ProductModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    sku: {
      type: String,
      unique: true,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    // New structured category fields for multi-level filtering
    // Avoids flat "Men > Shirts" structure; enables scalable filtering
    mainCategory: {
      type: String,
      default: 'Clothing',
      comment: 'Top-level category for product classification',
    },
    // Subcategory enables fine-grained filtering and AI understanding
    // Examples: "Shirt", "Kurti", "Saree", "Jeans", "Dress"
    subCategory: {
      type: String,
      comment: 'Product type for multi-level filtering (e.g., Kurti, Saree for ethnic wear)',
    },
    // Type field captures product nature beyond category
    // Examples: "Casual", "Ethnic", "Formal", "Partywear", "Sportswear"
    type: {
      type: String,
      enum: ['Casual', 'Formal', 'Ethnic', 'Partywear', 'Sportswear'],
      comment: 'Product type/style classification for dynamic filtering',
    },
    brand: {
      type: String,
    },
    sizes: {
      type: [String],
      required: true,
    },
    colors: {
      type: [String],
      required: true,
    },
    collections: {
      type: String,
      required: true,
    },
    material: {
      type: String,
    },
    gender: {
      type: String,
      enum: ['Men', 'Women', 'Unisex'],
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        altText: {
          type: String,
        },
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    tags: [String],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    metaTitle: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    metaKeywords: {
      type: String,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    weight: Number,
  },
  {
    timestamps: true,
  }
);

// Add indexes for multi-level filtering and search performance
// Composite index enables efficient filtering by gender, subCategory, and price range
productSchema.index({ gender: 1, subCategory: 1, price: 1 });
// Additional indexes for common filter patterns
productSchema.index({ isPublished: 1, type: 1 });
productSchema.index({ brand: 1, price: 1 });

const Product = mongoose.model<IProduct, ProductModel>('Product', productSchema);

export default Product;