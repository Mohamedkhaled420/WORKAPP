# Deploying to Vercel

This guide will help you deploy your Next.js application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier works great)
2. Your Supabase project set up with schema and seed data
3. All required API keys ready

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended for first-time)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import your project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your Git repository
   - Vercel will auto-detect Next.js configuration

3. **Configure Environment Variables**
   
   In the Vercel dashboard, add these environment variables:
   
   **Required:**
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
   
   **Optional but recommended:**
   - `SUPABASE_SERVICE_ROLE_KEY` - For server-side operations
   - `OPENAI_API_KEY` - For AI features
   - `NEWSAPI_KEY` - For AI news feed
   
   > **Note:** You can find your Supabase credentials in:
   > Supabase Dashboard → Project Settings → API

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your app
   - You'll get a URL like `https://your-app.vercel.app`

5. **Update Supabase Auth Redirect URLs**
   
   Go to Supabase Dashboard → Authentication → URL Configuration:
   - Add your Vercel URL to **Redirect URLs**: `https://your-app.vercel.app/auth/callback`
   - Update **Site URL** to: `https://your-app.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? (default is fine)
   - In which directory is your code located? **./**
   - Want to override the settings? **N**

4. **Add Environment Variables**
   ```bash
   # Add each variable one by one
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add OPENAI_API_KEY
   vercel env add NEWSAPI_KEY
   ```
   
   For each command, you'll be prompted to:
   - Enter the value
   - Select environments (choose Production, Preview, and Development)

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

6. **Update Supabase Auth URLs** (same as Option 1, step 5)

## Post-Deployment Checklist

- ✅ App loads successfully at your Vercel URL
- ✅ Authentication works (sign up/sign in)
- ✅ Database queries work (dashboard loads data)
- ✅ AI features work (if API keys are configured)
- ✅ News feed loads (if NewsAPI key is configured)

## Continuous Deployment

Once connected to Git, Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

## Troubleshooting

### Build fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally to catch errors

### Environment variables not working
- Ensure variables are set for the correct environment (Production/Preview/Development)
- Redeploy after adding new variables
- Check variable names match exactly (including `NEXT_PUBLIC_` prefix)

### Authentication not working
- Verify Supabase redirect URLs include your Vercel domain
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Look at browser console for specific errors

### Database connection issues
- Verify Supabase is accessible from your Vercel deployment
- Check that schema.sql and seed.sql have been run in Supabase
- Ensure RLS policies are properly configured

## Custom Domain (Optional)

To add a custom domain:

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your domain
4. Update DNS records as instructed
5. Update Supabase redirect URLs with your custom domain

## Monitoring

Vercel provides:
- Real-time logs in the dashboard
- Analytics (on Pro plan)
- Performance insights
- Error tracking

Access logs: Project → Deployments → Select deployment → "Logs" tab

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
