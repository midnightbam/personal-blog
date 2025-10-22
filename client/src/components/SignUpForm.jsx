import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setDebugInfo(null);
  };

  const handleBlur = (field) => {
    setTouched({
      ...touched,
      [field]: true,
    });
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password) => {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return password.length >= 6 && hasLetter && hasNumber;
  };

  const showEmailError = touched.email && formData.email && !isValidEmail(formData.email);
  const showPasswordError = touched.password && formData.password && !isValidPassword(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValidEmail(formData.email) || !isValidPassword(formData.password)) {
      setTouched({ email: true, password: true });
      return;
    }

    setError("");
    setLoading(true);
    setDebugInfo(null);

    try {
      console.log("🔵 Starting signup process for:", formData.email);

      // Step 1: Sign up with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            username: formData.username,
          },
        },
      });

      console.log("🔵 Auth signup response:", { authData, error: signUpError });

      if (signUpError) {
        console.error("❌ Signup error:", signUpError);
        throw signUpError;
      }

      // Check if email is already registered
      if (authData?.user?.identities?.length === 0) {
        setDebugInfo({
          type: "error",
          message: "This email is already registered",
        });
        throw new Error("This email is already registered. Please log in instead.");
      }

      const user = authData.user;
      console.log("✅ User created in auth:", user.id);

      // Step 2: Create user profile in users table
      const { error: userInsertError } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          email: user.email,
          name: formData.name,
          username: formData.username,
          avatar_url: null,
          created_at: new Date().toISOString(),
        }]);

      if (userInsertError) {
        console.error("⚠️ Error creating user profile:", userInsertError);
        setDebugInfo({
          type: "warning",
          message: "User created but profile setup incomplete",
        });
      } else {
        console.log("✅ User profile created");
      }

      // Step 3: Create profile with role
      const { error: profileInsertError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          role: 'user',
          created_at: new Date().toISOString(),
        }]);

      if (profileInsertError) {
        console.error("⚠️ Error creating profile:", profileInsertError);
        setDebugInfo({
          type: "warning",
          message: "User created but role assignment incomplete",
        });
      } else {
        console.log("✅ Profile created with role: user");
      }

      // Check if email confirmation is required
      if (authData.user && !authData.session) {
        console.log("📧 Email confirmation required");
        navigate("/registration-success", { 
          state: { 
            message: "Please check your email to confirm your account before logging in.",
            requiresConfirmation: true,
          } 
        });
      } else {
        console.log("✅ No email confirmation needed, redirecting to success page");
        navigate("/registration-success");
      }

    } catch (error) {
      console.error("❌ Signup failed:", error);
      setError(error.message || "Failed to sign up. Please try again.");
    } finally {
      setLoading(false);
    }
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
              onBlur={() => handleBlur('email')}
              className={`flex h-10 w-full border ${
                showEmailError ? 'border-red-500' : 'border-gray-300'
              } bg-white px-3 text-sm rounded-lg focus-visible:outline-none focus-visible:border-gray-500 transition`}
              required
            />
            {showEmailError && (
              <p className="text-red-600 text-xs mt-1">
                Email must be a valid email
              </p>
            )}
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
              onBlur={() => handleBlur('password')}
              className={`flex h-10 w-full border ${
                showPasswordError ? 'border-red-500' : 'border-gray-300'
              } bg-white px-3 text-sm rounded-lg focus-visible:outline-none focus-visible:border-gray-500 transition`}
              required
            />
            {showPasswordError && (
              <p className="text-red-600 text-xs mt-1">
                Password must be at least 6 characters and must contain letters and numbers
              </p>
            )}
          </div>

          {/* Debug Info */}
          {debugInfo && (
            <div className={`${
              debugInfo.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
            } border px-4 py-3 rounded-lg text-sm`}>
              <p className="font-semibold">{debugInfo.type === 'error' ? 'Error:' : 'Warning:'}</p>
              <p>{debugInfo.message}</p>
            </div>
          )}

          {/* Error Message */}
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
              {loading ? "Signing up..." : "Sign up"}
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