# MedixFlow

**Book doctors instantly. Manage health digitally.**

MedixFlow is a full-stack healthcare platform that connects patients, doctors, and administrators in one workspace. Patients discover specialists, book clinic or video slots, pay securely, and access digital prescriptions. Doctors run consultation queues, issue prescriptions, and manage leave. Admins oversee staff, patients, appointments, payments, and leave approvals.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database](#database)
- [Running the apps](#running-the-apps)
- [Testing](#testing)
- [API overview](#api-overview)
- [Deployment](#deployment)
- [License](#license)

---

## Features

### Patients

- Email OTP registration, login, password reset, and Google OAuth
- Doctor search by specialization, profile view, and slot-based booking (clinic or video)
- Multi-gateway payments: **Razorpay**, **Stripe**, **PayPal**, plus in-app **wallet** top-ups
- Appointment lifecycle: reschedule proposals, cancellations, refunds, and billing history
- Digital prescriptions (view, print, PDF export) and lab report uploads
- Real-time notifications via Socket.IO
- Profile completion tracking and emergency contacts

### Doctors

- Secure login and profile management (schedules, breaks, consultation fee, avatar)
- Appointment calendar and patient queue with check-in
- Consultation workspace: vitals, diagnosis, prescriptions, lab test requests
- Leave requests (pending → admin review) with automatic slot/appointment handling
- Prescription history and consulted-patients list

### Administrators

- Dashboard with operational metrics
- Staff directory: create doctors, block/unblock, password setup invites
- Patient directory and appointment oversight (reassign, refund, status updates)
- Leave approval workflow
- Payment ledger and platform settings

---

## Tech stack

| Layer | Technologies |
|--------|----------------|
| **Frontend** | React 19, TypeScript, Vite 7, Tailwind CSS 4, Redux Toolkit, React Router 7, React Hook Form, Zod, Socket.IO client |
| **Backend** | Node.js 20+, Express 5, TypeScript, Prisma 7, PostgreSQL |
| **Auth** | JWT (access + refresh in HTTP-only cookies), bcrypt, Google OAuth |
| **Realtime** | Socket.IO, Redis |
| **Payments** | Razorpay, Stripe, PayPal |
| **Media** | Cloudinary (Multer) |
| **Email** | Nodemailer (SMTP) |
| **Testing** | Jest, ts-jest (use-case unit tests) |

---

## Architecture

The repository is a **two-app monorepo**: `apps/api` (REST API) and `apps/web` (SPA). The API follows **clean / hexagonal architecture**:

```
presentation/   → HTTP routes, controllers, middleware
application/    → use cases, DTOs, interfaces
domain/         → entities, repository contracts, value objects
infrastructure/ → Prisma repositories, gateways (Stripe, Razorpay, PayPal), email, Redis, Socket.IO
```

```mermaid
flowchart LR
  subgraph Web["apps/web"]
    UI[React SPA]
  end
  subgraph API["apps/api"]
    Routes[Express Routes]
    UC[Use Cases]
    Repo[Repositories]
    Routes --> UC --> Repo
  end
  DB[(PostgreSQL)]
  Redis[(Redis)]
  UI -->|REST + cookies| Routes
  UI -->|WebSocket| Socket[Socket.IO]
  Repo --> DB
  Socket --> Redis
```

---

## Project structure

```
MedixFlow_final/
├── apps/
│   ├── api/                    # Backend (@medixflow/api)
│   │   ├── prisma/             # Schema & migrations
│   │   ├── src/
│   │   │   ├── application/    # Use cases
│   │   │   ├── domain/         # Entities & contracts
│   │   │   ├── infrastructure/ # DB, services, DI container
│   │   │   ├── presentation/   # Routes & controllers
│   │   │   └── shared/         # Config, middleware
│   │   └── tests/unit/         # Jest use-case tests
│   │
│   └── web/                    # Frontend (@medixflow/web)
│       └── src/
│           ├── modules/        # patient, doctor, admin, auth, landing
│           ├── application/    # Hooks & API clients
│           ├── core/           # Axios, routes, auth loader
│           └── domain/         # Shared types
└── README.md
```

---

## Prerequisites

- **Node.js** ≥ 20
- **PostgreSQL** (local or hosted, e.g. [Neon](https://neon.tech))
- **Redis** (default: `redis://localhost:6379`)
- Optional but recommended for full functionality:
  - SMTP account (OTP & transactional email)
  - [Google Cloud](https://console.cloud.google.com/) OAuth client ID
  - [Cloudinary](https://cloudinary.com/) for image uploads
  - Payment provider keys (Razorpay / Stripe / PayPal) — use sandbox keys in development

---

## Getting started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd MedixFlow_final
```

### 2. Backend setup

```bash
cd apps/api
npm install
```

Create `apps/api/.env` (see [API environment variables](#api-environment-variables)).

Apply the database schema:

```bash
npx prisma migrate deploy
# or during development:
npx prisma migrate dev
```

Start the API:

```bash
npm run dev
```

The server listens on **http://localhost:5000** by default.

**Dev startup (fast path):** `npm run dev` uses **esbuild** to bundle `src/` once, then runs Node on `.dev/server.cjs`. You should see:

1. `[esbuild] Bundle ready` — first build ~1–5s (not 20–30s)
2. `Server running` — port open immediately; `GET /health` works
3. `API routes ready` — full `/api/*` available shortly after

If you still use `npm run dev:tsx`, cold start can take **20–30+ seconds** on Windows (especially under **OneDrive**), because `tsx` compiles hundreds of TypeScript files on each run. Prefer `npm run dev`, or move the project to a local folder like `C:\dev\MedixFlow_final`.

### 3. Frontend setup

Open a second terminal:

```bash
cd apps/web
npm install
```

Create `apps/web/.env` (see [Web environment variables](#web-environment-variables)).

```bash
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:5000`, so you can use relative API paths in development.

---

## Environment variables

### API (`apps/api/.env`)

Required variables are validated at startup via Zod (`src/shared/config/env.ts`).

```env
# Core
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/medixflow

# Auth (min 32 characters each)
JWT_ACCESS_SECRET=your-access-secret-at-least-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-at-least-32-chars

# CORS — comma-separated allowed origins
FRONTEND_URL=http://localhost:5173

# Redis (optional in schema; defaults to localhost:6379)
REDIS_URL=redis://localhost:6379

# Google OAuth
GOOGLE_CLIENT_ID=

# Email (OTP, password setup, resets)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="MedixFlow <noreply@yourdomain.com>"

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_MODE=sandbox
```

### Web (`apps/web/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Optional — direct Cloudinary uploads from the client
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

> **Tip:** `FRONTEND_URL` on the API must include the exact origin(s) your Vite app runs on (e.g. `http://localhost:5173`) so cookies and CORS work correctly.

---

## Database

- **ORM:** Prisma 7 with PostgreSQL
- **Schema:** `apps/api/prisma/schema.prisma`
- **Migrations:** `apps/api/prisma/migrations/`

Common commands (from `apps/api`):

```bash
npx prisma studio          # GUI for data inspection
npx prisma migrate dev       # create/apply migrations in dev
npx prisma generate          # regenerate client (also runs on postinstall)
```

The `package.json` references a seed script (`prisma/seed.ts`). Add a seed file if you need default admin/specialization data for local demos.

---

## Running the apps

| App | Directory | Dev | Production build |
|-----|-----------|-----|------------------|
| API | `apps/api` | `npm run dev` (esbuild) · `npm run dev:tsx` (slow) | `npm run build` → `npm start` |
| Web | `apps/web` | `npm run dev` | `npm run build` → `npm run preview` |

**Default URLs**

| Service | URL |
|---------|-----|
| Web (Vite) | http://localhost:5173 |
| API | http://localhost:5000 |
| API base path | `/api` |

**Role entry points (web)**

| Role | Login route |
|------|-------------|
| Patient | `/patient/login` |
| Doctor | `/doctor/login` |
| Admin | `/admin/login` |

---

## Testing

API unit tests target **application use cases** (mocked dependencies):

```bash
cd apps/api
npm test
```

Coverage is collected from `src/application/use-cases/**/*.ts` and written to `apps/api/coverage/`.

---

## API overview

All routes are mounted under `/api`.

| Prefix | Purpose |
|--------|---------|
| `/api/auth` | Patient register, OTP, login, refresh, Google, password reset |
| `/api/admin/auth` | Admin login & session |
| `/api/doctor/auth` | Doctor login & session |
| `/api/patient` | Profile, appointments, check-in, lab uploads |
| `/api/patient/wallet` | Balance, top-up, transactions |
| `/api/doctor` | Profile, schedules, consultations, queue |
| `/api/doctors` | Public doctor listings & details |
| `/api/appointments` | Booking, reschedule, cancel, slots |
| `/api/payments` | Verify, retry, simulate; webhooks at `/webhook`, `/webhook/stripe`, `/webhook/paypal` |
| `/api/notifications` | List, read, delete |
| `/api/staff` | Admin doctor CRUD |
| `/api/admin` | Admin operations (patients, appointments, actions) |
| `/api/doctor/leaves` · `/api/admin/leaves` | Leave apply & review |
| `/api/common` | File uploads |

Authentication uses **HTTP-only cookies** for access and refresh tokens. Authenticated requests from the web app send `credentials: true` via Axios.

---

## Deployment

### API (Render)

`render.yaml` at the repo root defines a Render web service (`medixflow-api`) with Node 20, linked PostgreSQL, and generated JWT secrets. Set remaining secrets (SMTP, Cloudinary, payment keys, `FRONTEND_URL`, `REDIS_URL`) in the Render dashboard.

Typical deploy flow:

1. Connect the repo to Render (or your host).
2. Set **root directory** to `apps/api`.
3. Build: `npm install && npm run build`
4. Start: `npm start`
5. Run migrations against production `DATABASE_URL` before or as part of release.

### Web

Build the static site from `apps/web`:

```bash
npm run build
```

Host the `dist/` folder on Vercel, Netlify, Cloudflare Pages, etc. Set `VITE_API_URL` and `VITE_SOCKET_URL` to your production API origin.

Configure payment webhooks to point at:

- `https://<api-host>/api/payments/webhook` (Razorpay)
- `https://<api-host>/api/payments/webhook/stripe` (Stripe)
- `https://<api-host>/api/payments/webhook/paypal` (PayPal)

---

## License

This project is provided as-is for educational and portfolio use. Add a `LICENSE` file if you intend to open-source or distribute it.

---

<p align="center">
  <strong>MedixFlow</strong> — clinical workflows and administration in one platform.
</p>
