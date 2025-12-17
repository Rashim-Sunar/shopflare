import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "Classic Oxford Button-Down Shirt",
    description:
      "This classic Oxford shirt is tailored for a polished yet casual look. Crafted from high-quality cotton, it features a button-down collar and a comfortable, slightly relaxed fit.",
    price: 39.99,
    countInStock: 20,
    sku: "OX-SH-001",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Red", "Blue", "Yellow"],
    images: [
      { url: "https://picsum.photos/200/200?random=1" },
      { url: "https://picsum.photos/200/200?random=2" },
    ],
  });

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (key, value) => {
    setProduct({
      ...product,
      [key]: value.split(",").map((v) => v.trim()),
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    const newImages = files.map((file) => ({
      url: URL.createObjectURL(file),
    }));

    setProduct({
      ...product,
      images: [...product.images, ...newImages],
    });
  };

  const removeImage = (index) => {
    setProduct({
      ...product,
      images: product.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const confirmed = window.confirm("Do you really want to update the product details?");
    if(!confirmed){
        toast("Update cancelled.");
        return;
    }

    toast.success("Product Updated Successfully.");
    navigate("/admin/products");
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
          value={product.name}
          onChange={handleChange}
        />

        <TextArea
          label="Description"
          name="description"
          value={product.description}
          onChange={handleChange}
        />

        <div className="grid sm:grid-cols-2 gap-6">
          <Input
            label="Price"
            name="price"
            type="number"
            value={product.price}
            onChange={handleChange}
          />
          <Input
            label="Count in Stock"
            name="countInStock"
            type="number"
            value={product.countInStock}
            onChange={handleChange}
          />
        </div>

        <Input
          label="SKU"
          name="sku"
          value={product.sku}
          onChange={handleChange}
        />

        <Input
          label="Sizes (comma-separated)"
          value={product.sizes.join(", ")}
          onChange={(e) =>
            handleArrayChange("sizes", e.target.value)
          }
        />

        <Input
          label="Colors (comma-separated)"
          value={product.colors.join(", ")}
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
            {product.images.map((img, index) => (
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
