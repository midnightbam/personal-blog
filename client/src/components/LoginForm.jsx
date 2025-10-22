import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();

  // Debug logging
  useEffect(() => {
    console.log("DEBUG:", {
      user: user?.email,
      isAdmin: isAdmin,
      authLoading: authLoading,
      loading: loading
    });
  }, [user, isAdmin, authLoading, loading]);

  // Handle redirect after login
  useEffect(() => {
    if (user && !authLoading) {
      console.log("User logged in:", user.email);
      console.log("Is admin:", isAdmin);
      
      // Wait 2 seconds to ensure admin status is fully determined
      const timer = setTimeout(() => {
        if (isAdmin) {
          console.log("Redirecting to admin dashboard");
          navigate("/admin/dashboard", { replace: true });
        } else {
          console.log("Redirecting to home");
          navigate("/", { replace: true });
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Attempting login with:", formData.email);

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (loginError) {
        console.error("Login error:", loginError);
        throw loginError;
      }

      console.log("Login successful, waiting for auth context to update...");
      // Don't set loading to false here - let the useEffect handle redirect
    } catch (err) {
      console.error("Login failed:", err);
      let errorMessage = "Failed to log in. Please try again.";

      if (err.message === "Invalid login credentials") {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (err.message === "Email not confirmed") {
        errorMessage = "Please confirm your email before logging in.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

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
              disabled={loading || (user && !authLoading)}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="flex h-10 w-full border border-gray-300 bg-white px-3 text-sm rounded-lg focus-visible:outline-none focus-visible:border-gray-500 transition"
              required
              disabled={loading || (user && !authLoading)}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              className="px-8 py-2 bg-[#26231E] text-white rounded-full hover:bg-[#3d3832] transition-colors text-sm font-medium disabled:opacity-50"
              disabled={loading || (user && !authLoading)}
            >
              {loading ? "Logging in..." : user && !authLoading ? "Redirecting..." : "Log in"}
            </button>
          </div>
        </form>

        <p className="flex justify-center gap-1 mt-6 text-sm text-gray-600 font-medium">
          Don&apos;t have an account?
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