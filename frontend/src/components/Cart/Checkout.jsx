import React, { useState } from "react";
import { motion } from "framer-motion";

const Checkout = () => {
  const email = "admin@example.com";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, ...formData });
  };

  return (
    <div className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col lg:flex-row gap-10"
        >

          {/* ================= LEFT: FORM ================= */}
          <form
            onSubmit={handleSubmit}
            className="w-full lg:w-2/3"
          >
            <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

            {/* Contact */}
            <div className="mb-8">
              <h2 className="text-sm font-medium mb-2">Contact Details</h2>
              <input
                value={email}
                disabled
                className="w-full rounded-md border bg-gray-100 px-4 py-3 text-sm cursor-not-allowed"
              />
            </div>

            {/* Delivery */}
            <div className="space-y-5">
              <h2 className="text-sm font-medium">Delivery</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input"
                />
                <input
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <input
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className="input"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className="input"
                />
                <input
                  name="postalCode"
                  placeholder="Postal code"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <input
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleChange}
                className="input"
              />

              <input
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ opacity: 0.95 }}
              className="mt-8 w-full rounded-md bg-black py-4 text-white font-medium"
            >
              Continue to Payment
            </motion.button>
          </form>

          {/* ================= RIGHT: SUMMARY ================= */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="w-full lg:w-1/3 bg-gray-50 rounded-xl p-6 h-fit"
          >
            <h2 className="text-lg font-semibold mb-5">Order Summary</h2>

            <div className="flex gap-4 border-b-2 border-t pt-8 border-gray-300 pb-4">
              <img
                src="https://picsum.photos/80/100?random=55"
                alt="Product"
                className="w-20 h-24 rounded-md object-cover"
              />

              <div className="flex-1 text-sm">
                <p className="font-semibold">
                  Classic Oxford Button-Down Shirt
                </p>
                <p className="text-gray-500">Size: M</p>
                <p className="text-gray-500">Color: Red</p>
              </div>

              <p className="font-medium">€39.99</p>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Subtotal</span>
                <span>€39.99</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Shipping</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-300 font-semibold">
                <span>Total</span>
                <span>€39.99</span>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* shared input style */}
      <style>
        {`
          .input {
            width: 100%;
            border: 1px solid #e5e7eb;
            border-radius: 0.375rem;
            padding: 0.75rem 1rem;
            font-size: 0.875rem;
            outline: none;
          }
          .input:focus {
            border-color: black;
          }
        `}
      </style>
    </div>
  );
};

export default Checkout;
