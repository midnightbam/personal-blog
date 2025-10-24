import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast as sonnerToast } from "sonner";

const toastSuccess = (message, description = "") => {
  sonnerToast.success(message, {
    description,
    duration: 4000,
    position: "top-center",
    style: {
      background: '#12B279',
      color: 'white',
      border: 'none',
    },
    classNames: {
      description: '!text-white',
      closeButton: '!bg-transparent !text-white hover:!bg-white/10 !absolute !right-1 !left-auto !top-4',
    },
    closeButton: true,
  });
};

const toastError = (message) => {
  sonnerToast.error(message, {
    duration: 4000,
    position: "top-center",
  });
};

export default function RecoverPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(true);
  const navigate = useNavigate();

  // Check if the recovery token is valid when component mounts
  useEffect(() => {
    const verifyRecoveryToken = async () => {
      try {
        // Get the session from URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data?.session) {
          console.error("No valid recovery session found");
          setError("This password reset link is invalid or has expired. Please request a new one.");
          setIsValidToken(false);
        } else {
          console.log("✅ Valid recovery session found");
          setIsValidToken(true);
        }
      } catch (err) {
        console.error("Error verifying token:", err);
        setError("Failed to verify password reset link.");
        setIsValidToken(false);
      } finally {
        setTokenLoading(false);
      }
    };

    verifyRecoveryToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      console.log("🔐 Updating password...");

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error("❌ Error updating password:", updateError);
        throw updateError;
      }

      console.log("✅ Password updated successfully");
      toastSuccess("Password reset successfully!", "You can now log in with your new password");

      // Clear the session after password reset
      await supabase.auth.signOut();

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Error resetting password:", err);
      const errorMessage = err.message || "Failed to reset password. Please try again.";
      setError(errorMessage);
      toastError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (tokenLoading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-[#F9F8F6] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying password reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-[#F9F8F6] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[#EFEEEB] rounded-lg shadow-md px-6 sm:px-10 py-10 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">Link Expired</h2>
            <p className="text-stone-600 mb-6">{error || "This password reset link is invalid or has expired."}</p>
            <button
              onClick={() => navigate("/forgot-password")}
              className="w-full bg-stone-800 text-white py-3 rounded-full text-sm font-medium hover:bg-stone-700 transition-colors"
            >
              Request New Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#F9F8F6] flex items-center justify-center px-4 sm:px-8 py-8">
      <div className="w-full max-w-md bg-[#EFEEEB] rounded-lg shadow-md px-6 sm:px-10 py-10">
        <h1 className="text-2xl font-bold text-stone-900 mb-2 text-center">Reset Password</h1>
        <p className="text-stone-600 text-center mb-8 text-sm">
          Enter your new password below
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword.new ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 pr-12 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors p-1"
              >
                {showPassword.new ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword.confirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 pr-12 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors p-1"
              >
                {showPassword.confirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-800 text-white py-3 rounded-full text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>

        <p className="text-center text-xs text-stone-500 mt-6">
          Remember your password?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-stone-700 font-medium hover:underline"
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}
