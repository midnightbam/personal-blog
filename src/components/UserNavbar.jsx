import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, KeyRound, LogOut } from "lucide-react";

const UserNavbar = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationActive, setIsNotificationActive] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <nav className="bg-[#F9F8F6] border-b border-gray-200">
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-xl sm:text-2xl font-bold text-gray-900 hover:opacity-80 transition-opacity"
          >
            hh<span className="text-[#12B279]">.</span>
          </button>

          <div className="flex items-center gap-6">
            {/* ✅ New Notification Icon */}
            <button
              onClick={() => setIsNotificationActive(false)}
              className="relative"
            >
              <Bell className="w-6 h-6 text-gray-900 hover:text-gray-700 transition-colors" />
              {isNotificationActive && (
                <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* ✅ Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2"
              >
                <img
                  src="https://i.imgur.com/8Km9tLL.png" // sample avatar
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-gray-900 font-medium">Moodeng ja</span>
                <svg
                  className={`w-4 h-4 text-gray-700 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                    <User size={18} /> Profile
                  </button>
                  <button
                   onClick={() => (window.location.href = "/reset-password")}
                   className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#F3F2F1] transition-colors w-full text-gray-600 font-medium"
                    >
                  <KeyRound size={18} /> Reset password
                  </button>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut size={18} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
