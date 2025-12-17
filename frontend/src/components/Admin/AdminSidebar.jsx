import React from "react";
import { Link, useLocation, NavLink } from "react-router-dom";
import {
  FaUsers,
  FaBoxOpen,
  FaShoppingCart,
  FaStore,
  FaTachometerAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    {
      label: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/admin/dashboard",
    },
    {
      label: "Users",
      icon: <FaUsers />,
      path: "/admin/users",
    },
    {
      label: "Products",
      icon: <FaBoxOpen />,
      path: "/admin/products",
    },
    {
      label: "Orders",
      icon: <FaShoppingCart />,
      path: "/admin/orders",
    },
    {
      label: "Shop",
      icon: <FaStore />,
      path: "/admin/shop",
    },
  ];

  return (
    <>
      {/* Overlay (Mobile) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:fixed top-0 left-0 z-50 h-screen w-64
        bg-gradient-to-b from-gray-900 to-gray-800 text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700">
          <h1 className="text-xl font-bold tracking-wide">
            Shopflare Admin
          </h1>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-300 text-2xl"
          >
            <IoClose />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-md
                transition-all duration-200
                ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-6 left-0 w-full px-4">
          <Link
            to="/"
            className="flex items-center justify-center gap-2
            bg-red-600 hover:bg-red-700 text-white
            py-3 rounded-md font-medium transition"
          >
            <FaSignOutAlt />
            Logout
          </Link>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
