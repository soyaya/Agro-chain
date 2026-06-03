# AgroChain Frontend

Next.js 16 frontend for the AgroChain fish supply chain platform. Provides role-based dashboards for farmers, cluster farmers, buyers, and admins. Connects to the AgroChain Express/Prisma backend API.

## Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| Next.js | 16 (App Router) | Framework, routing, API proxy |
| React | 19 | UI |
| TypeScript | 5 | Type safety |
| Tailwind CSS | v4 | Styling |
| shadcn/ui + Radix UI | — | Component primitives |
| React Hook Form + Zod | — | Form validation |
| Framer Motion | — | Animations |
| Sonner | — | Toast notifications |
| Vitest | — | Unit tests |
| Cloudinary | — | File/document uploads (unsigned preset) |

---

## Running Locally

### Prerequisites

- Node.js 20+
- pnpm
- AgroChain backend running (see backend README)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Server-side — used in Next.js API proxy routes
BASE_BACKEND_URL=http://localhost:5000

# Client-side — used in browser fetch calls (must match above)
NEXT_PUBLIC_BASE_BACKEND_URL=http://localhost:5000

# Cloudinary — for profile photo and document uploads
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_here
```

The default backend port is `5000`. Adjust if your backend runs elsewhere.

**Cloudinary setup (one time):**
1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Dashboard → Settings → Upload → Upload Presets → Add preset
3. Set Signing Mode to **Unsigned**, copy the preset name
4. Your cloud name is on the dashboard home

### 3. Start the dev server

```bash
pnpm dev
```

Runs on `http://localhost:3000`.

### Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start dev server on port 3000 |
| `pnpm build` | Production build |
| `pnpm start` | Start production server (after build) |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format with Prettier |
| `pnpm test` | Run Vitest unit tests |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BASE_BACKEND_URL` | Yes | Backend origin for server-side API proxy routes — never exposed to the browser |
| `NEXT_PUBLIC_BASE_BACKEND_URL` | Yes | Backend origin for browser-side `apiFetch` calls |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name for file uploads |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Yes | Cloudinary unsigned upload preset |

---

## Authentication

Auth is OTP-based. Tokens never touch browser JavaScript — they live in httpOnly cookies set by Next.js API proxy routes.

**Registration flow:**
1. User selects role (`farmer` or `buyer`) → `POST /api/auth/role`
2. User registers with name, phone, email, location, password → `POST /api/auth/register`
3. Backend sends a 6-digit OTP to the email
4. User verifies OTP → `POST /api/auth/register/otp`
5. Backend activates the account, proxy sets `auth_token` and `current_user` httpOnly cookies

**Login flow:**
1. User submits email + password → `POST /api/auth/login`
2. Backend sends OTP to email
3. User verifies OTP → `POST /api/auth/login/otp`
4. Proxy sets httpOnly cookies

**Session:**
- All `apiFetch` calls send `credentials: "include"` — the `auth_token` cookie is attached automatically
- Next.js middleware reads the `current_user` cookie to protect dashboard routes and redirect by role
- Logout → `POST /api/auth/logout` clears both cookies server-side

**Forgot password:**
- `POST /api/auth/forgot-password` → OTP to email → `POST /api/auth/forgot-password/otp` (carries new password + OTP) → all sessions invalidated

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/                    # Next.js proxy routes (keep tokens server-side)
│   │   │   ├── login/               # POST — initiates OTP login
│   │   │   ├── login/otp/           # POST — verifies OTP, sets cookies
│   │   │   ├── login/otp/resend/    # POST — resend login OTP
│   │   │   ├── logout/              # POST — clears auth cookies
│   │   │   ├── register/            # POST — creates account
│   │   │   ├── register/otp/        # POST — verifies registration OTP
│   │   │   ├── register/otp/resend/
│   │   │   ├── role/                # POST — sets pending_role cookie
│   │   │   ├── verify/              # POST — submits BVN for identity verification
│   │   │   ├── forgot-password/
│   │   │   ├── forgot-password/otp/
│   │   │   └── forgot-password/otp/resend/
│   │   └── upload/                  # POST — proxies file to Cloudinary, returns secure_url
│   │
│   ├── (auth)/                      # Auth pages (redirects logged-in users to dashboard)
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify/
│   │   ├── forgot-password/
│   │   └── authentication/
│   │
│   ├── (dasboards)/                 # Protected dashboards (require current_user cookie)
│   │   ├── farmers-dashboard/
│   │   │   ├── page.tsx             # Stats + recent activity
│   │   │   ├── listings/            # View all listings + create new
│   │   │   ├── orders/              # Orders placed on farmer's listings
│   │   │   ├── profile/             # Edit profile + apply for cluster status
│   │   │   └── financial/           # Financial services (pending backend)
│   │   │
│   │   ├── cluster-dashboard/
│   │   │   ├── page.tsx             # Stats + recent activity
│   │   │   ├── listings/            # View all cluster listings + create new
│   │   │   ├── pending-approvals/   # Approve / reject farmer listing submissions
│   │   │   ├── farmers/             # View assigned farmers + individual profiles
│   │   │   ├── orders/              # Manage cluster orders + update status
│   │   │   ├── demands/             # Accept / decline / fulfill buyer demands
│   │   │   ├── profile/             # Edit cluster profile
│   │   │   └── financial/           # Financial services (pending backend)
│   │   │
│   │   ├── buyers-dashboard/
│   │   │   ├── page.tsx             # Order summary stats
│   │   │   ├── orders/              # All orders + detail view with tracking
│   │   │   ├── demands/             # Create and track custom supply demands
│   │   │   ├── saved/               # Saved marketplace listings
│   │   │   └── profile/             # Edit buyer profile
│   │   │
│   │   └── admin-dashboard/
│   │       ├── page.tsx             # Platform KPI metrics
│   │       ├── analytics/           # Charts: orders by status, fish type popularity
│   │       ├── farmers/             # All users — filter by role, state, verification
│   │       ├── applications/        # Cluster farmer applications — approve / reject
│   │       ├── listings/            # All listings — approve / reject / flag / remove
│   │       ├── demands/             # All demands — assign to cluster farmer
│   │       ├── orders/              # All orders overview
│   │       └── settings/            # Fish pricing config + admin profile
│   │
│   └── (main-app)/                  # Public-facing pages
│       ├── page.tsx                 # Landing / home
│       ├── about/
│       ├── how-it-works/
│       ├── contact/
│       ├── marketplace/             # Browse listings + listing detail + cart + checkout
│       ├── payments/verify/         # Paystack callback page
│       ├── privacy/
│       ├── terms/
│       └── support/
│
├── components/
│   ├── dashboard/                   # DashboardLayout, sidebar, nav
│   ├── landing/                     # Marketing page sections
│   ├── listings/                    # SupplyListingForm, PackagingSelector
│   ├── marketplace/                 # MarketplaceCard, MarketplaceFilters, CartDrawer, useCart
│   ├── notifications/               # NotificationsPanel, NotificationsBell
│   ├── profile/                     # FileUploadField, profile form components
│   ├── shared/                      # Shared page components
│   └── ui/                          # LoadingState, EmptyState, shadcn primitives
│
├── context/
│   ├── PlatformSettingsContext.tsx  # Fetches GET /admin/settings on mount, provides pricePerKg map
│   └── CartContext.tsx              # Cart state
│
├── hooks/
│   ├── useNotifications.ts          # Polls GET /notifications every 60s, exposes mark-read actions
│   └── useDashboardNav.ts           # Role-aware dashboard navigation
│
├── lib/
│   ├── api.ts                       # apiFetch — base fetch wrapper with auth cookie + error handling
│   ├── auth-context.tsx             # AuthContext — current user from GET /auth/me
│   ├── upload.ts                    # uploadFile(file) → POSTs to /api/upload → returns Cloudinary URL
│   └── services/
│       ├── auth.service.ts          # getMe, verify (BVN), logoutAll
│       ├── farmer.service.ts        # createListing, getListings, getOrders, updateProfile, clusterApplication
│       ├── cluster.service.ts       # getListings, getFarmers, getFarmerById, orders, demands, payouts
│       ├── buyer.service.ts         # orders, demands, savedListings, initiatePayment, confirmDelivery
│       ├── marketplace.service.ts   # getListings, getListing, cart CRUD, checkout
│       ├── admin.service.ts         # settings, dashboard metrics, charts, listings, users, demands, orders
│       └── notification.service.ts  # getNotifications, markRead, markAllRead
│
├── models/
│   └── models.ts                    # Static content: nav links, FAQs, impact stats, testimonials, LGA list
│
├── types/
│   ├── index.ts                     # TypeScript interfaces (Order, MarketplaceListing, FarmerProfile, etc.)
│   └── constants.ts                 # FISH_TYPES, NIGERIAN_STATES, STATUS_COLORS, animation variants, etc.
│
└── middleware.ts                    # Route protection + role-based redirects on current_user cookie
```

