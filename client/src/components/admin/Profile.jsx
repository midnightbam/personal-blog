// src/components/admin/Profile.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Menu } from 'lucide-react';
import { toast as sonnerToast } from "sonner";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

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

export default function Profile({ setSidebarOpen }) {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    email: '',
    bio: '',
    profilePicture: null
  });

  const [isSaving, setIsSaving] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [originalUsername, setOriginalUsername] = useState('');

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, username, email, bio')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user data:', error);
        return;
      }

      // Get avatar
      let avatarUrl = null;
      try {
        const { data: avatarData } = await supabase.storage
          .from('avatars')
          .list(user.id, {
            limit: 1,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (avatarData && avatarData.length > 0) {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(`${user.id}/${avatarData[0].name}`);
          
          if (urlData?.publicUrl) {
            avatarUrl = urlData.publicUrl;
          }
        }
      } catch (err) {
        console.error('Error fetching avatar:', err);
      }

      setProfileData({
        name: data?.name || '',
        username: data?.username || '',
        email: data?.email || user.email,
        bio: data?.bio || '',
        profilePicture: avatarUrl
      });
      setOriginalUsername(data?.username || '');
    } catch (err) {
      console.error('Error:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();

    // Set up real-time subscription for profile changes
    if (user?.id) {
      const channel = supabase
        .channel('admin-profile-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${user.id}`
          },
          async (payload) => {
            console.log('Profile updated in real-time:', payload);
            // Refetch data when profile is updated
            await fetchUserData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchUserData]);

  // Username validation
  const validateUsername = (username) => {
    if (!username) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters";
    if (username.length > 30) return "Username must be at most 30 characters";
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return "Username can only contain letters, numbers, hyphens, and underscores";
    }
    return "";
  };

  // Check username availability
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (!profileData.username || 
          profileData.username === originalUsername || 
          validateUsername(profileData.username)) {
        return;
      }

      setCheckingUsername(true);
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('username', profileData.username)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking username:', error);
          return;
        }

        if (data) {
          setUsernameError("This username is already taken");
        } else {
          setUsernameError("");
        }
      } catch (error) {
        console.error('Error checking username:', error);
      } finally {
        setCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkUsernameAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [profileData.username, originalUsername]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'username') {
      setUsernameError('');
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      // Update avatar_url in users table
      await supabase
        .from('users')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);

      setProfileData(prev => ({
        ...prev,
        profilePicture: data.publicUrl
      }));
      
      toastSuccess("Profile picture uploaded");
    } catch (error) {
      console.error("Error uploading:", error);
      toastError("Failed to upload profile picture");
    }
  };

  const handleSave = async () => {
    // Validate username
    const usernameValidationError = validateUsername(profileData.username);
    if (usernameValidationError) {
      setUsernameError(usernameValidationError);
      toastError(usernameValidationError);
      return;
    }

    if (usernameError) {
      toastError("Please fix the errors before saving");
      return;
    }

    setIsSaving(true);
    console.log('💾 Saving profile changes...');
    const startTime = performance.now();

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          username: profileData.username,
          bio: profileData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        if (error.code === '23505') {
          setUsernameError("This username is already taken");
          toastError("This username is already taken");
        } else {
          throw error;
        }
        return;
      }

      const endTime = performance.now();
      console.log(`✅ Profile saved in ${(endTime - startTime).toFixed(2)}ms`);

      setOriginalUsername(profileData.username);
      toastSuccess('Profile saved', 'Your profile has been successfully updated');
      
      // Immediately refresh to ensure sync
      await fetchUserData();
    } catch (error) {
      console.error('Error saving:', error);
      toastError('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="flex-1 bg-white min-h-screen"
      onKeyDown={(e) => {
        // Ctrl+S or Cmd+S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          handleSave();
        }
      }}
    >
      {/* Navbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 md:px-8 h-[56px] flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <h1 className="text-base md:text-lg font-semibold text-stone-800 text-center flex-1 lg:text-left lg:flex-none">Profile</h1>
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
            disabled={isSaving || checkingUsername || !!usernameError}
            className="bg-stone-800 text-white px-4 md:px-6 py-2 rounded-full text-xs font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl pb-20 lg:pb-8">
        {/* Profile Picture Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-400 overflow-hidden flex items-center justify-center">
                {profileData.profilePicture ? (
                  <img 
                    src={profileData.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${profileData.name?.charAt(0) || 'U'}&background=12B279&color=fff&size=200`;
                    }}
                  />
                ) : (
                  <span className="text-2xl font-semibold text-yellow-700">
                    {profileData.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
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
              <span className="inline-block px-4 md:px-6 py-2.5 border border-stone-300 rounded-full text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors">
                Upload profile picture
              </span>
            </label>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-200 my-6 md:my-8"></div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Name */}
          <div className="max-w-md">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400"
              placeholder="Enter your name"
            />
          </div>

          {/* Username */}
          <div className="max-w-md">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`w-full px-4 py-3 bg-white border rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none ${
                  usernameError ? 'border-red-500 focus:border-red-500' : 'border-stone-300 focus:border-stone-400'
                }`}
                placeholder="Enter your username"
              />
              {checkingUsername && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                </div>
              )}
            </div>
            {usernameError && (
              <p className="text-xs text-red-600 mt-1">{usernameError}</p>
            )}
            {!usernameError && profileData.username && profileData.username !== originalUsername && !checkingUsername && validateUsername(profileData.username) === "" && (
              <p className="text-xs text-green-600 mt-1">Username is available</p>
            )}
            <p className="text-xs text-stone-500 mt-1">
              3-30 characters, letters, numbers, hyphens, and underscores only
            </p>
          </div>

          {/* Email */}
          <div className="max-w-md">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className="w-full px-4 py-3 bg-gray-100 border border-stone-200 rounded-lg text-sm text-stone-500"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Bio (max 120 characters)
            </label>
            <textarea
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value.slice(0, 120))}
              maxLength={120}
              rows={8}
              className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400 resize-none"
              placeholder="Tell us about yourself..."
            />
            <p className="text-xs text-stone-500 mt-1">
              {profileData.bio.length}/120 characters
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-4 py-3 z-20">
        <button
          onClick={handleSave}
          disabled={isSaving || checkingUsername || !!usernameError}
          className="w-full bg-stone-800 text-white py-3 rounded-full text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}