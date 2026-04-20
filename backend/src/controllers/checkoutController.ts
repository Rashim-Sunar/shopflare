import type { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Checkout from '../models/Checkout';
import Cart from '../models/Cart';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import type { ICheckout } from '../types/checkout';
import type { PaymentStatus, IOrderItem } from '../types/order';
import type { AuthenticatedRequest } from '../types/http';

/**
 * @fileoverview Checkout controller for payment processing and order finalization workflows.
 */

interface CreateCheckoutRequest {
  checkoutItems: Array<{
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }>;
  shippingAddress: { address: string; city: string; postalCode: string; country: string };
  paymentMethod: string;
  totalPrice: number;
}

interface CheckoutResponse {
  status: 'success';
  message: string;
  checkout: ICheckout;
}

/**
 * @function createCheckout
 * @description Creates a checkout record from cart items and shipping details.
 *
 * @steps
 * 1. Validate that checkout items array is not empty.
 * 2. Persist the checkout record with user context and payment defaults.
 * 3. Return the created checkout for subsequent payment processing.
 *
 * @param {Request} req - Checkout creation request with items and address.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the created checkout response.
 */
export const createCheckout = asyncHandler(
  async (req: AuthenticatedRequest<never, CheckoutResponse, CreateCheckoutRequest>, res: Response<CheckoutResponse>, next: NextFunction) => {
    const { checkoutItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (!checkoutItems || checkoutItems.length === 0) {
      next(new AppError('No items in the checkout', 400));
      return;
    }

    if (!req.user) {
      next(new AppError('User not authenticated', 401));
      return;
    }

    const newCheckout = await Checkout.create({
      user: req.user._id,
      checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });

    res.status(200).json({
      status: 'success',
      message: 'Checkout created successfully',
      checkout: newCheckout,
    });
  }
);

/**
 * @function payCheckout
 * @description Updates checkout payment status and records payment details from payment gateway.
 *
 * @steps
 * 1. Validate the payment status is marked as 'paid'.
 * 2. Find the checkout record by ID.
 * 3. Update payment fields and timestamp.
 * 4. Return the updated checkout record.
 *
 * @param {Request} req - Payment update request with status and payment details.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the updated checkout response.
 */
export const payCheckout = asyncHandler(
  async (
    req: AuthenticatedRequest<{ id: string }, CheckoutResponse, { paymentStatus: PaymentStatus; paymentDetails: Record<string, unknown> }>,
    res: Response<CheckoutResponse>,
    next: NextFunction
  ) => {
    const { paymentStatus, paymentDetails } = req.body;
    const { id } = req.params;

    if (paymentStatus !== 'paid') {
      next(new AppError('Invalid payment status', 400));
      return;
    }

    const checkout = await Checkout.findById(id);

    if (!checkout) {
      next(new AppError('Checkout not found!', 404));
      return;
    }

    checkout.isPaid = true;
    checkout.paymentStatus = paymentStatus;
    checkout.paymentDetails = paymentDetails;
    checkout.paidAt = new Date();

    await checkout.save();

    res.status(200).json({
      status: 'success',
      message: 'Checkout paid successfully',
      checkout,
    });
  }
);

/**
 * @function finalizeCheckout
 * @description Converts a paid checkout into an order and clears the user's cart.
 *
 * @steps
 * 1. Fetch the checkout record and validate it exists and is paid.
 * 2. Check that it hasn't been finalized already.
 * 3. Create an Order document from the checkout data.
 * 4. Delete the user's cart to prevent duplicate ordering.
 * 5. Return the finalized order record.
 *
 * @param {Request} req - Finalize request targeting a checkout by ID.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the created order response.
 */
export const finalizeCheckout = asyncHandler(
  async (req: AuthenticatedRequest<{ id: string }, CheckoutResponse>, res: Response<CheckoutResponse>, next: NextFunction) => {
    const { id } = req.params;

    const checkout = await Checkout.findById(id);

    if (!checkout) {
      next(new AppError('Checkout not found!', 404));
      return;
    }

    if (!checkout.isPaid) {
      next(new AppError('Checkout not yet paid!', 400));
      return;
    }

    if (checkout.isFinalized) {
      next(new AppError('Checkout already finalized.', 400));
      return;
    }

    checkout.isFinalized = true;
    checkout.finalizedAt = new Date();
    await checkout.save();

    // Convert checkout items to order format with proper ObjectId handling
    const orderedItems: IOrderItem[] = checkout.checkoutItems.map((item) => ({
      productId: typeof item.productId === 'string' ? new mongoose.Types.ObjectId(item.productId) : item.productId,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));

    const order = await Order.create({
      user: checkout.user,
      orderedItems,
      shippingAddress: checkout.shippingAddress,
      paymentMethod: checkout.paymentMethod,
      totalPrice: checkout.totalPrice,
      isPaid: checkout.isPaid,
      paidAt: checkout.paidAt,
      paymentStatus: checkout.paymentStatus,
    });

    // Clear user cart after order creation
    await Cart.findOneAndDelete({ user: checkout.user });

    res.status(200).json({
      status: 'success',
      message: 'Order finalized successfully',
      checkout: order as any,
    });
  }
);
