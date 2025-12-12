import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const FeatureCollection = () => {
  return (
    <section className="max-w-7xl mt-6 mx-auto px-6 py-16">
      <div
        className="grid grid-cols-1 md:grid-cols-2 bg-teal-50 rounded-3xl overflow-hidden shadow-sm"
      >
        {/* TEXT SECTION */}
        <motion.div
            initial={{ opacity: 0, y: 70, x: -40 }}
            whileInView={{ opacity: 1, y: 0, x:0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            viewport={{ once: true }}
        className="p-10 flex flex-col justify-center order-2 md:order-1">
          <motion.h4
            initial={{ opacity: 0, y: 60}}
            animate={{ opacity: 1, y: 0}}
            transition={{ delay: 0.2, duration: 1.5 }}
            className="text-slate-700 font-medium mb-3"
          >
            Comfort · Quality · Style
          </motion.h4>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-4xl md:text-5xl font-bold leading-tight mb-4"
          >
            Premium apparel designed for your lifestyle.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-gray-700 text-sm md:text-base mb-6"
          >
            Discover premium-quality, comfortable, and modern apparel built for movement, confidence, and everyday performance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-4"
          >
            <Link
              to="/collections/all"
              className="bg-black text-white px-6 py-3 rounded-md text-sm md:text-base font-medium hover:bg-gray-800 transition"
            >
              Shop Now
            </Link>
          </motion.div>
        </motion.div>

        {/* IMAGE SECTION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.60 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="h-full w-full order-1 md:order-2"
        >
          <img
            src="https://picsum.photos/900/900?random=35"
            alt="Featured Collection"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureCollection;