---

## User Roles & Dashboards

| Role | Cookie value | Dashboard | Capabilities |
|------|-------------|-----------|--------------|
| `farmer` | `role: "farmer"` | `/farmers-dashboard` | Create supply listings, view orders from buyers, apply to become a cluster farmer |
| `cluster` | `role: "cluster"` | `/cluster-dashboard` | Approve farmer listings, manage orders, accept/fulfill buyer demands |
| `buyer` | `role: "buyer"` | `/buyers-dashboard` | Browse marketplace, place orders, submit custom demands, save listings |
| `admin` | `role: "admin"` | `/admin-dashboard` | Full platform oversight — users, listings, demands, orders, pricing config |

Middleware reads the `current_user` cookie and:
- Redirects unauthenticated requests to `/login` for any `/[role]-dashboard/*` route
- Redirects authenticated users away from `/login` and `/register` to their dashboard
- `cluster` role users are routed to `/cluster-dashboard`, not `/farmers-dashboard`

---

## Pricing Model

Fish prices are set platform-wide by an admin — farmers never enter a price when listing.

- Admin configures prices via `PATCH /admin/settings/price` (₦ per kg, per fish type)
- Prices are stored in the `PlatformSettings` table on the backend
- `PlatformSettingsContext` fetches `GET /admin/settings` once on app load and exposes `pricePerKg`
- When a farmer creates a listing, the backend reads the current platform price and computes `pricePerUnit = weightKg × pricePerKg[fishType]`
- The marketplace and cart always reflect the platform price — `FALLBACK_PRICES_PER_KG` in `constants.ts` is a dev-only fallback for when the backend is unreachable

---

## API Integration

**`src/lib/api.ts` — `apiFetch`**

All backend calls go through `apiFetch`. It:
- Builds the full URL from `NEXT_PUBLIC_BASE_BACKEND_URL`
- Sends `credentials: "include"` so the `auth_token` cookie is attached
- Throws `ApiError(statusCode, message)` on non-2xx responses

Auth calls go through Next.js API proxy routes at `/api/auth/*` to keep tokens server-side. All other API calls go directly through `apiFetch`.

**`src/lib/services/` — domain service files**

Each service wraps `apiFetch` with typed payloads and response interfaces:

| File | Backend prefix | Used by |
|------|---------------|---------|
| `auth.service.ts` | `/auth` | All roles |
| `farmer.service.ts` | `/farmers` | Farmer dashboard, cluster create listing |
| `cluster.service.ts` | `/cluster` | Cluster dashboard |
| `buyer.service.ts` | `/buyers`, `/payments` | Buyer dashboard, marketplace |
| `marketplace.service.ts` | `/marketplace` | Marketplace pages, cart |
| `admin.service.ts` | `/admin` | Admin dashboard |
| `notification.service.ts` | `/notifications` | Notifications bell + panel |

