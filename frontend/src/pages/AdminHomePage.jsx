import React from "react";
import { motion } from "framer-motion";

const orders = [
  {
    id: "67540ced3376121b361a0ed0",
    user: "Admin User",
    totalPrice: 199.96,
    status: "Processing",
  },
  {
    id: "67540d3ca67b4a70e434e092",
    user: "Admin User",
    totalPrice: 40,
    status: "Processing",
  },
  {
    id: "675bf2c6ca77bd83eefd7a18",
    user: "Admin User",
    totalPrice: 39.99,
    status: "Processing",
  },
  {
    id: "675c24b09b88827304bd5cc1",
    user: "Admin User",
    totalPrice: 39.99,
    status: "Processing",
  },
];

/* ---------------- FRAMER MOTION VARIANTS ---------------- */

const pageVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const statsContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const statItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const AdminHomePage = () => {
  const revenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <motion.div
      variants={pageVariant}
      initial="hidden"
      animate="visible"
      className="space-y-10 max-w-full overflow-x-hidden"
    >
      {/* PAGE TITLE */}
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
        Admin Dashboard
      </h1>

      {/* STATS */}
      <motion.div
        variants={statsContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <StatCard title="Revenue" value={`$${revenue.toFixed(2)}`} />
        <StatCard title="Total Orders" value={orders.length} />
        <StatCard title="Total Products" value={40} />
      </motion.div>

      {/* RECENT ORDERS TITLE */}
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
        Recent Orders
      </h2>

      {/* RECENT ORDERS */}
      <section className="bg-white rounded-xl border border-gray-200">
        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 text-left font-medium">ORDER ID</th>
                <th className="px-6 py-3 text-left font-medium">USER</th>
                <th className="px-6 py-3 text-left font-medium">TOTAL</th>
                <th className="px-6 py-3 text-left font-medium">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {order.user}
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    ${order.totalPrice}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-4 p-3">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-gray-200 p-4 space-y-2 min-w-0"
            >
              <p className="text-sm font-medium text-gray-800 break-all">
                {order.id}
              </p>
              <p className="text-sm text-gray-600">
                User: {order.user}
              </p>
              <p className="text-sm text-gray-800">
                Total: ${order.totalPrice}
              </p>
              <StatusBadge status={order.status} />
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

/* ---------------- SMALL REUSABLE COMPONENTS ---------------- */

const StatCard = ({ title, value }) => (
  <motion.div
    variants={statItem}
    className="w-full bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition"
  >
    <p className="text-sm text-gray-500">{title}</p>
    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-2">
      {value}
    </h3>
  </motion.div>
);

const StatusBadge = ({ status }) => (
  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
    {status}
  </span>
);

export default AdminHomePage;
