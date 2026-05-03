import React from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers,
  FaBoxOpen,
  FaShoppingCart,
  FaStore,
  FaTachometerAlt,
  FaSignOutAlt,
  FaFileAlt,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { logout } from "../../redux/slices/authSlice";

const AdminSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/admin" },
    { label: "Users", icon: <FaUsers />, path: "/admin/users" },
    { label: "Products", icon: <FaBoxOpen />, path: "/admin/products" },
    { label: "Orders", icon: <FaShoppingCart />, path: "/admin/orders" },
    { label: "Customer Rights", icon: <FaFileAlt />, path: "/admin/customer-rights" },
  ];

  const bottomItems = [
    { label: "Storefront", icon: <FaStore />, path: "/" },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <>
      {/* ─── Mobile Overlay ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ─── Sidebar ─── */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-[280px] flex-col border-r border-gray-200 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header / Logo */}
        <div className="flex h-[72px] shrink-0 items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
              <span className="text-sm font-bold tracking-tighter">SF</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900">
              Shopflare <span className="font-medium text-gray-500">Admin</span>
            </h1>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
            aria-label="Close sidebar"
          >
            <IoClose className="text-xl" />
          </button>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">
            Overview
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {/* Active Indicator Line */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 h-5 w-1 rounded-r-full bg-indigo-600"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span
                    className={`flex items-center justify-center text-lg transition-transform duration-200 ${
                      isActive ? "text-indigo-600" : "text-gray-400 group-hover:scale-110 group-hover:text-gray-500"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="shrink-0 border-t border-gray-100 p-4 space-y-1">
          {bottomItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900"
            >
              <span className="flex items-center justify-center text-lg text-gray-400 transition-transform group-hover:scale-110 group-hover:text-gray-500">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}

          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
          >
            <span className="flex items-center justify-center text-lg text-red-400 transition-transform group-hover:scale-110 group-hover:text-red-500">
              <FaSignOutAlt />
            </span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
