import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "./UserSidebar";
import { authService } from "../lib/auth";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(""); // Clear errors when user types
  };

  // Password validation
  const isValidPassword = (password) => {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return password.length >= 6 && hasLetter && hasNumber;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate passwords
    if (!isValidPassword(formData.newPassword)) {
      setError("Password must be at least 6 characters and contain letters and numbers");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await authService.updatePassword(formData.newPassword);
      
      setSuccess("Password updated successfully!");
      
      // Clear form and redirect after 2 seconds
      setTimeout(() => {
        setFormData({ newPassword: "", confirmPassword: "" });
        navigate("/profile");
      }, 2000);
    } catch (error) {
      setError(error.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
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
                New password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-500 text-sm"
                placeholder="New password"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 6 characters with letters and numbers
              </p>
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
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="mt-4 px-6 py-2 bg-[#26231E] text-white rounded-full hover:bg-[#3d3832] transition text-sm font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Updating..." : "Reset password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;