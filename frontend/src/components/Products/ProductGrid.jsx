import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ProductGrid = ({ products }) => {

  return (
    <motion.div
      className="grid grid-cols-1 space-y-3 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
    >
      {products.map((product,index) => (
        <motion.div
          key={product._id}
           initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2*index }}
          viewport={{ once: true }}
          className="bg-white rounded-lg transition"
        >
          <Link to={`/product/${product._id}`} className="block group">
            
            {/* Image */}
            <div className="w-full h-80 overflow-hidden rounded-lg">
              <motion.img
                src={product.image[0].url}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
                whileHover={{ scale: 1.03 }} // slight zoom only
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            {/* Product Title */}
            <div className="mt-3 px-1">
              <h3 className="text-sm text-gray-800 font-medium group-hover:text-black transition-colors duration-200">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600">$ {product.price}</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProductGrid;
