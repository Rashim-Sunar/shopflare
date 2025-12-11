import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const GenderCollectionSection = () => {
  return (
    <section className="w-full py-14 px-6">
      <div className=" max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Female Collection */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay:0.1 }}
          viewport={{ once: true }}
          className="relative group overflow-hidden rounded-xl cursor-pointer"
        >
          <img
            src="/femaleSection.jpeg" // add image in /public folder
            alt="Women's Collection"
            className="w-full h-[390px] object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition duration-300"></div>

          {/* Text */}
          <div className="absolute left-6 bottom-6 text-white">
            <h2 className="text-2xl md:text-3xl font-bold">Women's Collection</h2>
            <Link
              to='#'
              className="inline-block mt-3 bg-white text-black px-5 py-2 rounded-md font-medium hover:bg-gray-200 transition"
            >
              Shop Now
            </Link>
          </div>
        </motion.div>

        {/* Male Collection */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
          viewport={{ once: true }}
          className="relative group overflow-hidden rounded-xl cursor-pointer"
        >
          <img
            src="/male.webp" // add image in /public folder
            alt="Men's Collection"
            className="w-full h-[390px] object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition duration-300"></div>

          {/* Text */}
          <div className="absolute left-6 bottom-6 text-white">
            <h2 className="text-2xl md:text-3xl font-bold">Men's Collection</h2>
            <Link
              href="/shop/men"
              className="inline-block mt-3 bg-white text-black px-5 py-2 rounded-md font-medium hover:bg-gray-200 transition"
            >
              Shop Now
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default GenderCollectionSection;
