# Production Deployment Guide

## 1) Supabase Setup

1. Create a Supabase project.
2. Go to SQL editor and run [supabase/schema.sql](../supabase/schema.sql).
3. In Authentication, keep email/password enabled.
4. Copy project URL and anon key from project settings.

## 2) Frontend Environment

Set these variables in local `.env` and Vercel/Netlify:

- `VITE_USE_SUPABASE=true`
- `VITE_SUPABASE_URL=...`
- `VITE_SUPABASE_ANON_KEY=...`

## 3) Build and Run

```bash
npm install
npm run build
npm run preview
```

## 4) Vercel Deployment

1. Import repository to Vercel.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add the same environment variables.
5. Deploy and connect custom domain from Vercel dashboard.

## 5) Realtime Checks

- Create/update attendance sheet in one browser tab.
- Open another tab with the same class and verify updates appear automatically.
- Verify announcements and notifications update without refresh.
