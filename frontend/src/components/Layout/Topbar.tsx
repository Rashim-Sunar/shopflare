import React from "react";
import { FaInstagram, FaFacebookF } from "react-icons/fa";
import { FaMeta } from "react-icons/fa6";

const Topbar = () => {
  return (
    <div className="w-full bg-gray-900 text-white py-3 px-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">

        {/* LEFT ICONS */}
        <div className="flex items-center gap-4 sm:flex hidden">
          <FaMeta  className="text-md cursor-pointer hover:text-gray-300" />
          <FaInstagram className="text-md cursor-pointer hover:text-gray-300" />
          <FaFacebookF className="text-md cursor-pointer hover:text-gray-300" />
        </div>

        {/* CENTER TEXT */}
        <div className="text-center w-full sm:w-auto">
          <p className="text-xs sm:text-sm">Where great deals meet great service!</p>
        </div>

        {/* PHONE NUMBER RIGHT */}
        <div className="sm:flex hidden">
          <p className="text-xs sm:text-sm">
            Call Us: 
            <a href="tel:+1234567890" className="hover:text-gray-300 ml-1">
                +91 9876543210
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
