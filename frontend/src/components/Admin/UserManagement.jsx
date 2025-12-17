import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

/* ---------------- MOTION VARIANTS ---------------- */

const pageVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const listItemVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

/* ---------------- COMPONENT ---------------- */

const UserManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      role: "Admin",
    },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Customer",
  });

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddUser = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill all required fields");
      return;
    }

    setUsers([
      ...users,
      {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
      },
    ]);

    toast.success("User added successfully");

    setFormData({
      name: "",
      email: "",
      password: "",
      role: "Customer",
    });
  };

  const handleRoleChange = (id, newRole) => {
    const user = users.find((u) => u.id === id);

    if (user.role === newRole) return;

    const confirmed = window.confirm(
      `Are you sure you want to change ${user.name}'s role to ${newRole}?`
    );

    if (!confirmed) {
      toast("Role change cancelled");
      return;
    }

    setUsers(
      users.map((u) =>
        u.id === id ? { ...u, role: newRole } : u
      )
    );

    toast.success("User role updated");
  };

  const handleDelete = (id) => {
    const user = users.find((u) => u.id === id);

    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) {
      toast("Delete action cancelled");
      return;
    }

    setUsers(users.filter((u) => u.id !== id));
    toast.success("User deleted successfully");
  };

  return (
    <motion.div
      variants={pageVariant}
      initial="hidden"
      animate="visible"
      className="space-y-10 max-w-full overflow-x-hidden"
    >
      {/* PAGE TITLE */}
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
        User Management
      </h1>

      {/* ADD USER FORM */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Add New User
        </h2>

        <form
          onSubmit={handleAddUser}
          className="grid grid-cols-1 gap-5"
        >
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Customer</option>
              <option>Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-fit bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm font-medium transition"
          >
            Add User
          </button>
        </form>
      </section>

      {/* USERS LIST */}
      <section className="bg-white rounded-xl border border-gray-200">
        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 text-left font-medium">NAME</th>
                <th className="px-6 py-3 text-left font-medium">EMAIL</th>
                <th className="px-6 py-3 text-left font-medium">ROLE</th>
                <th className="px-6 py-3 text-left font-medium">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <motion.tr
                  key={user.id}
                  variants={listItemVariant}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: i * 0.05 }}
                  className="border-t border-gray-100"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className="rounded-md border border-gray-300 px-3 py-1 text-sm"
                    >
                      <option>Admin</option>
                      <option>Customer</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-sm transition"
                    >
                      Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-4 p-4">
          {users.map((user, i) => (
            <motion.div
              key={user.id}
              variants={listItemVariant}
              initial="hidden"
              animate="visible"
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-gray-200 p-4 space-y-3"
            >
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-600 break-all">
                {user.email}
              </p>

              <select
                value={user.role}
                onChange={(e) =>
                  handleRoleChange(user.id, e.target.value)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option>Admin</option>
                <option>Customer</option>
              </select>

              <button
                onClick={() => handleDelete(user.id)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-sm transition"
              >
                Delete
              </button>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

/* ---------------- REUSABLE INPUT ---------------- */

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm text-gray-600 mb-1">
      {label}
    </label>
    <input
      {...props}
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default UserManagement;
