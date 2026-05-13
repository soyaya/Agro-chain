# AgroChain Frontend

Next.js 16 frontend for the AgroChain fish supply chain platform. Connects to the AgroChain backend API and provides role-based dashboards for farmers, cluster farmers, buyers, and admins.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Radix UI + shadcn/ui components
- React Hook Form + Zod validation
- Framer Motion
- Sonner (toast notifications)
- Vitest (unit tests)

---

## Running Locally

### Prerequisites

- Node.js 20+
- pnpm
- AgroChain backend running (see backend README)

### 1. Install dependencies

```bash
cd frontend
pnpm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Used by Next.js API proxy routes (server-side only)
BASE_BACKEND_URL=http://localhost:5005

# Used by browser-side fetch calls
NEXT_PUBLIC_BASE_BACKEND_URL=http://localhost:5005
```

Both values should point to wherever the backend is running. The default backend port is `5000` (`pnpm dev`) or `5005` (`pnpm dev:local`).

### 3. Start the dev server

```bash
pnpm dev
```

Runs on `http://localhost:3000`.

### Available scripts

| Script        | Description                                    |
| ------------- | ---------------------------------------------- |
| `pnpm dev`    | Start dev server on port 3000                  |
| `pnpm build`  | Build for production                           |
| `pnpm start`  | Start production server (requires build first) |
| `pnpm lint`   | Run ESLint                                     |
| `pnpm format` | Format with Prettier                           |

---

## Running with Docker

The frontend runs locally against the Dockerized backend. Start the backend with Docker Compose first (see backend README), then run the frontend locally.

Your `.env.local` should point to the Docker-exposed backend port:

```env
BASE_BACKEND_URL=http://localhost:5005
NEXT_PUBLIC_BASE_BACKEND_URL=http://localhost:5005
```

Then start the frontend normally:

```bash
pnpm dev
```

---

## Environment Variables

| Variable                       | Required | Description                                                                         |
| ------------------------------ | -------- | ----------------------------------------------------------------------------------- |
| `BASE_BACKEND_URL`             | Yes      | Backend origin for Next.js API proxy routes (server-side, never exposed to browser) |
| `NEXT_PUBLIC_BASE_BACKEND_URL` | Yes      | Backend origin for browser-side fetch calls. Must match `BASE_BACKEND_URL`.         |

---

## Authentication

Auth uses httpOnly cookies set by Next.js API proxy routes. Tokens never touch browser JavaScript.

Flow:

1. User submits email + password — Next.js proxies to backend, OTP sent to email
2. User enters OTP — Next.js proxy verifies with backend, sets `auth_token` (httpOnly) and `current_user` cookies
3. All subsequent API calls include `auth_token` cookie automatically via `credentials: "include"`
4. Next.js middleware reads `current_user` cookie to guard dashboard routes

Logout calls `POST /api/auth/logout` which clears both cookies server-side.

---

## Project Structure

```
frontend/
├── public/                          # Static assets (SVGs, icons)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/                # Next.js proxy routes — keep tokens server-side
│   │   │       ├── _utils.ts
│   │   │       ├── login/
│   │   │       ├── logout/
│   │   │       ├── register/
│   │   │       ├── role/
│   │   │       ├── verify/
│   │   │       └── forgot-password/
│   │   ├── (auth)/                  # Auth pages (unauthenticated only)
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   ├── verify/
│   │   │   └── authentication/
│   │   ├── (dasboards)/             # Protected dashboards (requires current_user cookie)
│   │   │   ├── layout.tsx
│   │   │   ├── farmers-dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── listings/
│   │   │   │   ├── profile/
│   │   │   │   └── financial/
│   │   │   ├── buyers-dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── orders/
│   │   │   │   └── profile/
│   │   │   ├── cluster-dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── listings/
│   │   │   │   ├── pending-approvals/
│   │   │   │   ├── farmers/
│   │   │   │   ├── orders/
│   │   │   │   └── profile/
│   │   │   └── admin-dashboard/
│   │   │       ├── page.tsx
│   │   │       └── applications/
│   │   ├── (main-app)/              # Public-facing pages
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── marketplace/
│   │   │   ├── payments/
│   │   │   ├── privacy/
│   │   │   ├── support/
│   │   │   └── terms/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── fonts.ts
│   │   ├── manifest.ts
│   │   └── sw.ts
│   ├── components/                  # Reusable UI components
│   ├── hooks/                       # Shared React hooks
│   ├── lib/                         # API client, auth context, service files
│   ├── models/                      # Static data (Nigerian LGA lists, etc.)
│   ├── store/                       # Global state
│   ├── types/                       # TypeScript interfaces, constants, animation variants
│   └── middleware.ts                # Route protection + role-based redirects
├── .env.example
├── components.json
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── verify-config.js
└── vitest.config.ts
```

---

## User Roles and Dashboards

| Role      | Dashboard            | Access                                                 |
| --------- | -------------------- | ------------------------------------------------------ |
| `farmer`  | `/farmers-dashboard` | Create listings, view orders, apply for cluster status |
| `cluster` | `/cluster-dashboard` | Approve farmer listings, manage orders, view farmers   |
| `buyer`   | `/buyers-dashboard`  | Browse marketplace, place orders, track deliveries     |
| `admin`   | `/admin-dashboard`   | Approve cluster applications, view platform metrics    |

The middleware reads the `current_user` cookie and redirects unauthenticated users to `/login`. Authenticated users visiting `/login` or `/register` are redirected to their dashboard.

---

## API Integration

All backend calls go through `apiFetch` in `src/lib/api.ts`. It builds the full URL from `NEXT_PUBLIC_BASE_BACKEND_URL`, sends `credentials: "include"` so the `auth_token` cookie is attached automatically, and throws `ApiError` with the status code on non-2xx responses.

Domain service files in `src/lib/services/` wrap `apiFetch` with typed request/response interfaces.

Auth calls go through Next.js API proxy routes at `/api/auth/*` rather than directly to the backend, keeping tokens server-side.

---

## Cart

The cart (`src/components/marketplace/useCart.ts`) is a two-tier system:

- Loads from `localStorage` immediately on mount for instant render
- Then calls `GET /marketplace/cart` — if logged in and a server cart exists, it takes precedence
- `addToCart` updates local state immediately and syncs to the backend in the background
- `updateQuantity` and item removal sync to the backend via PATCH/DELETE
- Cart persists across page refreshes for logged-in users via the backend

---

## Marketplace Flow

1. Browse listings at `/marketplace`
2. Click a listing to view details at `/marketplace/[id]`
3. Add packages to cart (synced to backend for logged-in users)
4. Open cart drawer and proceed to `/marketplace/checkout`
5. Select delivery options and confirm order
6. Order appears in `/buyers-dashboard/orders`
