import React from "react";
import { motion } from "framer-motion";
import { FaLeaf, FaShieldAlt, FaShippingFast, FaRegSmile } from "react-icons/fa";

const FeatureSection = () => {
  const features = [
    {
      id: 1,
      icon: <FaLeaf className="text-3xl text-green-600" />,
      title: "Eco-Friendly Fabric",
      desc: "Made with sustainable materials designed for comfort and longevity.",
    },
    {
      id: 2,
      icon: <FaShieldAlt className="text-3xl text-blue-600" />,
      title: "Durable & High Quality",
      desc: "Crafted to last with reinforced stitching and flexible performance.",
    },
    {
      id: 3,
      icon: <FaShippingFast className="text-3xl text-purple-600" />,
      title: "Fast Delivery",
      desc: "Get your items delivered quickly with our priority shipping options.",
    },
    {
      id: 4,
      icon: <FaRegSmile className="text-3xl text-yellow-600" />,
      title: "Comfort Guaranteed",
      desc: "Designed with your comfort in mind — wear it all day effortlessly.",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Why Choose Our Apparel?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white shadow-sm rounded-xl p-6 hover:shadow-md transition"
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default FeatureSection;
