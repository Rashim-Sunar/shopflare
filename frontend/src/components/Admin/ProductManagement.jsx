import React, { useState } from "react";
import { motion } from "framer-motion";

/* ---------------- MOTION VARIANTS ---------------- */

const pageVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const listItemVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

/* ---------------- COMPONENT ---------------- */

const ProductManagement = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Blue Wool Jacket",
      price: 199.99,
      sku: "BW005",
    },
    {
      id: 2,
      name: "Classic Sneakers",
      price: 89.5,
      sku: "CS102",
    },
    {
      id: 3,
      name: "Blue Wool Jacket",
      price: 199.99,
      sku: "BW005",
    },
    {
      id: 4,
      name: "Classic Sneakers",
      price: 89.5,
      sku: "CS102",
    },
    {
      id: 5,
      name: "Blue Wool Jacket",
      price: 199.99,
      sku: "BW005",
    },
    {
      id: 6,
      name: "Classic Sneakers",
      price: 89.5,
      sku: "CS102",
    },
  ]);

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setProducts(products.filter((p) => p.id !== id));
  };

  const handleEdit = (id) => {
    // Placeholder for future edit modal / page
    alert(`Edit product with ID: ${id}`);
  };

  return (
    <motion.div
      variants={pageVariant}
      initial="hidden"
      animate="visible"
      className="space-y-10 max-w-full overflow-x-hidden mt-4 sm:mt-0"
    >
      {/* PAGE TITLE */}
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
        Product Management
      </h1>

      {/* PRODUCTS LIST */}
      <section className="bg-white rounded-xl border border-gray-200">
        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 text-left font-medium">NAME</th>
                <th className="px-6 py-3 text-left font-medium">PRICE</th>
                <th className="px-6 py-3 text-left font-medium">SKU</th>
                <th className="px-6 py-3 text-left font-medium">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, i) => (
                <motion.tr
                  key={product.id}
                  variants={listItemVariant}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: i * 0.05 }}
                  className="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button
                      onClick={() => handleEdit(product.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-sm transition"
                    >
                      Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-4 p-4">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              variants={listItemVariant}
              initial="hidden"
              animate="visible"
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-gray-200 p-4 space-y-3"
            >
              <p className="font-medium text-gray-800">
                {product.name}
              </p>
              <p className="text-sm text-gray-600">
                Price: ${product.price.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">
                SKU: {product.sku}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(product.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-sm transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default ProductManagement;
