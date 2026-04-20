import type { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import type { IOrder } from '../types/order';
import type { AuthenticatedRequest } from '../types/http';

/**
 * @fileoverview Order controller that powers order history and order lookup workflows.
 */

interface OrdersResponse {
  status: 'success';
  orders: IOrder[];
}

interface OrderResponse {
  status: 'success';
  order: IOrder | null;
}

/**
 * @function getMyOrders
 * @description Retrieves the authenticated user's order history sorted from newest to oldest.
 *
 * @steps
 * 1. Confirm the request has an authenticated user context.
 * 2. Query the orders collection by user id and sort by creation time.
 * 3. Return the matching records as a stable JSON response.
 *
 * @param {Request} req - The authenticated request.
 * @param {Response<OrdersResponse>} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the order history response.
 */
export const getMyOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response<OrdersResponse>, next: NextFunction) => {
  if (!req.user) {
    next(new AppError('User not authenticated', 401));
    return;
  }

  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    orders,
  });
});

/**
 * @function getOrderById
 * @description Retrieves a single order and populates the user projection for display purposes.
 *
 * @steps
 * 1. Validate the route parameter so invalid ObjectIds are rejected early.
 * 2. Load the order and populate the public user fields needed by the client.
 * 3. Return a 404 if the order is missing, otherwise return the populated document.
 *
 * @param {Request} req - The incoming order lookup request.
 * @param {Response<OrderResponse>} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the order lookup response.
 */
export const getOrderById = asyncHandler(async (req: AuthenticatedRequest<{ id: string }>, res: Response<OrderResponse>, next: NextFunction) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    next(new AppError('Invalid order id', 400));
    return;
  }

  const order = await Order.findById(id).populate('user', 'name email');

  if (!order) {
    next(new AppError('Order not found!', 404));
    return;
  }

  res.status(200).json({
    status: 'success',
    order,
  });
});