import type { HydratedDocument, Model, Types } from 'mongoose';
import type { IShippingAddress, PaymentStatus } from './order';

/**
 * @fileoverview Checkout domain contracts for payment and order finalization flows.
 */

export interface ICheckoutItem {
  productId: Types.ObjectId | string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface ICheckout {
  user: Types.ObjectId;
  checkoutItems: ICheckoutItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  paymentStatus: PaymentStatus;
  paymentDetails?: Record<string, unknown>;
  isFinalized: boolean;
  finalizedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CheckoutDocument = HydratedDocument<ICheckout>;

export interface CheckoutModel extends Model<ICheckout> {}
