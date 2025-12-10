import React, { useRef } from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const NewArrivals = () => {
  const sliderRef = useRef(null);

  // Sample product data (8 items)
  const products = [
    { id: 1, name: "Casual Shirt", price: "$29", image: { url: "https://picsum.photos/300/300?random=1", alt: "Casual Shirt" }},
    { id: 2, name: "Denim Jacket", price: "$59", image: { url: "https://picsum.photos/300/300?random=2", alt: "Denim Jacket" }},
    { id: 3, name: "Sneakers", price: "$49", image: { url: "https://picsum.photos/300/300?random=3", alt: "Sneakers" }},
    { id: 4, name: "Leather Wallet", price: "$19", image: { url: "https://picsum.photos/300/300?random=4", alt: "Leather Wallet" }},
    { id: 5, name: "Summer Dress", price: "$39", image: { url: "https://picsum.photos/300/300?random=5", alt: "Summer Dress" }},
    { id: 6, name: "Premium Hoodie", price: "$45", image: { url: "https://picsum.photos/300/300?random=6", alt: "Premium Hoodie" }},
    { id: 7, name: "Sunglasses", price: "$25", image: { url: "https://picsum.photos/300/300?random=7", alt: "Sunglasses" }},
    { id: 8, name: "Classic Watch", price: "$99", image: { url: "https://picsum.photos/300/300?random=8", alt: "Classic Watch" }},
  ];

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false, // Custom arrows instead
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 }},
      { breakpoint: 768, settings: { slidesToShow: 2 }},
      { breakpoint: 480, settings: { slidesToShow: 1 }},
    ]
  };

  return (
    <section className="w-full px-6 mt-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="flex flex-col items-center justify-between">
          <h2 className="text-3xl font-bold">Explore New Arrivals</h2>
          <p className="text-gray-600 mt-2">
            Explore the latest trends handpicked just for you.
          </p>
        </div>

        {/* Scroll Buttons */}
        <div className="flex gap-3 justify-end mb-3 px-4">
          <button
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
            onClick={() => sliderRef.current.slickPrev()}
          >
            <FaArrowLeft className="text-gray-700" />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
            onClick={() => sliderRef.current.slickNext()}
          >
            <FaArrowRight className="text-gray-700" />
          </button>
        </div>
      </motion.div>

      {/* Slider */}
      <Slider ref={sliderRef} {...settings}>
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="px-2"
          >
            <div className="relative rounded-lg overflow-hidden shadow hover:shadow-lg transition-group">

                {/* Product Image */}
                <img
                    src={product.image.url}
                    alt={product.image.alt}
                    className="w-full h-85 object-cover transition-transform duration-500 hover:scale-105"
                />

                {/* Blurred Text Overlay */}
                <div className="absolute bottom-0 left-0 w-full bg-white/10 backdrop-blur-sm text-white px-4 py-3">
                    <h3 className="text-lg font-semibold leading-tight">{product.name}</h3>
                    <p className="text-sm opacity-90">{product.price}</p>
                </div>

            </div>

          </motion.div>
        ))}
      </Slider>

    </section>
  );
};

export default NewArrivals;
