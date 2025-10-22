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
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("reset");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  // ✅ Password validation
  const isValidPassword = (password) => {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return password.length >= 6 && hasLetter && hasNumber;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowAlert(false);

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

      // ✅ Show success popup
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setFormData({ newPassword: "", confirmPassword: "" });
        navigate("/profile");
      }, 2500);
    } catch (err) {
      setError(err.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-73px)] bg-[#F9F8F6] flex justify-center items-start px-4 sm:px-8 pt-10 pb-20">
      {/* ✅ Alert popup */}
      {showAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#22C55E] text-white px-6 py-3 rounded-lg shadow-md text-sm font-medium animate-fadeIn text-center">
          <p className="font-semibold">Password updated</p>
          <p>Your password has been successfully reset</p>
        </div>
      )}

      {/* ✅ Main Layout */}
      <div className="flex flex-col md:flex-row gap-10 w-full max-w-5xl">
        {/* Sidebar - visible on desktop */}
        <div className="hidden md:block">
          <UserSidebar />
        </div>

        {/* Top tabs - visible on mobile */}
        <div className="flex md:hidden justify-center gap-8 border-b border-gray-300 pb-2 mb-6">
          <button
            className={`text-sm font-medium ${
              activeTab === "profile"
                ? "text-[#26231E] border-b-2 border-[#26231E]"
                : "text-gray-500"
            }`}
            onClick={() => navigate("/profile")}
          >
            Profile
          </button>
          <button
            className={`text-sm font-medium ${
              activeTab === "reset"
                ? "text-[#26231E] border-b-2 border-[#26231E]"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("reset")}
          >
            Reset password
          </button>
        </div>

       {/* --- Reset Password Tab --- */}
          {activeTab === "reset" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Reset Password
              </h2>

              {/* Current password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-500 text-sm"
                  placeholder="Enter current password"
                  required
                />
              </div>

              {/* New password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-500 text-sm"
                  placeholder="New password"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 6 characters with letters and numbers
                </p>
              </div>

              {/* Confirm new password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm new password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-500 text-sm"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {passwordSuccess}
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
          )}
        </div>
      </div>
  );
};

export default ResetPassword;
