// src/services/imageUploadService.js
import { supabase } from '../lib/supabase';

export const imageUploadService = {
  // Upload user profile avatar
  uploadProfileAvatar: async (file, userId) => {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      if (!userId) {
        throw new Error('User ID is required');
      }

      console.log('Uploading profile avatar for user:', userId);

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', data);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;
      console.log('Public URL:', publicUrl);

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        throw updateError;
      }

      console.log('User profile updated with avatar URL');
      return publicUrl;
    } catch (error) {
      console.error('Error uploading profile avatar:', error);
      throw error;
    }
  },

  // Upload article thumbnail
  uploadArticleThumbnail: async (file, articleId) => {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      console.log('Uploading article thumbnail');

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${articleId || Date.now()}-${Date.now()}.${fileExt}`;
      const filePath = `articles/${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', data);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;
      console.log('Public URL:', publicUrl);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading article thumbnail:', error);
      throw error;
    }
  },

  // Delete file from storage
  deleteFile: async (filePath, bucket) => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('File deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },
};

export default imageUploadService;