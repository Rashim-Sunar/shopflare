import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { registerUser, clearError } from '../redux/slices/authSlice';
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";


const Signup = () => {
  const [ name, setName ] = useState("");
  const [ email, setEmail ] = useState("");
  const [ password, setPassword ] = useState("");

  const dispatch = useDispatch();

  const {loading, error, user} = useSelector(state => state.auth);

  useEffect(() => {
    if(error){
      toast.error(error);
      dispatch(clearError());
    }

    if(user){
      toast.success("You are registered successfully 🎉");
      setName("");
      setEmail("");
      setPassword("");
    }
  }, [error, user]);

  const handleFormSubmission = (e) => {
    e.preventDefault();
    dispatch(registerUser({name, email, password}));
  }

  return (
    <div className="flex items-center justify-center w-full h-[650px] bg-gray-100 px-4 sm:px-0">

      {/* LEFT IMAGE — 50% width on large screens */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="hidden lg:block h-full w-[50%]"
      >
        <img
          src="https://picsum.photos/900/1200?random=303"
          alt="Signup"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* FORM CARD — 50% width */}
      <motion.form
        onSubmit={handleFormSubmission}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="bg-white shadow-md rounded-xl p-10 w-full md:w-[55%] lg:w-[30%] max-w-lg mx-auto"
      >
        <h1 className="text-xl font-bold mb-1">Shopflare</h1>

        <h2 className="text-3xl font-semibold mb-3">Create Account ✨</h2>
        <p className="text-gray-600 text-sm mb-6">
          Fill in your details to create a new account.
        </p>

        {/* Name */}
        <label className="text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          className="border p-3 rounded-md mb-4 w-full focus:border-black outline-none"
        />

        {/* Email */}
        <label className="text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="border p-3 rounded-md mb-4 w-full focus:border-black outline-none"
        />

        {/* Password */}
        <label className="text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          className="border p-3 rounded-md mb-6 w-full focus:border-black outline-none"
        />

        {/* Button */}
        <button
         type="submit"
         disabled = {loading}
         className="bg-black text-white py-3 rounded-md hover:bg-gray-800 transition font-medium w-full">
         {loading ? "Registering User" :  "Sign Up"}
        </button>

        {/* Footer Link */}
        <p className="mt-5 text-sm text-gray-600 text-center">
          Already have an account?
          <Link to="/login" className="text-black ml-1 hover:underline">
            Login
          </Link>
        </p>
      </motion.form>
    </div>
  );
};

export default Signup;
