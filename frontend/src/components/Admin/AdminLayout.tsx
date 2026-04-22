import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { FiMenu } from "react-icons/fi";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        {/* Mobile Top Bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white shadow px-4 py-3 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 text-xl"
          >
            <FiMenu />
          </button>
          <h2 className="ml-4 font-semibold text-gray-800">
            Admin Dashboard
          </h2>
        </div>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
