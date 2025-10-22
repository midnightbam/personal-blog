# ⚠️ IMPORTANT: Set Vercel Environment Variables

Your API endpoints are now fixed and ready, but they need environment variables in Vercel to work!

## What Changed

✅ All API endpoints now check for both:
- `SUPABASE_URL` (preferred for serverless)
- `VITE_SUPABASE_URL` (fallback)

## How to Fix the "Cannot GET /api/posts" Error

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Select your `personal-blog` project

### Step 2: Add Environment Variables
1. Click **Settings** → **Environment Variables**
2. Add these three variables:

```
SUPABASE_URL = https://ireradbtbwybpvtpihvn.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZXJhZGJ0Ynd5YnB2dHBpaHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNDA2MDcsImV4cCI6MjA3NjYxNjYwN30.o_JH5Aw7zhZ-wsC_husELuev6LCqI8gqpa4gz8oenD8
CORS_ORIGIN = https://yourapp.vercel.app
```

**Important:** Replace `https://yourapp.vercel.app` with your actual Vercel URL!

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click the three dots on the latest deployment
3. Click **Redeploy**

Or redeploy from GitHub:
```bash
git add .
git commit -m "Fix API environment variables"
git push
```

---

## What Each Variable Does

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Your Supabase project URL (for serverless functions) |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous key (for database access) |
| `CORS_ORIGIN` | Allows requests from your Vercel domain |

---

## Test Your API After Setting Variables

Once redeployed, test in your browser:

```
https://yourapp.vercel.app/api/health
https://yourapp.vercel.app/api/posts
https://yourapp.vercel.app/api/categories
```

Should return JSON data instead of "Cannot GET" error!

---

## Why This Was Needed

- **Vercel serverless functions** run independently on the server
- They need explicit environment variables to access Supabase
- Client-side `VITE_` variables don't work in serverless functions
- The API code now checks both, so it works everywhere

---

## Troubleshooting

**Still getting "Cannot GET /api/posts"?**
1. ✅ Verify environment variables are set in Vercel
2. ✅ Check that you hit "Redeploy" after adding variables
3. ✅ Wait 2-3 minutes for Vercel to rebuild
4. ✅ Check Vercel logs (Deployments → View logs)

**Getting 500 error?**
- Check Vercel function logs
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Look for error messages in deployment logs

---

## Summary

Your code is fixed! Now just:
1. Add 3 environment variables in Vercel
2. Redeploy
3. APIs work! ✅
