// Quick script to update all articles to Published status
// Run this in browser console on admin panel or debug page

const SUPABASE_URL = 'https://ireradbtbwybpvtpihvn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZXJhZGJ0Ynd5YnB2dHBwaHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNDA2MDcsImV4cCI6MjA3NjYxNjYwN30.o_JH5Aw7zhZ-wsC_husELuev6LCqI8gqpa4gz8oenD8';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Update all Draft articles to Published
(async () => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .update({ status: 'Published' })
      .eq('status', 'Draft');
    
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('✅ Updated articles:', data);
    }
  } catch (err) {
    console.error('Error:', err);
  }
})();
