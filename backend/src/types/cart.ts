import type { HydratedDocument, Model, Types } from 'mongoose';

/**
 * @fileoverview Cart domain contracts for shopping cart management and guest cart merging.
 */

export interface ICartItem {
  productId: Types.ObjectId;
  name?: string;
  image?: string;
  price: number | string;
  size?: string;
  color?: string;
  quantity: number;
}

export interface ICart {
  user?: Types.ObjectId;
  guestId?: string;
  products: ICartItem[];
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CartDocument = HydratedDocument<ICart>;

export interface CartModel extends Model<ICart> {}
