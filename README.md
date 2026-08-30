# 📞 CallScribe AI Admin

> **AI-powered call transcript analysis and client management portal for consultants, agencies, and sales teams.**  
> Built with Next.js 16 (App Router) · TypeScript · Prisma ORM · NextAuth.js · Stripe · Tailwind CSS

---

## ✨ Features

- 📝 **AI Transcript Summarization**
  - Paste raw Zoom, Google Meet, or Microsoft Teams transcripts and instantly extract structured summaries.
  - Automatically identifies key action items, owners, and due dates.

- 📧 **Automated Follow-Up Email Generation**
  - Generates ready-to-send client follow-up emails from transcript insights with a single click.

- 👥 **Client & Call Notes Management**
  - Organize notes by client profiles, tag categories, search meeting history, and track status.

- 💳 **Stripe Billing & Subscriptions**
  - Pre-integrated Stripe Checkout and webhook handling for subscription tier upgrades.

- 🔒 **Enterprise-Grade Authentication & Rate Limiting**
  - Secure credential-based authentication using NextAuth.js and Prisma Adapter.
  - Rate limiting protection on AI endpoint generations to prevent API abuse.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Server Components & Actions)
- **Language**: TypeScript 5
- **Database & ORM**: SQLite (Local Dev) / PostgreSQL (Neon/Supabase Production) via Prisma ORM
- **Authentication**: NextAuth.js v4
- **Payments**: Stripe API SDK
- **Validation**: Zod schema validation
- **Styling**: Tailwind CSS & Vanilla CSS design system

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ and `npm`

### 1. Installation
```bash
git clone https://github.com/Omkar4812x/CallScribe-AI-Admin.git
cd CallScribe-AI-Admin
npm install
```

### 2. Database Setup
```bash
npx prisma generate     # Generate Prisma client
npx prisma db push      # Create database tables
npm run db:seed         # Seed demo clients & sample AI call notes
```
*Default Seed Credentials:* `demo@callscribe.ai` / `password123`

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | SQLite or PostgreSQL connection URL | ✅ Yes |
| `NEXTAUTH_SECRET` | Secret key for JWT session signing | ✅ Yes |
| `NEXTAUTH_URL` | Application base URL (`http://localhost:3000`) | ✅ Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) | Optional |
| `OPENAI_API_KEY` | OpenAI API key (`sk-...`) | Optional |
| `GEMINI_API_KEY` | Google Gemini API key | Optional |

---

## 📂 Project Architecture

```text
CallScribe-AI-Admin/
├── app/
│   ├── (app)/                  # Authenticated app layout & views
│   │   ├── dashboard/          # Call notes dashboard
│   │   ├── call/new/           # Transcript upload & AI generator
│   │   ├── clients/            # Client directory & management
│   │   ├── call-notes/[id]/    # Note detail & summary editor
│   │   └── settings/           # Account & subscription management
│   ├── api/                    # REST API endpoints (Auth, AI, Stripe webhooks)
│   ├── auth/                   # Login & Signup pages
│   └── page.tsx                # Public landing page
├── components/                 # Reusable UI components & navigation sidebar
├── lib/                        # AI, Stripe, NextAuth & Prisma singletons
├── prisma/                     # Database schema & seed scripts
└── middleware.ts               # Protected route authorization middleware
```

---

## 📄 License

Distributed under the MIT License.
