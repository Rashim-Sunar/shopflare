import React from "react";
import MyOrdersPage from "./MyOrdersPage";

const Profile = () => {
  // Mock user data
  const user = {
    name: "Rashim Sunar",
    email: "rashim@example.com",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* LEFT SECTION: USER INFO */}
      <div className="lg:col-span-1 bg-white shadow-md rounded-xl p-6 h-fit">
        <h2 className="text-2xl font-semibold mb-4">My Profile</h2>

        <div className="space-y-3">
          <p className="text-gray-700">
            <span className="font-semibold">Name:</span> {user.name}
          </p>

          <p className="text-gray-700">
            <span className="font-semibold">Email:</span> {user.email}
          </p>

          <button
            className="mt-5 w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* RIGHT SECTION: ORDER DETAILS (TABLE) */}
      <MyOrdersPage/>
    </div>
  );
};

export default Profile;
