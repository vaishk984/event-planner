# PlannerOS 🎉

**The Operating System for Event Planners**

A full-stack SaaS platform connecting event planners with vendors. Built with Next.js 16, Supabase, and Tailwind CSS.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Supabase](https://img.shields.io/badge/Supabase-green)

## ✨ Features

### For Event Planners
- 📅 **Event Management** - Create and manage events with budgets, timelines, and checklists
- 🏪 **Vendor Marketplace** - Browse and book verified vendors
- 👥 **Client CRM** - Manage client relationships and intake forms
- 💰 **Budget Tracking** - Real-time budget monitoring and reporting

### For Vendors
- 📊 **Vendor Dashboard** - Manage bookings and availability
- 📋 **Booking Requests** - Accept or decline planner requests
- ⭐ **Profile & Reviews** - Showcase services and collect ratings

### For Admins
- 🛡️ **Vendor Verification** - Approve and verify vendors
- 📈 **Platform Analytics** - Monitor platform health and usage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier works!)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/planner-os.git
cd planner-os
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open http://localhost:3000**

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your Supabase anon key |
| `NEXT_PUBLIC_APP_URL` | Yes | Your app URL (http://localhost:3000 for dev) |
| `RESEND_API_KEY` | No | For email notifications |

## 📁 Project Structure

```
planner-os/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── admin/             # Admin portal
│   ├── vendor/            # Vendor portal
│   └── api/               # API routes
├── components/            # React components
│   └── ui/               # UI component library
├── lib/                   # Utilities and services
│   ├── actions/          # Server actions
│   ├── repositories/     # Database repositories
│   ├── services/         # Business logic
│   └── validations/      # Zod schemas
├── supabase/
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

## 🧪 Testing

```bash
# Run E2E tests
node test-e2e.js

# Run TypeScript check
npx tsc --noEmit

# Run workflow demo
node demo-workflow.js
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### CI/CD Workflows

This repository now includes GitHub Actions workflows for CI and Vercel deployments:

| Workflow | File | Trigger |
|----------|------|---------|
| CI | `.github/workflows/ci.yml` | Push/PR on `main`, `develop`, `staging` |
| Staging Deploy | `.github/workflows/deploy-staging.yml` | Push to `develop` or `staging`, or manual dispatch |
| Production Deploy | `.github/workflows/deploy-production.yml` | Push to `main`, or manual dispatch |

### Required GitHub Secrets

Add these repository secrets before using the deploy workflows:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Personal or team Vercel API token |
| `VERCEL_ORG_ID` | Vercel team or org ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |

Notes:
- CI uses placeholder env values and does not require production Supabase secrets.
- `lint` is currently non-blocking in CI because the repository still has a large ESLint backlog.
- Production deploys use the Vercel production environment; staging deploys use the Vercel preview environment.

## 💰 Cost

This project runs entirely on **free tiers**:

| Service | Free Tier |
|---------|-----------|
| Supabase | 500MB DB, 50K users |
| Vercel | Unlimited deploys |
| Resend | 100 emails/day |

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

---

Built with ❤️ for the events industry
