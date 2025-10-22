import React from "react";
import { User, KeyRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const UserSidebar = ({ avatar, name }) => {
  const location = useLocation();

  return (
    <div className="w-full md:w-1/3 bg-transparent space-y-4">
      <div className="flex items-center gap-3">
        <img
          src={avatar || "https://i.imgur.com/8Km9tLL.png"}
          alt="Avatar"
          className="w-16 h-16 rounded-full object-cover"
        />
        <h2 className="text-lg font-semibold text-gray-900">{name || "User"}</h2>
      </div>

      <div className="mt-6 space-y-2 text-gray-700">
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-4 py-2 rounded-md w-full font-medium ${
            location.pathname === "/profile"
              ? "bg-[#EFEEEB] text-gray-900"
              : "hover:bg-[#F3F2F1] text-gray-600"
          }`}
        >
          <User size={18} /> Profile
        </Link>

        <Link
          to="/reset-password"
          className={`flex items-center gap-3 px-4 py-2 rounded-md w-full font-medium ${
            location.pathname === "/reset-password"
              ? "bg-[#EFEEEB] text-gray-900"
              : "hover:bg-[#F3F2F1] text-gray-600"
          }`}
        >
          <KeyRound size={18} /> Reset password
        </Link>
      </div>
    </div>
  );
};

export default UserSidebar;
