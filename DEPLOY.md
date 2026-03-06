## Deploying Cashflow Tracker to Vercel

These steps assume the app is already working locally with your Supabase credentials in `.env`.

### 1. Commit your code and push to GitHub

1. Create a new repo on GitHub (for example `cashflow-tracker`).
2. In this project folder run (from a terminal):

```bash
git init
git add .
git commit -m "Initial cashflow tracker app"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2. Create a Vercel project

1. Go to [Vercel](https://vercel.com) and sign up with GitHub.
2. Click **Add New Project → Import** your GitHub repo.
3. Framework preset should auto-detect as **Vite** (or generic React).

### 3. Configure environment variables

In the Vercel project settings:

- Go to **Settings → Environment Variables**.
- Add:

  - `VITE_SUPABASE_URL` — your Supabase project URL  
  - `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key

Save the variables; Vercel will automatically use them on the next build.

### 4. Build & deploy

1. Trigger a deploy (either from the initial import or by pushing a new commit).
2. Wait for the build to finish. You should get a URL like `https://cashflow-tracker.vercel.app`.

### 5. Test on your phone

1. Open the Vercel URL on your phone.
2. Use the browser menu to **Add to Home Screen**.
3. Launch the app from your home screen for a full-screen PWA experience.

### 6. Changing env vars later

If you rotate your Supabase keys or change projects:

1. Update the values in Vercel **Environment Variables**.
2. Click **Redeploy** the latest build (or push a new commit).

