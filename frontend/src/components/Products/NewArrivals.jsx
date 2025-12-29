import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import axios from "axios";

const NewArrivals = () => {
  // Reference to control react-slick slider programmatically
  const sliderRef = useRef(null);

  // State to store fetched new arrival products
  const [newArrivals, setNewArrivals] = useState([]);

  // Fetch new arrivals from backend when component mounts
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/new-arrivals`
        );

        /**
         * Backend may return:
         * { newArrivals: [...] }
         * OR
         * { products: [...] }
         * This fallback ensures safety
         */
        setNewArrivals(data.newArrivals || data.products || []);
      } catch (error) {
        console.error(
          "Error fetching new Arrivals:",
          error.response?.data || error.message
        );
      }
    };

    fetchNewArrivals();
  }, []);

  // Slider configuration
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false, // Using custom arrows instead
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section className="w-full px-6 mt-10">

      {/* ---------- HEADER SECTION ---------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold">Explore New Arrivals</h2>
          <p className="text-gray-600 mt-2">
            Discover the latest products curated just for you.
          </p>
        </div>

        {/* ---------- SLIDER NAVIGATION BUTTONS ---------- */}
        <div className="flex gap-3 justify-end mt-4 px-4">
          <button
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
            onClick={() => sliderRef.current?.slickPrev()}
          >
            <FaArrowLeft className="text-gray-700" />
          </button>

          <button
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
            onClick={() => sliderRef.current?.slickNext()}
          >
            <FaArrowRight className="text-gray-700" />
          </button>
        </div>
      </motion.div>

      {/* ---------- SLIDER / EMPTY STATE ---------- */}
      {newArrivals.length === 0 ? (
        // Empty state when no products are available
        <p className="text-center text-gray-500 mt-12">
          No new arrivals available at the moment.
        </p>
      ) : (
        <Slider ref={sliderRef} {...settings} className="mt-6">
          {newArrivals.map((product) => (
            <motion.div
              key={product._id} // MongoDB uses _id
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="px-2"
            >
              {/* ---------- PRODUCT CARD ---------- */}
              <div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">

                {/* Product Image (Safe optional chaining) */}
                <img
                  src={product.images?.[0]?.url || "/placeholder.png"}
                  alt={product.images?.[0]?.altText || product.name}
                  className="w-full h-80 object-cover transition-transform duration-500 hover:scale-105"
                />

                {/* Blurred overlay for product info */}
                <div className="absolute bottom-0 left-0 w-full bg-black/20 backdrop-blur-md text-white px-4 py-3">
                  <h3 className="text-lg font-semibold leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-sm mt-1">
                    ₹ {product.price}
                  </p>
                </div>

              </div>
            </motion.div>
          ))}
        </Slider>
      )}
    </section>
  );
};

export default NewArrivals;
