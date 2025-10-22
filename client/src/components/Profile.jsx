import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Lock, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast as sonnerToast } from "sonner";

// Custom toast function
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

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    avatar: "",
  });

  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "profile");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      setDataLoading(true);
      
      if (!user) {
        return;
      }

      // Fetch user profile from users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('name, username')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error fetching profile:", profileError);
      }

      // Get first letter of email for placeholder
      const emailInitial = user.email ? user.email.charAt(0).toUpperCase() : "U";
      const placeholderAvatar = `https://ui-avatars.com/api/?name=${emailInitial}&background=12B279&color=fff&size=200`;

      // Try to get avatar from avatars bucket
      let avatarUrl = placeholderAvatar;
      try {
        const { data: avatarData } = await supabase
          .storage
          .from('avatars')
          .list(user.id, {
            limit: 1,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (avatarData && avatarData.length > 0) {
          const { data } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(`${user.id}/${avatarData[0].name}`);
          
          if (data?.publicUrl) {
            avatarUrl = data.publicUrl;
          }
        }
      } catch (error) {
        console.error("Error fetching avatar:", error);
      }

      setFormData({
        name: profile?.name || "",
        username: profile?.username || "",
        email: user.email || "",
        avatar: avatarUrl,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (user) {
        const emailInitial = user.email ? user.email.charAt(0).toUpperCase() : "U";
        const placeholderAvatar = `https://ui-avatars.com/api/?name=${emailInitial}&background=12B279&color=fff&size=200`;
        
        setFormData({
          name: "",
          username: "",
          email: user.email || "",
          avatar: placeholderAvatar,
        });
      }
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  // Fetch user data on component mount
  useEffect(() => {
    if (!authLoading && user) {
      fetchUserProfile();
    } else if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, fetchUserProfile, navigate]);

  const validateUsername = (username) => {
    if (!username) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters";
    if (username.length > 30) return "Username must be at most 30 characters";
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return "Username can only contain letters, numbers, hyphens, and underscores";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear username error when user types
    if (name === "username") {
      setUsernameError("");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingAvatar(true);

      // Upload to avatars bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      setFormData({ ...formData, avatar: data.publicUrl });
      toastSuccess("Avatar uploaded successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toastError(error.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toastError("Name is required");
      return;
    }

    // Validate username
    const usernameValidationError = validateUsername(formData.username);
    if (usernameValidationError) {
      setUsernameError(usernameValidationError);
      toastError(usernameValidationError);
      return;
    }

    try {
      setLoading(true);
      if (!user) throw new Error("No user logged in");

      // Update user profile
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          username: formData.username,
        })
        .eq('id', user.id);

      if (error) {
        // Check if it's a unique constraint error
        if (error.code === '23505') {
          setUsernameError("This username is already taken");
          toastError("This username is already taken");
        } else {
          throw error;
        }
        return;
      }

      toastSuccess("Profile saved successfully", "Your profile has been successfully updated");
    } catch (error) {
      console.error("Error updating profile:", error);
      toastError(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
    setPasswordError("");
  };

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
      setPasswordError(
        "New password must be at least 6 characters and contain letters and numbers"
      );
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      setPasswordSuccess("Password updated successfully!");
      toastSuccess("Password updated successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError(error.message || "Failed to update password");
      toastError("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const tabTitle = activeTab === "profile" ? "Profile" : "Reset password";

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-73px)] bg-[#F9F8F6] flex flex-col">
      {/* Mobile Layout */}
      <div className="md:hidden w-full flex flex-col">
        {/* Mobile Top tabs with Back Button */}
        <div className="flex items-center justify-between border-b border-gray-300 pb-2 mb-3 px-4 pt-3 w-full">
          <button
            onClick={() => navigate("/")}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-gray-900" />
          </button>
          
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                activeTab === "profile"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <User size={16} />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("reset")}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                activeTab === "reset"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Lock size={16} />
              Reset password
            </button>
          </div>
          
          <div className="w-8"></div>
        </div>

        {/* Mobile Header */}
        <div className="flex items-center gap-2 mb-3 px-4">
          <img
            src={formData.avatar}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            onError={(e) => {
              const emailInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U";
              e.target.src = `https://ui-avatars.com/api/?name=${emailInitial}&background=12B279&color=fff&size=200`;
            }}
          />
          <p className="text-lg font-semibold text-gray-900">{formData.name || "User"}</p>
          <p className="text-sm font-medium text-gray-900 ml-2">{tabTitle}</p>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 w-full px-4 py-6">
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <img
                  src={formData.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                  onError={(e) => {
                    const emailInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U";
                    e.target.src = `https://ui-avatars.com/api/?name=${emailInitial}&background=12B279&color=fff&size=200`;
                  }}
                />
                <label
                  htmlFor="avatar"
                  className="mt-3 px-4 py-2 border border-gray-400 rounded-full text-sm font-medium text-gray-800 bg-white cursor-pointer hover:bg-gray-50 transition disabled:opacity-50"
                  style={{
                    pointerEvents: uploadingAvatar ? "none" : "auto",
                    opacity: uploadingAvatar ? 0.5 : 1
                  }}
                >
                  {uploadingAvatar ? "Uploading..." : "Upload profile picture"}
                </label>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </div>

              <hr className="border-gray-300" />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-500 text-sm"
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none text-sm ${
                    usernameError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-500'
                  }`}
                  placeholder="Enter your username"
                />
                {usernameError && (
                  <p className="text-xs text-red-600">{usernameError}</p>
                )}
                <p className="text-xs text-gray-500">
                  3-30 characters, letters, numbers, hyphens, and underscores only
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 text-sm"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || uploadingAvatar}
                className="w-full py-2 bg-[#26231E] text-white rounded-full hover:bg-[#3d3832] transition text-sm font-medium mt-4 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          )}

          {activeTab === "reset" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Current password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full h-12 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-500 text-base"
                  placeholder="Current password"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  New password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full h-12 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-500 text-base"
                  placeholder="New password"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Must be at least 6 characters with letters and numbers
                </p>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Confirm new password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full h-12 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-500 text-base"
                  placeholder="Confirm new password"
                />
              </div>

              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-base">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-base">
                  {passwordSuccess}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#26231E] text-white rounded-full hover:bg-[#3d3832] transition text-base font-medium disabled:opacity-50 mt-4"
                disabled={loading}
              >
                {loading ? "Updating..." : "Reset password"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex md:flex-col md:w-full md:px-4 sm:px-8 md:pt-10 md:pb-20 md:justify-center md:items-center">
        {/* Desktop Header */}
        <div className="flex items-center gap-3 mb-8 w-full max-w-5xl">
          <img
            src={formData.avatar}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            onError={(e) => {
              const emailInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U";
              e.target.src = `https://ui-avatars.com/api/?name=${emailInitial}&background=12B279&color=fff&size=200`;
            }}
          />
          <p className="text-lg font-semibold text-gray-900">{formData.name || "User"}</p>
          <div className="border-l border-gray-300 h-6 mx-3"></div>
          <p className="text-lg font-semibold text-gray-900">{tabTitle}</p>
        </div>

        {/* Desktop Content Area */}
        <div className="flex gap-10 w-full max-w-5xl">
          {/* Desktop Tabs - Left sidebar */}
          <div className="flex flex-col gap-4 w-40 flex-shrink-0">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 text-sm font-medium transition-colors ${
                activeTab === "profile"
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <User size={18} />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("reset")}
              className={`flex items-center gap-3 text-sm font-medium transition-colors ${
                activeTab === "reset"
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Lock size={18} />
              Reset password
            </button>
          </div>

          {/* Desktop Main Content */}
          <div className="flex-1">
            <div className="bg-[#EFEEEB] rounded-xl shadow-sm p-8 w-full">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <img
                      src={formData.avatar}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                      onError={(e) => {
                        const emailInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U";
                        e.target.src = `https://ui-avatars.com/api/?name=${emailInitial}&background=12B279&color=fff&size=200`;
                      }}
                    />
                    <label
                      htmlFor="avatar-desktop"
                      className="mt-3 px-4 py-2 border border-gray-400 rounded-full text-sm font-medium text-gray-800 cursor-pointer hover:bg-gray-100 transition disabled:opacity-50"
                      style={{
                        pointerEvents: uploadingAvatar ? "none" : "auto",
                        opacity: uploadingAvatar ? 0.5 : 1
                      }}
                    >
                      {uploadingAvatar ? "Uploading..." : "Upload profile picture"}
                    </label>
                    <input
                      id="avatar-desktop"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                  </div>

                  <hr className="border-gray-300" />

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-500 text-sm"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none text-sm ${
                        usernameError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-500'
                      }`}
                      placeholder="Enter your username"
                    />
                    {usernameError && (
                      <p className="text-xs text-red-600">{usernameError}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      3-30 characters, letters, numbers, hyphens, and underscores only
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || uploadingAvatar}
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-[#26231E] text-white rounded-full hover:bg-[#3d3832] transition text-sm font-medium disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              )}

              {activeTab === "reset" && (
                <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
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
                      placeholder="Current password"
                    />
                  </div>

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
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 6 characters with letters and numbers
                    </p>
                  </div>

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
                    className="px-6 py-2 bg-[#26231E] text-white rounded-full hover:bg-[#3d3832] transition text-sm font-medium disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Reset password"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}