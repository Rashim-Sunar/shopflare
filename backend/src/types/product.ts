import type { HydratedDocument, Model, Types } from 'mongoose';

/**
 * @fileoverview Product domain contracts for schema typing and controller safety.
 */

export interface IProductImage {
  url: string;
  altText?: string;
}

export interface IProductDimensions {
  length?: number;
  width?: number;
  height?: number;
}

export interface IProduct {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  countInStock: number;
  sku: string;
  category: string;
  mainCategory?: string; // e.g., "Clothing"
  subCategory?: string; // e.g., "Kurti", "Shirt", "Saree" - enables multi-level filtering
  type?: string; // e.g., "Casual", "Ethnic", "Formal", "Partywear", "Sportswear"
  brand?: string;
  sizes: string[];
  colors: string[];
  collections: string;
  material?: string;
  gender?: 'Men' | 'Women' | 'Unisex';
  images: IProductImage[];
  isFeatured: boolean;
  isPublished: boolean;
  rating: number;
  numReviews: number;
  tags: string[];
  user: Types.ObjectId;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  dimensions?: IProductDimensions;
  weight?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProductDocument = HydratedDocument<IProduct>;

export interface ProductModel extends Model<IProduct> {}