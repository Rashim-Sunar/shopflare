import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchAdminProductById,
  updateAdminProduct,
  clearAdminSelectedProduct,
} from "../../redux/slices/adminProductSlice";

/* ---------------- MOTION VARIANTS ---------------- */

const pageVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const EditProductPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(null);

  const { selectedProduct: product, loading } = useSelector(
    (state) => state.adminProducts
  );

   /* FETCH PRODUCT */
  useEffect(() => {
    dispatch(fetchAdminProductById(id));

    return () => dispatch(clearAdminSelectedProduct());
  }, [dispatch, id]);

  /* SET FORM DATA */
  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        sizes: product.sizes || [],
        colors: product.colors || [],
        images: product.images || [],
      });
    }
  }, [product]);


  if (loading || !formData) {
    return <p className="text-center mt-10">Loading product...</p>;
  }

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (key, value) => {
    setFormData({
      ...formData,
      [key]: value.split(",").map((v) => v.trim()),
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    const newImages = files.map((file) => ({
      url: URL.createObjectURL(file),
    }));

    setFormData({
      ...formData,
      images: [...formData.images, ...newImages],
    });
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(
      updateAdminProduct({
        productId: id,
        productData: formData,
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Product updated successfully");
        navigate("/admin/products");
      })
      .catch((err) => toast.error(err));
  };

  return (
    <motion.div
      variants={pageVariant}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-8"
    >
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
        Edit Product
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-6"
      >
        <Input
          label="Product Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />

        <TextArea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />

        <div className="grid sm:grid-cols-2 gap-6">
          <Input
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
          />
          <Input
            label="Count in Stock"
            name="countInStock"
            type="number"
            value={formData.countInStock}
            onChange={handleChange}
          />
        </div>

        <Input
          label="SKU"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
        />

        <Input
          label="Sizes (comma-separated)"
          value={formData.sizes.join(", ")}
          onChange={(e) =>
            handleArrayChange("sizes", e.target.value)
          }
        />

        <Input
          label="Colors (comma-separated)"
          value={formData.colors.join(", ")}
          onChange={(e) =>
            handleArrayChange("colors", e.target.value)
          }
        />

        {/* IMAGE UPLOAD */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Upload Images
          </label>

          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition"
          >
            Choose Images
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* IMAGE PREVIEW */}
          <div className="flex flex-wrap gap-4 mt-4">
            {formData.images.map((img, index) => (
              <div
                key={index}
                className="relative w-24 h-24 rounded-md overflow-hidden border"
              >
                <img
                  src={img.url}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black"
                >
                  <IoClose size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md text-sm font-medium transition"
        >
          Update Product
        </button>
      </form>
    </motion.div>
  );
};

/* ---------------- REUSABLE INPUTS ---------------- */

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm text-gray-600 mb-1">
      {label}
    </label>
    <input
      {...props}
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const TextArea = ({ label, ...props }) => (
  <div>
    <label className="block text-sm text-gray-600 mb-1">
      {label}
    </label>
    <textarea
      rows={5}
      {...props}
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default EditProductPage;
