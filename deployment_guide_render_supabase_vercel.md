# Deployment guide — Render + Supabase + Vercel

Final stack:
- **Backend (FastAPI):** Render, free tier, kept warm with an external cron ping
- **Database + image storage:** Supabase (Postgres + S3-compatible Storage, one free account)
- **Frontend (React/Next.js):** Vercel, free tier

Cost: **$0/month**, with a documented, low-effort path off any of these later
if you outgrow the free tiers.

---

## 1. Set up Supabase (database + storage)

1. Go to supabase.com → New Project. Note down the **Project URL**,
   **anon/public key**, and the **Postgres connection string** (Settings → Database).
2. Run your existing Alembic migrations against this connection string
   to create the schema:
   ```bash
   export DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
   alembic upgrade head
   ```
3. Storage → Create two buckets:
   - `medicine-images` (public — product photos)
   - `prescription-uploads` (private — user-uploaded photos)
4. This replaces the separate object-storage step from earlier — your
   backend now points at Supabase Storage instead of local disk/S3
   directly for image uploads.

---

## 2. Deploy the backend to Render

1. Push your FastAPI repo to GitHub if it isn't already.
2. Render dashboard → New → Web Service → connect your repo.
3. Build command: `pip install -r requirements.txt`
   Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables (Render dashboard → Environment):
   ```
   DATABASE_URL=<your Supabase connection string>
   SUPABASE_URL=<your Supabase project URL>
   SUPABASE_KEY=<your Supabase anon/service key>
   GOOGLE_CLIENT_ID=<from Google Cloud Console>
   JWT_SECRET=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
   ```
5. Deploy. Render gives you a live HTTPS URL like `https://your-api.onrender.com`.
6. Add a lightweight health check route if you don't have one:
   ```python
   @app.get("/health")
   def health():
       return {"status": "ok"}
   ```

### Keep it warm (avoid cold starts)

Render's free web services sleep after 15 minutes of inactivity. To
avoid the 30-60 second cold start on first request:

1. Sign up at **cron-job.org** or **UptimeRobot** (both free).
2. Create a job/monitor that hits `https://your-api.onrender.com/health`
   every 10-12 minutes.
3. This is an unofficial workaround (not a Render-supported feature) but
   widely used and reliable in practice. If it ever stops working well,
   moving to Render's paid tier or Railway removes the need for it —
   no app code changes required either way.

---

## 3. Deploy the frontend to Vercel

1. Push your frontend repo to GitHub.
2. vercel.com → New Project → import the repo. Vercel auto-detects
   Next.js/React and configures the build.
3. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.onrender.com
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=<same Client ID as backend>
   ```
4. Deploy. Vercel gives you a live URL like `https://your-app.vercel.app`.

---

## 4. Update Google Cloud Console for production

1. Go back to your OAuth Client ID (APIs & Services → Credentials).
2. Add to **Authorized JavaScript origins**:
   ```
   https://your-app.vercel.app
   ```
3. If your OAuth consent screen is still in **Testing** mode, only
   Gmail addresses added as **Test users** can sign in — add any family
   members trying it before you move to Production. Moving to
   Production is free but triggers a short Google review since you're
   requesting the `email`/`profile` scopes.

---

## 5. Verify end to end

- [ ] Open the Vercel URL on a laptop — sign in with Google works
- [ ] Open the same URL on a phone and tablet — layout reflows correctly
      (sidebar → bottom nav, card grid → single column)
- [ ] Add a medicine with an image — confirm it lands in the correct
      Supabase Storage bucket
- [ ] Confirm `created_by` / activity log shows the correct signed-in
      email after adding a medicine
- [ ] Wait 20+ minutes without activity, then load the app again —
      confirm the keep-alive cron is preventing a long cold start
- [ ] Deactivate a medicine — confirm it moves to the inactive tab, not deleted

---

## 6. If you ever need to migrate off this stack

- **Database:** Supabase is plain Postgres — `pg_dump` your database and
  restore it to any other Postgres host (Neon, Railway, self-hosted).
  No data transformation needed.
- **Storage:** Supabase Storage speaks the S3 protocol — any S3-compatible
  tool (AWS CLI, rclone, Cyberduck) can copy your buckets to AWS S3,
  MinIO, or elsewhere.
- **Backend:** move from Render to Railway/Fly.io by pointing the same
  Docker/build config at the new platform — no code changes.
- **Frontend:** Vercel deployments are just a git-connected build —
  moving to Netlify/Cloudflare Pages is a re-import, not a rewrite.

None of this stack locks you in — every piece is swappable independently
if you outgrow the free tier or want different tradeoffs later.
