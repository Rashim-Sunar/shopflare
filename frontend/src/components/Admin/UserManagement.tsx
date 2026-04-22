import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchAllUsers,
  createUser,
  updateUser,
  deleteUser,
  clearAdminError,
} from "../../redux/slices/adminSlice";


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
  const dispatch = useDispatch();

  const { users, loading, error } = useSelector((state) => state.admin);
  const { user: loggedInUser } = useSelector((state) => state.auth);

  // Fetch users on page load
  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Handle error globally
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAdminError());
    }
  }, [error, dispatch]);


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle add user
  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await dispatch(createUser(formData)).unwrap();
      toast.success("User added successfully");

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "customer",
      });
    } catch (err) {
      toast.error(err.message || "Failed to create user");
    }
  };

  const handleRoleChange = async (id, newRole) => {
    const user = users.find((u) => u._id === id);
    if (!user || user.role === newRole) return;

    const confirmed = window.confirm(
      `Are you sure you want to change ${user.name}'s role to ${newRole}?`
    );
    if (!confirmed) return;

    try {
      await dispatch(
        updateUser({
          id,
          userData: { role: newRole },
        })
      ).unwrap();

      toast.success("User role updated");
    } catch (err) {
      toast.error(err.message || "Failed to update role");
    }
  };

  const handleDelete = async (id) => {
    // Prevent admin from deleting own account.
    if(id == loggedInUser?._id){
      toast.error("You cannot delete your own account.");
      return;
    }

    const user = users.find((u) => u._id === id);
    if (!user) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );
    if (!confirmed) return;

    try {
      await dispatch(deleteUser(id)).unwrap();
      toast.success("User deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete user");
    }
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
              <option>customer</option>
              <option>admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled = { loading.create }
            className="w-fit bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm font-medium transition"
          >
            { loading.create ? "Adding....." : "Add User"}
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
                  key={user?._id}
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
                      disabled = { user?._id == loggedInUser?._id}
                      onChange={(e) =>
                        handleRoleChange(user?._id, e.target.value)
                      }
                      className="rounded-md border border-gray-300 px-3 py-1 text-sm"
                    >
                      <option>admin</option>
                      <option>customer</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(user?._id)}
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
              key={user?._id}
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
                disabled = { user._id == loggedInUser._id }
                onChange={(e) =>
                  handleRoleChange(user?._id, e.target.value)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option>admin</option>
                <option>customer</option>
              </select>

              <button
                onClick={() => handleDelete(user?._id)}
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
