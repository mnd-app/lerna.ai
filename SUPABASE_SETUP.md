# Supabase Setup

## 1. Create the schema

In the Supabase SQL editor, run:

`supabase/schema.sql`

## 2. Add environment variables

Set these in your local `.env.local` and in Vercel project settings:

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SECRET_KEY=YOUR_SECRET_KEY
```

If your dashboard still shows the older legacy API keys, `SUPABASE_SERVICE_ROLE_KEY` also works.

## 3. Deploy

After the variables are set, redeploy the app.

## Notes

- The app keeps the current cookie/session system.
- Auth, email verification state, upload usage, and study sets will use Supabase when the two variables above are present.
- Without those variables, the app falls back to the local JSON files in `data/`.
