import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import { fetchOrderDetails, clearOrderDetails } from "../redux/slices/orderSlice";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { orderDetails, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderDetails(id));

    return () => {
      dispatch(clearOrderDetails());
    };
  }, [dispatch, id]);

  if (loading.details || !orderDetails) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="animate-pulse text-gray-500">Loading order...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-sm text-gray-500">
            Order ID: {orderDetails._id}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(orderDetails.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-2">
          <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
            {orderDetails.isPaid ? "Paid" : "Unpaid"}
          </span>
          {!orderDetails.isDelivered && (
              <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                Processing
              </span>
            )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold mb-3">Payment Info</h2>
          <p className="text-sm text-gray-600">
            Payment Method:{" "}
            <span className="font-medium">{orderDetails.paymentMethod}</span>
          </p>
          <p className="text-sm text-gray-600">
            Status:{" "}
            <span className="font-medium text-green-600">
              {orderDetails.paymentStatus}
            </span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold mb-3">Shipping Info</h2>
          <p className="text-sm text-gray-600">
            Shipping Method:{" "}
            <span className="font-medium">
              {orderDetails.shippingMethod || "Bike"}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Address:{" "}
            <span className="font-medium">
              {orderDetails?.shippingAddress?.city},{" "}
              {orderDetails?.shippingAddress?.country}
            </span>
          </p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-right">Unit Price</th>
              <th className="p-4 text-center">Qty</th>
              <th className="p-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails?.orderedItems?.map((item) => (
              <tr
                key={item.productId}
                className="border-t border-gray-300 hover:bg-gray-50 transition"
              >
                <td className="p-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                </td>
                <td className="p-4 font-medium">{item.name}</td>
                <td className="p-4 text-right">${item.price}</td>
                <td className="p-4 text-center">{item.quantity}</td>
                <td className="p-4 text-right font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <button
          onClick={() => navigate("/my-orders")}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to My Orders
        </button>
      </div>
    </motion.div>
  );
};

export default OrderDetailsPage;
