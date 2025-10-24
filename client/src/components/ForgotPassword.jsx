import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      console.log("📧 Sending password reset email to:", email);

      // Use your production URL for the redirect
      const redirectUrl = window.location.hostname === 'localhost' 
        ? `${window.location.origin}/reset-password`
        : 'https://personal-blog-ashen-three.vercel.app/reset-password';

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        console.error("❌ Error sending reset email:", resetError);
        throw resetError;
      }

      console.log("✅ Password reset email sent successfully");
      setSent(true);
      toastSuccess("Password reset email sent! Check your inbox.");

      // Redirect to login after 5 seconds
      setTimeout(() => {
        navigate("/login");
      }, 5000);
    } catch (err) {
      console.error("Error sending password reset email:", err);
      let errorMessage = "Failed to send password reset email. Please try again.";

      if (err.message === "User not found") {
        // Don't reveal if email exists or not (security best practice)
        setSent(true);
        toastSuccess("If an account exists with this email, you will receive a password reset link.");
        setTimeout(() => {
          navigate("/login");
        }, 5000);
      } else {
        setError(errorMessage);
        toastError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-[#F9F8F6] flex items-center justify-center px-4 sm:px-8">
        <div className="w-full max-w-md bg-[#EFEEEB] rounded-lg shadow-md px-6 sm:px-10 py-10 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-3 text-gray-900">Check your email</h2>
          <p className="text-gray-600 mb-4">
            We&apos;ve sent a password reset link to <span className="font-semibold text-gray-900">{email}</span>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            The link will expire in 24 hours. If you don&apos;t see it, check your spam folder.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center justify-center px-6 py-2 bg-[#26231E] text-white rounded-full hover:bg-[#3d3832] transition-colors font-medium"
          >
            Back to Login
          </Link>

          <p className="text-xs text-gray-500 mt-4">Redirecting to login in 5 seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#F9F8F6] flex items-start justify-center px-4 sm:px-8 pt-6 sm:pt-8">
      <div className="w-full max-w-md bg-[#EFEEEB] rounded-lg shadow-md px-6 sm:px-10 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/login"
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Reset Password
          </h2>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex h-10 w-full border border-gray-300 bg-white px-3 text-sm rounded-lg focus-visible:outline-none focus-visible:border-gray-500 transition"
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="px-8 py-2 bg-[#26231E] text-white rounded-full hover:bg-[#3d3832] transition-colors text-sm font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-300">
          <p className="flex justify-center gap-1 text-sm text-gray-600 font-medium">
            Remember your password?
            <Link
              to="/login"
              className="text-gray-900 hover:text-gray-700 underline font-semibold transition"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
