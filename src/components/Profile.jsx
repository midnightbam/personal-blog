import React, { useState } from "react";
import UserSidebar from "./UserSidebar";

const Profile = () => {
  const [formData, setFormData] = useState({
    name: "Moodeng ja",
    username: "moodeng.cute",
    email: "moodeng.cute@gmail.com",
    avatar: "https://i.imgur.com/8Km9tLL.png",
  });

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
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#F9F8F6] flex justify-center items-start px-4 sm:px-8 pt-10 pb-20">
      <div className="flex flex-col md:flex-row gap-10 w-full max-w-5xl">
        <UserSidebar avatar={formData.avatar} name={formData.name} />

        <div className="flex-1 bg-[#EFEEEB] rounded-xl shadow-sm p-8">
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
        </div>
      </div>
    </div>
  );
};

export default Profile;
