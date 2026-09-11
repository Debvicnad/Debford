# DEBFORD

> **A complete digital ecosystem for the vehicle lifecycle.**

Debford is a production-grade automotive technology platform combining vehicle marketplace, dealership management, rentals, commercial auctions, automotive services, parts, and vehicle ownership management into one cohesive platform.

---

## Vision

**Discover → Compare → Buy → Rent → Bid → Auction → Own → Maintain → Repair → Upgrade → Sell → Repeat**

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + React |
| Styling | Tailwind CSS |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Edge Functions | Supabase Edge Functions (Deno) |
| Deployment | Vercel + Supabase |
| Source Control | Git + GitHub |

---

## Project Status

**Current Phase: Phase 0 — Architecture & Documentation**

| Area | Status |
|---|---|
| Documentation | ✅ Complete |
| Database Schema | ✅ Designed |
| ERD | ✅ Complete |
| Security Model | ✅ Designed |
| Design System | ✅ Designed |
| Development Roadmap | ✅ Complete |
| Project Initialization | ⏳ Blocked (Node.js not installed) |
| Application Shell | ⏳ Pending |
| Authentication | ⏳ Pending |
| Supabase Setup | ⏳ Pending |

---

## Prerequisites

Before you can run this project, install:

| Tool | Required | Download |
|---|---|---|
| Node.js (LTS 20+) | ✅ | https://nodejs.org |
| Git | ✅ | https://git-scm.com |
| Supabase CLI | Recommended | `npm i -g supabase` |

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-org/debford.git
cd debford
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase project credentials
```

### 4. Set up Supabase
1. Create a project at https://supabase.com
2. Run migrations: `npx supabase db push`
3. Seed data: `npx supabase db seed`

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Documentation

| Document | Description |
|---|---|
| [Product Requirements](./docs/product-requirements.md) | Full product specification |
| [Technical Architecture](./docs/technical-architecture.md) | System architecture and stack |
| [Database Schema](./docs/database-schema.md) | Complete database design |
| [ERD](./docs/erd.md) | Entity relationship diagram |
| [Security Model](./docs/security-model.md) | RLS, auth, and security policies |
| [Supabase Architecture](./docs/supabase-architecture.md) | Supabase setup and integration |
| [Design System](./docs/design-system.md) | Colors, typography, components |
| [Development Roadmap](./docs/development-roadmap.md) | Implementation phases |

---

## Development Phases

| Phase | Description | Status |
|---|---|---|
| Phase 0 | Architecture & Documentation | 🔵 In Progress |
| Phase 1 | Foundation (Auth, Profiles, Roles, Admin) | ⏳ Pending |
| Phase 2 | Vehicle Marketplace | ⏳ Pending |
| Phase 3 | Sell / Buy (Orders, Payments) | ⏳ Pending |
| Phase 4 | Rentals | ⏳ Pending |
| Phase 5 | Services Marketplace | ⏳ Pending |
| Phase 6 | Commercial Auctions | ⏳ Pending |
| Phase 7 | Garage & Parts | ⏳ Pending |
| Phase 8 | Membership | ⏳ Pending |
| Phase 9 | AI & Advanced Features | ⏳ Pending |

---

## Environment Variables

See [`.env.example`](./.env.example) for all required variables.

**Critical:** Never commit `.env.local` to version control.

---

## License

Proprietary — All rights reserved.

---

*Debford — Build the future of automotive.*
