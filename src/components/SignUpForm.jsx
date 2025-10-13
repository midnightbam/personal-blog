import React, { useState } from "react";
import { Link } from "react-router-dom";

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
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
    console.log("Sign up submitted:", formData);
    // Add signup logic here
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#F9F8F6] flex items-start justify-center px-4 sm:px-8 pt-8 sm:pt-10 pb-16">
      <div className="w-full max-w-2xl bg-[#EFEEEB] rounded-lg shadow-md px-4 sm:px-10 py-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-gray-900">
          Sign up
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-600"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Full name"
              value={formData.name}
              onChange={handleChange}
              className="flex h-10 w-full border border-gray-300 bg-white px-3 text-sm rounded-lg focus-visible:outline-none focus-visible:border-gray-500 transition"
              required
            />
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-600"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="flex h-10 w-full border border-gray-300 bg-white px-3 text-sm rounded-lg focus-visible:outline-none focus-visible:border-gray-500 transition"
              required
            />
          </div>

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
              Sign up
            </button>
          </div>
        </form>

        {/* Login link */}
        <p className="flex justify-center gap-1 mt-6 text-sm text-gray-600 font-medium">
          Already have an account?
          <Link
            to="/login"
            className="text-gray-900 hover:text-gray-700 underline font-semibold transition"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
