import React, { useState } from 'react';
import { Menu, Eye, EyeOff } from 'lucide-react';
import { toast as sonnerToast } from "sonner";
import { supabase } from '@/lib/supabase';

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

const toastError = (message, description = "") => {
  sonnerToast.error(message, {
    description,
    duration: 4000,
    position: "top-center",
    style: {
      background: '#EF4444',
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

export default function ResetPassword({ setSidebarOpen }) {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = async () => {
    // Validate inputs
    if (!passwords.current) {
      toastError('Current password is required');
      return;
    }
    
    if (!passwords.new) {
      toastError('New password is required');
      return;
    }

    if (passwords.new.length < 6) {
      toastError('New password must be at least 6 characters');
      return;
    }
    
    if (passwords.new !== passwords.confirm) {
      toastError('New passwords do not match!');
      return;
    }

    if (passwords.current === passwords.new) {
      toastError('New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      // First, try to sign in with current credentials to verify the current password
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.email) {
        toastError('Unable to verify user');
        setLoading(false);
        return;
      }

      // Try to re-authenticate with the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwords.current
      });

      if (signInError) {
        toastError('Current password is incorrect');
        setLoading(false);
        return;
      }

      // If current password is correct, update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (updateError) {
        toastError('Failed to update password', updateError.message);
        setLoading(false);
        return;
      }

      toastSuccess('Password changed', 'Your password has been successfully updated');
      
      setPasswords({
        current: '',
        new: '',
        confirm: ''
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error resetting password:', error);
      toastError('Failed to reset password', error.message || 'An error occurred');
      setLoading(false);
    }
  };

  // Handle Enter key press to submit form
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSave();
    }
  };

  return (
    <div className="flex-1 bg-white min-h-screen">
      {/* Navbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 md:px-8 h-[56px] flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <h1 className="text-base md:text-lg font-semibold text-stone-800 text-center flex-1 lg:text-left lg:flex-none">Reset password</h1>
        </div>

        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-stone-700" />
        </button>

        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-stone-800 text-white px-4 md:px-6 py-2 rounded-full text-xs font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl pb-20 lg:pb-8">
        <div className="space-y-6">
          {/* Current Password */}
          <div className="max-w-md">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Current password
            </label>
            <div className="relative">
              <input
                type={showPassword.current ? "text" : "password"}
                value={passwords.current}
                onChange={(e) => handleInputChange('current', e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="w-full px-4 py-3 pr-12 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 disabled:opacity-50"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors p-1"
              >
                {showPassword.current ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="max-w-md">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              New password
            </label>
            <div className="relative">
              <input
                type={showPassword.new ? "text" : "password"}
                value={passwords.new}
                onChange={(e) => handleInputChange('new', e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="w-full px-4 py-3 pr-12 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 disabled:opacity-50"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
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

          {/* Confirm New Password */}
          <div className="max-w-md">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Confirm new password
            </label>
            <div className="relative">
              <input
                type={showPassword.confirm ? "text" : "password"}
                value={passwords.confirm}
                onChange={(e) => handleInputChange('confirm', e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="w-full px-4 py-3 pr-12 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 disabled:opacity-50"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
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
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-4 py-3 z-20">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-stone-800 text-white py-3 rounded-full text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}