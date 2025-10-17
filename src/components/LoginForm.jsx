import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Successfully logged in
      console.log("User logged in:", data.user);
      navigate("/"); // Redirect to home or dashboard
    } catch (error) {
      setError(error.message || "Failed to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setResetMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetMessage("Password reset link sent! Check your email.");
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetMessage("");
        setResetEmail("");
      }, 3000);
    } catch (error) {
      setError(error.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-[#F9F8F6] flex items-start justify-center px-4 sm:px-8 pt-6 sm:pt-8">
        <div className="w-full max-w-2xl bg-[#EFEEEB] rounded-lg shadow-md px-4 sm:px-10 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-900">
            Reset Password
          </h2>
          <p className="text-center text-sm text-gray-600 mb-8">
            Enter your email and we'll send you a reset link
          </p>

          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div className="space-y-1">
              <label
                htmlFor="resetEmail"
                className="block text-sm font-medium text-gray-600"
              >
                Email
              </label>
              <input
                type="email"
                id="resetEmail"
                name="resetEmail"
                placeholder="Email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="flex h-10 w-full border border-gray-300 bg-white px-3 text-sm rounded-lg focus-visible:outline-none focus-visible:border-gray-500 transition"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {resetMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {resetMessage}
              </div>
            )}

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="px-8 py-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition-colors text-sm font-medium"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                className="px-8 py-2 bg-[#26231E] text-white rounded-full hover:bg-[#3d3832] transition-colors text-sm font-medium disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#F9F8F6] flex items-start justify-center px-4 sm:px-8 pt-6 sm:pt-8">
      <div className="w-full max-w-2xl bg-[#EFEEEB] rounded-lg shadow-md px-4 sm:px-10 py-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-gray-900">
          Log in
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="flex h-10 w-full border border-gray-300 bg-white px-3 text-sm rounded-lg focus-visible:outline-none focus-visible:border-gray-500 transition"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-600"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs text-gray-600 hover:text-gray-900 underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="flex h-10 w-full border border-gray-300 bg-white px-3 text-sm rounded-lg focus-visible:outline-none focus-visible:border-gray-500 transition"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-8 py-2 bg-[#26231E] text-white rounded-full hover:bg-[#3d3832] transition-colors text-sm font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </div>
        </form>

        {/* Sign up link */}
        <p className="flex justify-center gap-1 mt-6 text-sm text-gray-600 font-medium">
          Don't have an account?
          <Link
            to="/signup"
            className="text-gray-900 hover:text-gray-700 underline font-semibold transition"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;