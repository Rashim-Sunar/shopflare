import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayPalButton from "./PayPalButton";
import { useDispatch, useSelector } from "react-redux";
import { getAuthHeaders } from "../../utils/authToken";
import { getFallbackImage, getSafeImageUrl } from "../../utils/imageUrl";

import { createCheckout } from "../../redux/slices/checkoutSlice";

const Checkout = () => {
  // Hardcoded email 
  const { user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  // Form data state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  // Simulated checkout id (set after form submit)
  const [checkoutId, setCheckoutId] = useState(null);

  // IMPORTANT: this state prevents PayPal from re-rendering after success
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle checkout form submit
  const handleSubmit = async(e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.firstName ||
      !formData.address ||
      !formData.city ||
      !formData.phone
    ) {
      alert("Please fill all required fields");
      return;
    }

    const checkoutPayload = {
      checkoutItems: cart.products.map((p) => ({
        productId: p.productId,
        name: p.name,
        image: p.image,
        price: p.price,
        quantity: p.quantity,
      })),
      shippingAddress: {
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
      },
      paymentMethod: "PayPal",
      totalPrice: cart.totalPrice,
    };

    const res = await dispatch(createCheckout(checkoutPayload)).unwrap();

    setCheckoutId(res.checkout._id);
    // console.log(res);
  };

  // Handle PayPal success
  const handlePaymentSuccess = async (details) => {
    try {
      setPaymentCompleted(true);
      const authHeaders = getAuthHeaders();

      if (!authHeaders.Authorization) {
        alert("Your session has expired. Please login again.");
        setPaymentCompleted(false);
        navigate("/login", { replace: true });
        return;
      }

      // 1. Mark checkout as paid
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/pay`,
        {
          paymentStatus: "paid",
          paymentDetails: details,
        },
        {
          headers: authHeaders,
        }
      );

      // 2. Finalize checkout → create order
      const orderRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/finalize`,
        {},
        {
          headers: authHeaders,
        }
      );

      const orderId = orderRes.data?.order?._id || orderRes.data?.checkout?._id;

      if (!orderId) {
        throw new Error("Order confirmation id missing");
      }

      navigate(`/order-confirmation/${orderId}`);
    } catch (err) {
      alert("Payment processing failed");
      setPaymentCompleted(false);
    }
  };

  return (
    // PayPal SDK MUST be mounted once
    <PayPalScriptProvider
      options={{
        clientId:import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture", // Auto-capture enabled
      }}
    >
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col lg:flex-row gap-10"
          >
            {/* ================= LEFT: FORM ================= */}
            <form onSubmit={handleSubmit} className="w-full lg:w-2/3">
              <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

              {/* Contact Details */}
              <div className="mb-8">
                <h2 className="text-sm font-medium mb-2">Contact Details</h2>
                <input
                  value={user?.email}
                  disabled
                  className="w-full rounded-md border bg-gray-100 px-4 py-3 text-sm cursor-not-allowed"
                />
              </div>

              {/* Delivery Details */}
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

              {/* Payment Section */}
              <div className="mt-8">
                {/* Step 1: Continue to payment */}
                {!checkoutId && !paymentCompleted && (
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ opacity: 0.95 }}
                    className="w-full rounded-md bg-black py-4 text-white font-medium"
                  >
                    Continue to Payment
                  </motion.button>
                )}

                {/* Step 2: PayPal buttons */}
                {checkoutId && !paymentCompleted && (
                  <div>
                    <h3 className="text-lg mb-4">Pay with PayPal</h3>
                    <PayPalButton
                      amount={cart.totalPrice}
                      onSuccess={handlePaymentSuccess}
                      onError={() =>
                        alert("Payment failed. Please try again.")
                      }
                    />
                  </div>
                )}
              </div>
            </form>

            {/* ================= RIGHT: SUMMARY ================= */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="w-full lg:w-1/3 bg-gray-50 rounded-xl p-6 h-fit"
            >
              <h2 className="text-lg font-semibold mb-5">Order Summary</h2>

             { cart?.products?.map((product, index) => {
                return (
                   <div className="flex gap-4 border-b-1 border-t pt-8 border-gray-300 pb-4" key={index}>
                      <img
                        src={getSafeImageUrl(product?.image)}
                        alt={product?.name}
                        className="w-20 h-24 rounded-md object-cover"
                        onError={(e) => {
                          e.currentTarget.src = getFallbackImage();
                        }}
                      />

                      <div className="flex-1 text-sm">
                        <p className="font-semibold">
                          {product?.name}
                        </p>
                        <p className="text-gray-500">Size: {product?.size}</p>
                        <p className="text-gray-500">Color: {product?.color}</p>
                      </div>

                      <p className="font-medium">${product?.price}</p>
                    </div>

                )
             })}

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal</span>
                  <span>${cart?.totalPrice}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-300 font-semibold">
                  <span>Total</span>
                  <span>${cart?.totalPrice}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Shared input styles */}
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
    </PayPalScriptProvider>
  );
};

export default Checkout;
