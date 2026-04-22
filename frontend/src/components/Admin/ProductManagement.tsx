import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';

import {
  fetchAdminProducts,
  deleteAdminProduct,
  clearAdminProductError,
} from "../../redux/slices/adminProductSlice";

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
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { products, loading, error } = useSelector(
    (state) => state.adminProducts
  );

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearAdminProductError());
    }
  }, [error, dispatch]);


  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    dispatch(deleteAdminProduct(id));
  };

  const handleEdit = (id) => {
    navigate(`/admin/products/${id}/edit`);
  };

  if (loading) {
    return <p className="text-center mt-10">Loading products...</p>;
  }

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
                  key={product._id}
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
                      onClick={() => handleEdit(product._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
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
              key={product._id}
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
                  onClick={() => handleEdit(product._id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
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
