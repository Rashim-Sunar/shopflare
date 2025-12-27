import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { clearError, loginUser } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

const Login = () => {

  const [ email, setEmail ] = useState("");
  const [ password, setPassword ] = useState("");

  const dispatch = useDispatch();

  const { loading, error, user } = useSelector(state => state.auth);

  useEffect(() => {
    if(error){
       toast.error(error);
       dispatch(clearError());
    }
    // Clear the form data only if login is successful
    if(user){
      setEmail("");
      setPassword("");
      toast.success("Login successful 🎉");
    }
  }, [error, user]);

  const handleFormSubmission = (e) => {
    e.preventDefault();

    if(loading) return; // prevents double request

    dispatch(loginUser({ email, password }));
  }

  return (
    <div className="flex items-center justify-center w-full h-[650px] bg-gray-100 px-4 sm:px-0">

      {/* LEFT IMAGE — 40% width on md+ screens */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="hidden lg:block h-full w-[50%]"
      >
        <img
          src="https://picsum.photos/900/1200?random=301"
          alt="Login"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* FORM CARD — takes remaining width */}
      <motion.form
        onSubmit={handleFormSubmission}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="bg-white shadow-md rounded-xl p-10 w-full md:w-[55%] lg:w-[30%] max-w-lg mx-auto"
      >
        <h1 className="text-xl font-bold mb-1">Shopflare</h1>

        <h2 className="text-3xl font-semibold mb-3">Hey there! 👋🏻</h2>
        <p className="text-gray-600 text-sm mb-6">
          Enter your email and password to log in.
        </p>

        {/* Email */}
        <label className="text-sm font-medium text-gray-700">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Enter your email"
          className="border p-3 rounded-md mb-4 w-full focus:border-black outline-none"
        />

        {/* Password */}
        <label className="text-sm font-medium text-gray-700">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Enter your password"
          className="border p-3 rounded-md mb-6 w-full focus:border-black outline-none"
        />

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className={`py-3 rounded-md font-medium w-full transition
            ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800 text-white"}
          `}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Footer Link */}
        <p className="mt-5 text-sm text-gray-600 text-center">
          Don’t have an account?
          <Link to="/signup" className="text-black ml-1 hover:underline">
            Register
          </Link>
        </p>
      </motion.form>
    </div>
  );
};

export default Login;
