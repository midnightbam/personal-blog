import React, { useState } from "react";
import { Link } from "react-router-dom";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login submitted:", formData);
    // Add login logic here
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
            />
          </div>

          {/* Submit */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-8 py-2 bg-[#26231E] text-white rounded-full hover:bg-[#3d3832] transition-colors text-sm font-medium"
            >
              Log in
            </button>
          </div>
        </form>

        {/* Sign up link */}
        <p className="flex justify-center gap-1 mt-6 text-sm text-gray-600 font-medium">
          Don’t have an account?
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
