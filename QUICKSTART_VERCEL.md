# Quick Start: Deploy to Vercel in 5 Minutes

## 🚀 Fastest Path to Deployment

### Step 1: Push to Git (if not already)
```bash
git add .
git commit -m "Ready for deployment"
git push
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Click "Deploy" (Vercel auto-detects Next.js)

### Step 3: Add Environment Variables
After deployment, go to: **Project Settings → Environment Variables**

Add these (minimum required):
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then redeploy: **Deployments → ⋯ → Redeploy**

### Step 4: Update Supabase
Go to Supabase Dashboard → **Authentication → URL Configuration**

Add your Vercel URL:
```
Site URL: https://your-app.vercel.app
Redirect URLs: https://your-app.vercel.app/auth/callback
```

### ✅ Done!

Your app is now live at `https://your-app.vercel.app`

---

## 📖 Need More Details?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- CLI deployment
- Optional environment variables
- Troubleshooting
- Custom domains
- Monitoring

## 🔑 Where to Find Your Supabase Keys

1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to **Project Settings → API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
