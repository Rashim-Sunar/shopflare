import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

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
  const [orders, setOrders] = useState([
    {
      orderId: "67540ced3376121b361a0ed0",
      customer: { name: "Admin User" },
      totalPrice: 199.96,
      status: "Delivered",
    },
    {
      orderId: "67540d3ca67b4a70e434e092",
      customer: { name: "Admin User" },
      totalPrice: 40,
      status: "Processing",
    },
    {
      orderId: "675bf2c6ca77bd83eefd7a18",
      customer: { name: "Admin User" },
      totalPrice: 39.99,
      status: "Processing",
    },
    {
      orderId: "675c24b09b88827304bd5cc1",
      customer: { name: "Admin User" },
      totalPrice: 39.99,
      status: "Processing",
    },
  ]);

  /* ---------------- HANDLERS ---------------- */

  const updateStatus = (orderId, newStatus) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark this order as ${newStatus}?`
    );

    if (!confirmed) {
      toast("Action cancelled");
      return;
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.orderId === orderId
          ? { ...order, status: newStatus }
          : order
      )
    );

    toast.success(`Order marked as ${newStatus}`);
  };

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
                    key={order.orderId}
                    variants={rowVariant}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: i * 0.05 }}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      #{order.orderId}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {order.customer.name}
                    </td>
                    <td className="px-6 py-4 text-gray-800">
                      ${order.totalPrice}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(order.orderId, e.target.value)
                        }
                        className="rounded-md border border-gray-300 px-3 py-1 text-sm"
                      >
                        <option>Processing</option>
                        <option>Shipping</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {order.status !== "Delivered" && (
                        <button
                          onClick={() =>
                            updateStatus(order.orderId, "Delivered")
                          }
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition"
                        >
                          Mark as Delivered
                        </button>
                      )}
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
                key={order.orderId}
                variants={rowVariant}
                initial="hidden"
                animate="visible"
                transition={{ delay: i * 0.05 }}
                className="rounded-lg border border-gray-200 p-4 space-y-3"
              >
                <p className="font-medium text-gray-800 break-all">
                  #{order.orderId}
                </p>
                <p className="text-sm text-gray-600">
                  Customer: {order.customer.name}
                </p>
                <p className="text-sm text-gray-800">
                  Total: ${order.totalPrice}
                </p>

                <select
                  value={order.status}
                  onChange={(e) =>
                    updateStatus(order.orderId, e.target.value)
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
                    onClick={() =>
                      updateStatus(order.orderId, "Delivered")
                    }
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-sm transition"
                  >
                    Mark as Delivered
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default OrderManagement;
