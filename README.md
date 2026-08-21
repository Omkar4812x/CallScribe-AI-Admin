# CallScribe AI Admin

> AI-powered call transcript analysis for US solo consultants and small agencies.  
> Built with Next.js 14 (App Router) · TypeScript · Prisma · NextAuth · Stripe (stub)

---

## What It Does

Paste a Zoom or Google Meet transcript and instantly get:
- 📝 **Bullet-point summary**
- ✅ **Action items** with owner and due date
- 📧 **Draft follow-up email** ready to copy-paste

Organize notes by client and manage everything from a clean dashboard.

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm or pnpm

### 1. Install dependencies

```bash
cd callscribe-ai-admin
npm install
```

### 2. Install ts-node (needed for seed script)

```bash
npm install -D ts-node
```

### 3. Set up the database

The app uses **SQLite by default** — no cloud DB needed to run locally.

```bash
npx prisma generate     # Generate Prisma client
npx prisma db push      # Create database tables
```

### 4. Seed demo data (optional)

```bash
npm run db:seed
```

This creates:
- **Login:** `demo@callscribe.ai` / `password123`
- 2 sample clients
- 3 sample call notes with AI content

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you're live!

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | DB connection string | ✅ Yes |
| `NEXTAUTH_SECRET` | Random secret for JWT signing | ✅ Yes |
| `NEXTAUTH_URL` | App base URL | ✅ Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key (test mode) | Optional |
| `OPENAI_API_KEY` | OpenAI API key | Optional |
| `GEMINI_API_KEY` | Google Gemini API key | Optional |

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

---

## Connecting to PostgreSQL

When you're ready to move off SQLite (e.g., for Vercel deployment):

### 1. Update `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"   # ← change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 2. Set DATABASE_URL

| Provider | Free Tier | Connection String Format |
|---|---|---|
| **Neon** | ✅ Yes | `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| **Supabase** | ✅ Yes | `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres` |
| **Railway** | ✅ Yes (limited) | `postgresql://postgres:[PASSWORD]@[HOST].railway.app:[PORT]/railway` |

### 3. Push schema & seed

```bash
npx prisma db push
npm run db:seed
```

---

## Connecting a Real AI Provider

The AI is currently **mocked** in `lib/ai.ts`. To connect a real provider:

### Option A: OpenAI GPT-4

```bash
npm install openai
```

In `.env.local`:
```
OPENAI_API_KEY=sk-...
```

In `lib/ai.ts`, replace the mock body with:
```typescript
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content: "You are an expert meeting summarizer. Return JSON with keys: summary (string), actionItems (array of {task, owner, dueDate}), emailDraft (string).",
    },
    { role: "user", content: `Transcript:\n\n${transcript}` },
  ],
  response_format: { type: "json_object" },
});

return JSON.parse(completion.choices[0].message.content!);
```

### Option B: Google Gemini

```bash
npm install @google/generative-ai
```

In `.env.local`:
```
GEMINI_API_KEY=AIza...
```

See the [Gemini SDK docs](https://ai.google.dev/gemini-api/docs/quickstart?lang=node) for the equivalent call.

---

## Connecting Stripe (Test Payments)

Stripe is fully implemented for test mode. To go live locally:

### 1. Create your test product
1. Sign in to [Stripe Dashboard](https://dashboard.stripe.com/test/products) (test mode)
2. Create a Product → Add a Price (e.g., $29/month recurring)
3. Copy the **Price ID** (starts with `price_...`)

### 2. Update environment variables
Create these in your `.env.local`:
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRO_PRICE_ID=price_...
```

### 3. Set up Stripe webhooks (Local Testing)
For subscription status updates (upgrade/cancel) to reach your local DB, use the Stripe CLI:

```bash
npm install -g stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
Copy the webhook signing secret given by the CLI and assign it to:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Project Structure

```
callscribe-ai-admin/
├── app/
│   ├── (app)/                  # Authenticated app shell
│   │   ├── layout.tsx          # Sidebar layout
│   │   ├── dashboard/          # Call notes dashboard
│   │   ├── call/new/           # Transcript → AI insights
│   │   ├── clients/            # Client management
│   │   ├── call-notes/[id]/    # Call note detail
│   │   └── settings/           # Account & subscription
│   ├── api/
│   │   ├── auth/               # NextAuth + signup
│   │   ├── call-notes/         # CRUD for call notes
│   │   ├── clients/            # CRUD for clients
│   │   ├── generate/           # AI generation endpoint
│   │   └── subscription/       # Stripe stub endpoint
│   ├── auth/                   # Login / Signup pages
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── globals.css             # Design system
├── components/
│   ├── Sidebar.tsx             # Navigation sidebar
│   └── Providers.tsx           # SessionProvider wrapper
├── lib/
│   ├── ai.ts                   # 🤖 AI abstraction (swap here)
│   ├── stripe.ts               # 💳 Stripe stub (swap here)
│   ├── auth.ts                 # NextAuth configuration
│   └── prisma.ts               # Prisma client singleton
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Demo data seed
├── middleware.ts               # Route protection
└── .env.example                # Environment variable template
```

---

## Deployment (Vercel + Free Postgres)

To deploy to production for free, we recommend **Vercel** for hosting and **Neon**, **Supabase**, or **Railway** for the PostgreSQL database.

### 1. Provision a Free Postgres Database
1. Go to [Neon.tech](https://neon.tech), [Supabase.com](https://supabase.com), or [Railway.app](https://railway.app).
2. Create a new free tier project.
3. Copy the Postgres connection URL (make sure it ends with `?sslmode=require` if using Neon or pooled links).

### 2. Push Schema & Migrations to Production
From your local terminal, point Prisma to the new production database URL and push the tables:
```bash
# Temporarily set your local terminal variable (or put it in a .env.prod)
export DATABASE_URL="postgresql://user:pass@.../prodDb"
npx prisma db push
```

### 3. Deploy to Vercel
1. Push your code to a GitHub repository.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**, selecting your GitHub repo.
3. Before deploying, configure the **Environment Variables** in the Vercel UI:
   - `DATABASE_URL`: Your new Postgres URL
   - `NEXTAUTH_SECRET`: Run `openssl rand -base64 32` locally and paste the output.
   - `NEXTAUTH_URL`: Your expected Vercel domain (e.g., `https://callscribe.vercel.app`) - you can update this after Vercel generates the URL.
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (test or live).
   - `STRIPE_WEBHOOK_SECRET`: Wait for step 4 to get this. 
   - `STRIPE_PRO_PRICE_ID`: The Price ID of your Stripe model.
4. Click **Deploy**.

### 4. Configure Production Stripe Webhooks
1. In your [Stripe Dashboard](https://dashboard.stripe.com/webhooks), click **Add an endpoint**.
2. Set the Endpoint URL to your Vercel domain: `https://your-domain.vercel.app/api/stripe/webhook`
3. Under "Select events to listen to", add:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Save, then reveal the **Signing Secret** (`whsec_...`).
5. Add this as `STRIPE_WEBHOOK_SECRET` in your Vercel Environment Variables and **Redeploy** the project.

### Production Hardening Enabled:
- **Rate-Limiting:** The Call-Notes generation route explicitly blocks users exceeding 5 generations per minute to prevent AI or database abuse vectors.
- **Route Authorization:** Standard dynamic authentication applies via NextAuth `middleware` resolving securely across the UI and endpoints.

---

## License

MIT — build something great!
