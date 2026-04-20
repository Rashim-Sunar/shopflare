import mongoose, { Schema } from 'mongoose';
import type { ICart, CartModel } from '../types/cart';

/**
+ * @fileoverview Typed Cart model for shopping cart management with guest and user support.
 */

const cartItemSchema = new Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
    },
    image: {
      type: String,
    },
    price: {
      type: Schema.Types.Mixed,
      required: true,
    },
    size: {
      type: String,
    },
    color: {
      type: String,
    },
    quantity: {
      type: Number,
      default: 1,
    },
  },
  {
    _id: false,
  }
);

const cartSchema = new Schema<ICart, CartModel>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    guestId: {
      type: String,
    },
    products: [cartItemSchema],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model<ICart, CartModel>('Cart', cartSchema);

export default Cart;
