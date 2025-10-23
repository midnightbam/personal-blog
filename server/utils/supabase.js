import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized');
} else {
  console.warn('⚠️  Warning: Supabase credentials not found. API routes will fail.');
}

export { supabase };

export const checkSupabase = (res) => {
  if (!supabase) {
    res.status(500).json({ success: false, error: 'Supabase not initialized' });
    return false;
  }
  return true;
};
