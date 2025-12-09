import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">

      {/* Background Image */}
      <img
        src="/hero.jpg" // place your downloaded image in /public folder
        alt="Hero Banner"
        className="w-full h-full object-cover"
      />

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/20 md:bg-black/10"></div>

      {/* Text + Button */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="absolute left-5 md:left-20 lg:left-130 top-1/2 -translate-y-1/2 text-white max-w-lg"
      >
        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
          Discover Your Style, Shop the Latest Trends
        </h1>

        <p className="text-sm md:text-lg mb-6 text-gray-200">
          Premium quality apparel, accessories, and more — designed to upgrade your everyday lifestyle.
        </p>

        <Link
          to='#'
          className="inline-block bg-white text-orange-500 font-semibold px-6 py-3 rounded-md hover:bg-gray-200 transition-all duration-300"
        >
          Shop Now
        </Link>
      </motion.div>
    </section>
  );
};

export default Hero;
