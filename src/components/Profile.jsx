import React, { useState } from "react";
import { User, Lock } from "lucide-react";

export default function Profile() {
  const [formData, setFormData] = useState({
    name: "Moodeng ja",
    username: "moodeng.cute",
    email: "moodeng.cute@gmail.com",
    avatar: "https://i.imgur.com/8Km9tLL.png",
  });

  const [showAlert, setShowAlert] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, avatar: imageUrl });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saved profile data:", formData);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
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

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordForm.currentPassword) {
      setPasswordError("Please enter your current password");
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

    setLoading(true);
    setTimeout(() => {
      setPasswordSuccess("Password updated successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setLoading(false);
    }, 1000);
  };

  const tabTitle = activeTab === "profile" ? "Profile" : "Reset password";

  return (
    <div className="relative min-h-[calc(100vh-73px)] bg-[#F9F8F6] flex flex-col">
      {showAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#22C55E] text-white px-6 py-3 rounded-lg shadow-md text-sm font-medium text-center z-50">
          <p className="font-semibold">Saved profile</p>
          <p>Your profile has been successfully updated</p>
        </div>
      )}

      {/* Mobile Layout */}
      <div className="md:hidden w-full flex flex-col">
        {/* Mobile Top tabs */}
        <div className="flex justify-center gap-6 border-b border-gray-300 pb-2 mb-3 px-4 pt-3 w-full">
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

        {/* Mobile Header */}
        <div className="flex items-center gap-2 mb-3 px-4">
          <img
            src={formData.avatar}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <p className="text-lg font-semibold text-gray-900">{formData.name}</p>
          <p className="text-sm font-medium text-gray-900 ml-2">{tabTitle}</p>
        </div>

        {/* Mobile Content - Full screen form */}
        <div className="flex-1 w-full px-4 py-6">
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <img
                  src={formData.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <label
                  htmlFor="avatar"
                  className="mt-3 px-4 py-2 border border-gray-400 rounded-full text-sm font-medium text-gray-800 bg-white cursor-pointer hover:bg-gray-50 transition"
                >
                  Upload profile picture
                </label>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
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
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-500 text-sm"
                />
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
                className="w-full py-2 bg-[#26231E] text-white rounded-full hover:bg-[#3d3832] transition text-sm font-medium mt-4"
              >
                Save
              </button>
            </div>
          )}

          {activeTab === "reset" && (
            <div className="space-y-5">
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
                  placeholder="Enter current password"
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
                onClick={handlePasswordSubmit}
                className="w-full py-3 bg-[#26231E] text-white rounded-full hover:bg-[#3d3832] transition text-base font-medium disabled:opacity-50 mt-4"
                disabled={loading}
              >
                {loading ? "Updating..." : "Reset password"}
              </button>
            </div>
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
          />
          <p className="text-lg font-semibold text-gray-900">{formData.name}</p>
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
            {/* Form Container */}
            <div className="bg-[#EFEEEB] rounded-xl shadow-sm p-8 w-full">
              {activeTab === "profile" && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col items-center">
                    <img
                      src={formData.avatar}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                    <label
                      htmlFor="avatar"
                      className="mt-3 px-4 py-2 border border-gray-400 rounded-full text-sm font-medium text-gray-800 cursor-pointer hover:bg-gray-100 transition"
                    >
                      Upload profile picture
                    </label>
                    <input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
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
                      className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-gray-500 text-sm"
                    />
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
                    className="px-6 py-2 bg-[#26231E] text-white rounded-full hover:bg-[#3d3832] transition text-sm font-medium"
                  >
                    Save
                  </button>
                </form>
              )}

              {activeTab === "reset" && (
                <div className="space-y-5 max-w-md">
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
                      placeholder="Enter current password"
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
                    onClick={handlePasswordSubmit}
                    className="px-6 py-2 bg-[#26231E] text-white rounded-full hover:bg-[#3d3832] transition text-sm font-medium disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Reset password"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}