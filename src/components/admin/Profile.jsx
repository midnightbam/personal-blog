import React, { useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
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

export default function Profile({ onBack }) {
  const [profileData, setProfileData] = useState({
    name: 'Thompson P.',
    username: 'thompson',
    email: 'thompson.p@gmail.com',
    bio: 'I am a pet enthusiast and freelance writer who specializes in animal behavior and care. With a deep love for cats, I enjoy sharing insights on feline companionship and wellness.\n\nWhen i\'m not writing, I spends time volunteering at my local animal shelter, helping cats find loving homes.',
    profilePicture: null
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileData(prev => ({
          ...prev,
          profilePicture: event.target?.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      toastSuccess('Profile saved', 'Your profile has been successfully updated');
      setIsSaving(false);
    }, 500);
  };

  return (
    <div className="flex-1 bg-stone-100 min-h-screen">
      {/* Navbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-8 h-[56px] flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="text-stone-600 hover:text-stone-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-stone-800">Profile</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-stone-800 text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-8 py-4">
        <div className="bg-stone-100 p-8 max-w-2xl">
          {/* Profile Picture Section */}
          <div className="mb-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-400 overflow-hidden flex items-center justify-center">
                  {profileData.profilePicture ? (
                    <img 
                      src={profileData.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-semibold text-yellow-700">TP</span>
                  )}
                </div>
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                />
                <span className="inline-block px-4 py-2 border border-stone-300 rounded-full text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors">
                  Upload profile picture
                </span>
              </label>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-stone-200 my-8"></div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Bio (max 120 letters)
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value.slice(0, 120))}
                maxLength={120}
                rows={6}
                className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 resize-none"
              />
              <p className="text-xs text-stone-500 mt-1">
                {profileData.bio.length}/120 characters
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}