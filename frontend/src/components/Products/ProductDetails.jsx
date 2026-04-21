import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaMinus, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import ProductGrid from "./ProductGrid";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchProductDetails,
  fetchSimilarProducts
} from "../../redux/slices/productSlice";
import { getFallbackImage, getSafeImageUrl } from "../../utils/imageUrl";

import { addToCart, fetchCart } from "../../redux/slices/cartSlice";

const ProductDetails = ({ productId }) => {

  const { id: paramId } = useParams();
  const productFetchId = productId || paramId;

  const dispatch = useDispatch();
  const {
    selectedProduct,
    similarProducts,
    loading,
    error,
  } = useSelector((state) => state.products);

  const { user, guestId } = useSelector((state) => state.auth);

  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [ isDisabled, setIsDisabled ] = useState(false);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    dispatch(fetchProductDetails(productFetchId));
    dispatch(fetchSimilarProducts({ id: productFetchId }));
  }, [dispatch, productFetchId]);

  /* ---------------- SYNC IMAGE ---------------- */
  useEffect(() => {
    if (selectedProduct?.images?.length) {
      setSelectedImage(selectedProduct.images[0]);
    }
  }, [selectedProduct]);

  const handleAddTocart = () => {
    setIsDisabled(true);
    // Validate color
    if (!selectedColor) {
      toast.error("Please select a color.");
      setIsDisabled(false);
      return;
    }
    // Validate size
    if (!selectedSize) {
      toast.error("Please select your product size.");
      setIsDisabled(false);
      return;
    }

    dispatch(addToCart({
      productId: productFetchId,
      userId: user?._id,
      guestId,
      quantity,
      size: selectedSize,
      color: selectedColor,
    })).then(() => {
      toast.success("Product added to cart successfully.", {
        duration: 1000,
      })
    }).finally(() => {
      setIsDisabled(false);
      dispatch(fetchCart({userId: user?._id, guestId}))
      console.log("Fetching cart");
    })
  };

  /* ---------------- LOADING ---------------- */
  if (loading.details) {
    return (
      <p className="text-center py-20 text-gray-500">
        Loading product...
      </p>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error) {
    return (
      <p className="text-center py-20 text-red-500">
        {error}
      </p>
    );
  }

  if (!selectedProduct) return null;

  /* ========================================================= */

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* ---------- LEFT SECTION: IMAGES ---------- */}
        <div className="flex flex-col md:flex-row gap-4">

          {/* Thumbnails (Left on desktop, bottom on mobile) */}
          <div className="flex md:flex-col gap-3 order-2 md:order-1 justify-center">
            {selectedProduct.images?.map((img, index) => (
              <motion.img
                key={index}
                src={getSafeImageUrl(img.url)}
                alt={img.altText}
                className={`w-20 h-20 object-cover rounded-md cursor-pointer border 
                  ${
                    selectedImage?.url === img.url
                      ? "border-2 border-black"
                      : "border-gray-300"
                  }`}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedImage(img)}
                onError={(e) => {
                  e.currentTarget.src = getFallbackImage();
                }}
              />
            ))}
          </div>

          {/* Main Image */}
          {selectedImage && (
            <div className="w-full md:w-[450px] flex-shrink-0 order-1 md:order-2">
              <motion.img
                src={getSafeImageUrl(selectedImage.url)}
                alt={selectedImage.altText || selectedProduct.name}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="w-full h-[600px] object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = getFallbackImage();
                }}
              />
            </div>
          )}

        </div>

        {/* ---------- RIGHT SECTION: DETAILS ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay:0.2 }}
          viewport={{ once: true }}
          className="space-y-2"
        >
          <h2 className="text-3xl font-semibold">Slim-Fit Easy-Iron Shirt</h2>

          <p className="text-lg font-medium text-gray-700">$ 34.99</p>

          <p className="text-gray-600 leading-relaxed text-sm">
            A slim-fit, easy-iron shirt in woven cotton fabric with a fitted silhouette.
            Long sleeves, turn-down collar, classic button placket, and rounded cuffs.
          </p>

          {/* ---- Color ---- */}
          <div>
            <p className="font-medium mb-1 text-gray-700">Color:</p>
            <div className="flex gap-3">
              {selectedProduct.colors.map((color) => (
                <div
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-7 h-7 rounded-full border cursor-pointer ${
                    selectedColor === color ? "border-black" : "border-gray-400"
                  }`}
                  style={{ backgroundColor: color }}
                ></div>
              ))}
            </div>
          </div>

          {/* ---- Size ---- */}
          <div>
            <p className="font-medium mb-1 text-gray-700">Size:</p>
            <div className="flex gap-3">
              {selectedProduct.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`border px-4 py-2 rounded-md cursor-pointer ${
                    selectedSize === size
                      ? "bg-black text-white"
                      : "bg-white text-black border-gray-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* ---- Quantity ---- */}
          <div className="mt-4 mb-4">
            <p className="font-medium mb-1 text-gray-700">Quantity:</p>
            <div className="flex items-center gap-4 mt-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 border rounded cursor-pointer"
              >
                <FaMinus />
              </button>

              <span className="text-lg font-medium">{quantity}</span>

              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 border rounded cursor-pointer"
              >
                <FaPlus />
              </button>
            </div>
          </div>

          {/* ---- Add to Cart Button ---- */}
          <button
            disabled={isDisabled}
            className={`w-full cursor-pointer bg-black mt-3 text-white py-1 rounded-md text-lg font-semibold hover:bg-gray-900 transition ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
            onClick={handleAddTocart}
          >
            { isDisabled ? "Adding to Cart" : "ADD TO CART" }
          </button>

          {/* Characteristics */}
          <div className="mt-5">
            <h3 className="font-semibold mb-2 text-lg">Characteristics:</h3>

            <div className="grid grid-cols-2 gap-y-2 text-gray-700">
              <p className="font-medium">Brand:</p>
              <p>{selectedProduct.brand}</p>

              <p className="font-medium">Material:</p>
              <p>{selectedProduct.material}</p>
            </div>
          </div>

        </motion.div>
      </div>

      <div className="mt-20">
        <h2 className="text-4xl font-bold text-center">You May Also Like</h2>
        <ProductGrid products={similarProducts}/>
      </div>
    </section>
  );
};

export default ProductDetails;
