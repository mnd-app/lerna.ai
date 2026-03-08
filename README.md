# lerna.ai

AI-powered study platform built with Next.js App Router and Tailwind CSS.

Current first working flow:

1. Open `/upload`
2. Paste notes or upload a `.txt` file
3. Get a simple AI explanation

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
# Optional:
# GEMINI_MODEL=gemini-2.5-flash

# Auth token signing secret (set your own long random value)
AUTH_SECRET=replace_with_a_long_random_secret

# OAuth providers (Google + Discord implemented)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
```

3. Start dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Routes

- `/` Landing page
- `/dashboard` Feature dashboard
- `/upload` Upload notes and get explanation
- `/api/explain` API route that calls Gemini
