import React, { useState } from "react";
import UserSidebar from "./UserSidebar";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Password reset form submitted:", formData);
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#F9F8F6] flex justify-center items-start px-4 sm:px-8 pt-10 pb-20">
      <div className="flex flex-col md:flex-row gap-10 w-full max-w-5xl">
        <UserSidebar />

        <div className="flex-1 bg-[#EFEEEB] rounded-xl shadow-sm p-8">
          <h1 className="text-lg font-semibold text-gray-900 mb-6">
            Reset password
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-500 text-sm"
                placeholder="Current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-500 text-sm"
                placeholder="New password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm new password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-500 text-sm"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              className="mt-4 px-6 py-2 bg-[#26231E] text-white rounded-full hover:bg-[#3d3832] transition text-sm font-medium"
            >
              Reset password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
