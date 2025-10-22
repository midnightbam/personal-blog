import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  KeyRound,
  LogOut,
  Menu,
  LayoutDashboard,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuthContext } from "../contexts/AuthContext";
import UserDisplay from "./UserDisplay";
import NotificationsPanel from "./NotificationsPanel"; // ✅ new import

const UserNavbar = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState({
    name: "User",
    username: "",
    avatar: "",
  });

  // ✅ Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (!error) setIsAdmin(data?.role === "admin");
      } catch (err) {
        console.error("Error checking admin:", err);
      }
    };
    checkAdminStatus();
  }, [user]);

  // ✅ Fetch user data + avatar
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      const emailInitial = user.email?.charAt(0).toUpperCase() || "U";
      const placeholderAvatar = `https://ui-avatars.com/api/?name=${emailInitial}&background=12B279&color=fff&size=200`;

      try {
        const { data } = await supabase
          .from("users")
          .select("name, username")
          .eq("id", user.id)
          .maybeSingle();

        let avatarUrl = placeholderAvatar;
        const { data: avatarData } = await supabase.storage
          .from("avatars")
          .list(user.id, {
            limit: 1,
            sortBy: { column: "created_at", order: "desc" },
          });

        if (avatarData?.length > 0) {
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(`${user.id}/${avatarData[0].name}`);
          avatarUrl = urlData?.publicUrl || placeholderAvatar;
        }

        setUserData({
          name: data?.name || user.email.split("@")[0],
          username: data?.username || user.email.split("@")[0],
          avatar: avatarUrl,
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
        setUserData({
          name: user.email.split("@")[0],
          username: user.email.split("@")[0],
          avatar: placeholderAvatar,
        });
      }
    };

    fetchUserData();
  }, [user]);

  // ✅ Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate("/profile");
  };

  const handleResetPasswordClick = () => {
    setIsDropdownOpen(false);
    navigate("/profile", { state: { activeTab: "reset" } });
  };

  const handleAdminPanelClick = () => {
    setIsDropdownOpen(false);
    navigate("/admin/dashboard");
  };

  return (
    <nav className="bg-[#F9F8F6] border-b border-gray-200">
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="text-xl sm:text-2xl font-bold text-gray-900 hover:opacity-80"
          >
            hh<span className="text-[#12B279]">.</span>
          </button>

          {/* 🖥️ Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {/* ✅ Notification panel replaced */}
            <NotificationsPanel userId={user?.id} />

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 hover:opacity-80"
              >
                <UserDisplay
                  user={userData}
                  showAvatar={true}
                  showUsername={false}
                  size="sm"
                />
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
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User size={18} /> Profile
                  </button>
                  <button
                    onClick={handleResetPasswordClick}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <KeyRound size={18} /> Reset password
                  </button>
                  {isAdmin && (
                    <>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleAdminPanelClick}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LayoutDashboard size={18} /> Admin panel
                      </button>
                    </>
                  )}
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut size={18} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 📱 Mobile */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <Menu className="w-6 h-6 text-gray-900" />
            </button>
          </div>
        </div>

        {/* 📱 Mobile Dropdown */}
        {isDropdownOpen && (
          <div className="md:hidden fixed left-0 right-0 top-[57px] bg-white border-b border-gray-200 shadow-lg z-40">
            <div className="px-4 py-4 flex items-center gap-3">
              <img
                src={
                  userData.avatar ||
                  `https://ui-avatars.com/api/?name=${userData.name?.charAt(0)}&background=12B279&color=fff&size=200`
                }
                alt={userData.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {userData.name}
                </p>
                {userData.username && (
                  <p className="text-xs text-gray-500">@{userData.username}</p>
                )}
              </div>

              {/* ✅ Reuse Notification Panel inside mobile */}
              <NotificationsPanel userId={user?.id} />
            </div>

            <hr className="border-gray-200" />

            <div className="py-2">
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              >
                <User size={18} /> Profile
              </button>
              <button
                onClick={handleResetPasswordClick}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              >
                <KeyRound size={18} /> Reset password
              </button>
              {isAdmin && (
                <button
                  onClick={handleAdminPanelClick}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <LayoutDashboard size={18} /> Admin panel
                </button>
              )}
            </div>

            <hr className="border-gray-200" />

            <div className="py-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              >
                <LogOut size={18} /> Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default UserNavbar;
