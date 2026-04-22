import React, { useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchAllOrders,
  updateOrderStatus,
  deleteOrder,
  clearAdminOrderError,
} from "../../redux/slices/adminOrderSlice";

/* ---------------- MOTION VARIANTS ---------------- */

const pageVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const rowVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

/* ---------------- COMPONENT ---------------- */

const OrderManagement = () => {

  const dispatch = useDispatch();

  const { orders, loading, error } = useSelector(
    (state) => state.adminOrders
  );

  // Fetch orders on mount
  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAdminOrderError());
    }
  }, [error, dispatch]);


  /* ---------------- HANDLERS ---------------- */

  const updateStatus = async (orderId, newStatus) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark this order as ${newStatus}?`
    );

    if (!confirmed) return;

    try {
      await dispatch(
        updateOrderStatus({
          id: orderId,
          status: newStatus,
        })
      ).unwrap();

      toast.success(`Order marked as ${newStatus}`);
    } catch (err) {
      toast.error(err.message || "Failed to update order");
    }
  };

  const handleDelete = async (orderId, orderStatus) => {
    if (orderStatus === "Delivered") {
      toast.error("Delivered orders cannot be deleted");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmed) return;

    try {
      await dispatch(deleteOrder(orderId)).unwrap();
      toast.success("Order deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete order");
    }
  };

  {loading.fetch && (
    <div className="text-center text-gray-500 py-10">
      Loading orders...
    </div>
  )}

  return (
    <motion.div
      variants={pageVariant}
      initial="hidden"
      animate="visible"
      className="space-y-10 max-w-full overflow-x-hidden"
    >
      {/* PAGE TITLE */}
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
        Order Management
      </h1>

      {/* ORDERS */}
      <section className="bg-white rounded-xl border border-gray-200">
        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 text-left font-medium">
                  ORDER ID
                </th>
                <th className="px-6 py-3 text-left font-medium">
                  CUSTOMER
                </th>
                <th className="px-6 py-3 text-left font-medium">
                  TOTAL PRICE
                </th>
                <th className="px-6 py-3 text-left font-medium">
                  STATUS
                </th>
                <th className="px-6 py-3 text-left font-medium">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order, i) => (
                  <motion.tr
                    key={order?._id}
                    variants={rowVariant}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: i * 0.05 }}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      #{order?._id}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {order.user?.name}
                    </td>
                    <td className="px-6 py-4 text-gray-800">
                      ${order.totalPrice}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(order?._id, e.target.value)
                        }
                        className="rounded-md border border-gray-300 px-3 py-1 text-sm"
                      >
                        <option>Processing</option>
                        <option>Shipped</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      {order.status !== "Delivered" && (
                        <button
                          disabled = {loading.update}
                          onClick={() =>
                            updateStatus(order?._id, "Delivered")
                          }

                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition"
                        >
                          {loading.update ? "Updating..." : "Mark as Delivered"}
                        </button>
                      )}

                       <button
                        disabled={loading.delete}
                        onClick={() => handleDelete(order._id, order.status)}
                        className={`px-4 py-2 rounded-md text-sm transition
                          ${loading.delete
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 text-white"}
                        `}
                      >
                        {loading.delete ? "Deleting..." : "Delete"}
                      </button>

                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden p-4 space-y-4">
          {orders.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No orders found
            </div>
          ) : (
            orders.map((order, i) => (
              <motion.div
                key={order?._id}
                variants={rowVariant}
                initial="hidden"
                animate="visible"
                transition={{ delay: i * 0.05 }}
                className="rounded-lg border border-gray-200 p-4 space-y-3"
              >
                <p className="font-medium text-gray-800 break-all">
                  #{order?._id}
                </p>
                <p className="text-sm text-gray-600">
                  Customer: {order.user?.name}
                </p>
                <p className="text-sm text-gray-800">
                  Total: ${order.totalPrice}
                </p>

                <select
                  value={order.status}
                  onChange={(e) =>
                    updateStatus(order?._id, e.target.value)
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option>Processing</option>
                  <option>Shipping</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>

                {order.status !== "Delivered" && (
                  <button
                    disabled = {loading.update}
                    onClick={() =>
                      updateStatus(order?._id, "Delivered")
                    }
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-sm transition"
                  >
                    { loading.update ? "Updating..." : "Mark as Delivered"}
                  </button>
                )}

                <button
                  disabled={loading.delete}
                  onClick={() => handleDelete(order._id, order.status)}
                  className={`w-full py-2 rounded-md text-sm transition
                    ${loading.delete
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"}
                  `}
                >
                  {loading.delete ? "Deleting..." : "Delete Order"}
                </button>
              </motion.div>
            ))
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default OrderManagement;