---

## Cart

The cart (`src/components/marketplace/useCart.ts`) uses a two-tier approach:

1. **Instant render** — loads from `localStorage` on mount, no flicker
2. **Backend sync** — calls `GET /marketplace/cart` after mount; if the user is logged in and has a server cart, it takes precedence
3. **Add / update / remove** — optimistically updates local state, then syncs to backend (`POST/PATCH/DELETE /marketplace/cart/...`) in the background
4. **Checkout** — `POST /marketplace/checkout` converts the backend cart into an order, then clears the checked-out items

Cart persists across devices for logged-in users via the backend.

---

## Notifications

The notification system is fully built on the frontend:

- `useNotifications` hook (`src/hooks/useNotifications.ts`) polls `GET /notifications` every 60 seconds
- `NotificationsBell` in the dashboard header shows the unread count badge
- `NotificationsPanel` is a slide-in drawer with the full list, mark-as-read, and mark-all-read

The backend notification endpoints (`GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`) are not yet implemented. The hook handles 404 gracefully — the bell shows 0 and the panel shows "No notifications yet" until the backend is ready.

---

## File Uploads

All file uploads (profile photos, cluster farmer application documents) go through `src/lib/upload.ts`:

```
file → POST /api/upload (Next.js route) → Cloudinary unsigned upload → returns secure_url
```

The returned Cloudinary URL is then sent to the relevant backend profile/application endpoint. The backend never handles the file directly.

---

## Marketplace & Saved Listings

**Marketplace flow:**

1. Browse listings at `/marketplace` (public, no auth)
2. Click a listing → `/marketplace/[id]` (heart button saves it to buyer's saved list)
3. Select variant, quantity, and delivery options
4. Add to cart (synced to backend for logged-in users)
5. Open cart drawer → Proceed to Checkout
6. Checkout creates an order → `POST /marketplace/checkout`
7. Pay via Paystack → backend callback at `GET /payments/verify`
8. Order appears in `/buyers-dashboard/orders` with tracking

**Save / unsave listings:**

Logged-in buyers can save listings from the marketplace grid (heart icon on cards) or from the listing detail page. Saves call `POST/DELETE /buyers/saved`. For guests and non-buyers, saves are stored in `localStorage` only.

The saved listings page at `/buyers-dashboard/saved` shows all saved items and allows removal.

---

## Demand System

Buyers can create custom supply requests when a specific fish type or quantity isn't available on the marketplace:

1. Buyer submits demand at `/buyers-dashboard/demands/create` → `POST /buyers/demands`
2. Admin reviews all demands at `/admin-dashboard/demands` and assigns to a cluster farmer
3. Cluster farmer sees assigned demands at `/cluster-dashboard/demands`, can accept or decline
4. On acceptance, cluster farmer fulfills the demand and marks it done
5. Buyer can cancel a pending demand at any time

---

## Docs

Implementation details and backend requirements are in `docs/`:

| File | Contents |
|------|----------|
| `docs/TASKS.md` | Complete frontend wiring status, all backend outstanding work with implementation code, full endpoint reference |
| `docs/endpoints/1-AUTH.md` | Auth flow endpoint specs |
| `docs/endpoints/2_FARMERS.md` | Farmer endpoint specs |
| `docs/endpoints/3_CLUSTER.md` | Cluster endpoint specs |
| `docs/endpoints/4_BUYERS.md` | Buyer endpoint specs |
| `docs/endpoints/5_MARKETPLACE.md` | Marketplace + cart + checkout specs |
| `docs/endpoints/6_ADMIN.md` | Admin settings + management specs |
