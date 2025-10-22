import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "./UserSidebar";
import { supabase } from "../lib/supabase";
import { toast as sonnerToast } from "sonner";

const toastSuccess = (message) => {
  sonnerToast.success(message, {
    duration: 4000,
    position: "top-center",
    style: {
      background: '#12B279',
      color: 'white',
      border: 'none',
    },
  });
};

const toastError = (message) => {
  sonnerToast.error(message, {
    duration: 4000,
    position: "top-center",
  });
};

const ResetPassword = () => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("reset");
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
    setPasswordError("");
  };

  // ✅ Password validation
  const isValidPassword = (password) => {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return password.length >= 6 && hasLetter && hasNumber;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordForm.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    if (!isValidPassword(passwordForm.newPassword)) {
      setPasswordError("New password must be at least 6 characters and contain letters and numbers");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Updating password...');
      
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) {
        console.error('❌ Error updating password:', error);
        throw error;
      }

      console.log('✅ Password updated successfully');
      setPasswordSuccess("Password updated successfully!");
      toastSuccess("Password updated successfully!");
      
      setTimeout(() => {
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPasswordSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Error updating password:", err);
      const errorMessage = err.message || "Failed to update password. Please try again.";
      setPasswordError(errorMessage);
      toastError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="relative min-h-[calc(100vh-73px)] bg-[#F9F8F6] flex justify-center items-start px-4 sm:px-8 pt-10 pb-20">
      {/* Main Layout */}
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

        {/* Reset Password Form */}
        <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md mx-auto md:mx-0 w-full">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Reset Password
          </h2>

          {/* Current password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Current password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-500 text-sm"
              placeholder="Enter current password"
              required
              disabled={loading}
            />
          </div>

          {/* New password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              New password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-500 text-sm"
              placeholder="New password"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 6 characters with letters and numbers
            </p>
          </div>

          {/* Confirm new password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm new password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-500 text-sm"
              placeholder="Confirm new password"
              required
              disabled={loading}
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
      </div>
    </div>
  );
};

export default ResetPassword;