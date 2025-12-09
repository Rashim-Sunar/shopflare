import React from "react";
import { FaInstagram, FaFacebookF, FaXTwitter } from "react-icons/fa6";
import { FiPhone } from "react-icons/fi";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-white py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
          <p className="text-gray-500 mb-2">
            Be the first to hear about new products, exclusive events, and online offers.
          </p>
          <p className="text-gray-700 font-medium text-sm mb-4">
            Sign up and get 10% off your first order.
          </p>

          <form className="flex max-w-full min-w-0">
            <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 min-w-0 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />

            <button type="submit"
                className="bg-black text-white px-4 py-2 rounded-r-md hover:bg-gray-800 whitespace-nowrap"
            >
                Subscribe
            </button>
          </form>

        </div>

        {/* Shop Links*/}
        <div>
          <h3 className="text-lg font-semibold mb-4">Shop</h3>
          <ul className="space-y-2 text-gray-500">
            <li><Link to = '#' className="hover:text-gray-900">Men's Top Wear</Link></li>
            <li> <Link to = '#' className="hover:text-gray-900"> Women's Top Wear </Link></li>
            <li><Link to='#' className="hover:text-gray-900"> Men's Bottom Wear </Link></li>
            <li><Link to='#' className="hover:text-gray-900"> Women's Bottom Wear </Link></li>
          </ul>
        </div>

        {/* Support Links*/}
        <div>
          <h3 className="text-lg font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-gray-500">
            <li><Link to = '#' className="hover:text-gray-900">Contact Us</Link></li>
            <li> <Link to = '#' className="hover:text-gray-900"> About Us </Link></li>
            <li><Link to='#' className="hover:text-gray-900"> FAQs </Link></li>
            <li><Link to='#' className="hover:text-gray-900"> Features </Link></li>
          </ul>
        </div>

        {/* Follow Us / Phone */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <div className="flex items-center gap-2 text-black text-xl mb-6">
            <div className="p-2 rounded-full hover:bg-gray-100 transition-all duration-300">
                <FaFacebookF className="h-5 w-5"/>
            </div>
            <div className="p-2 rounded-full hover:bg-gray-100 transition-all duration-300">
                <FaInstagram className="h-5 w-5"/>
            </div>
            <div className="p-2 rounded-full hover:bg-gray-100 transition-all duration-300">
                <FaXTwitter className="h-5 w-5"/>
            </div>
          </div>

          <p className="text-gray-800 font-medium mb-1">Call Us</p>
          <div className="flex items-center gap-2 text-gray-700">
            <FiPhone className="text-lg" />
            <span className="font-semibold text-black">0123-456-789</span>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t-2 border-gray-400 mt-10 pt-6 max-w-7xl mx-auto">
        <p className="text-gray-500 text-sm text-center">
            © 2025, CompileTab. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
