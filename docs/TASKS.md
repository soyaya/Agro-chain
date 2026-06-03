# Tasks

## Project Context

- **Frontend:** `/home/olorunshogo/Projects/Next/Agro-chain/frontend` (Next.js 15, TypeScript, App Router)
- **Backend:** `/home/olorunshogo/Projects/Next/Agro-chain/Agro-chain` (Express, Prisma, PostgreSQL)
- **API base (dev):** `http://localhost:5000/api`
- **Frontend (dev):** `http://localhost:3000`

---

## Fish Type Restructure — What Changed

The platform now treats all fish as catfish (the only species), and distinguishes by **processing stage** instead:

| Category | Types |
|----------|-------|
| **Live** | `fingerlings`, `juveniles`, `table_size`, `jumbo`, `parent_stocks` |
| **Processed** | `dried`, `grilled`, `peppersoup`, `peppered`, `smoked` |

- `catfish` as a standalone `fishType` is **deprecated**. Existing records with `fish_type = catfish` remain valid but new submissions will use specific types.
- `fishVariant` in demands now stores `"live"` or `"processed"` (the category). `fishType` stores the specific sub-type.
- The frontend `FALLBACK_PRICES_PER_KG` now includes all 10 types. The admin settings page lets admin set per-kg prices for all 10.

---

## Frontend Status

### Auth

| Page | Status | API calls |
|------|--------|-----------|
| `/login` | ✅ | `POST /auth/login` → OTP → `POST /auth/login/otp` |
| `/register` | ✅ | `POST /auth/role` → `POST /auth/register` → OTP → `POST /auth/register/otp` |
| `/verify` | ✅ | Resend OTP flows |
| `/forgot-password` | ✅ | `POST /auth/forgot-password` → OTP → reset |

### Farmer Dashboard

| Page | Status | API calls |
|------|--------|-----------|
| `/farmers-dashboard` | ✅ | `GET /farmers/listings/get`, `GET /farmers/recent-activities` |
| `/farmers-dashboard/listings` | ✅ | `GET /farmers/listings/get` |
| `/farmers-dashboard/listings/create` | ✅ | `POST /farmers/listings/create` — fish_type now accepts all 10 types (see B2) |
| `/farmers-dashboard/orders` | ✅ | `GET /farmers/orders` |
| `/farmers-dashboard/profile` | ✅ | `GET /auth/me`, `PATCH /farmers/account-profile`, Cloudinary upload |

### Cluster Dashboard

| Page | Status | API calls |
|------|--------|-----------|
| `/cluster-dashboard` | ✅ | `GET /cluster/listings/get`, `GET /cluster/current-activities` |
| `/cluster-dashboard/listings` | ✅ | `GET /cluster/listings/get` |
| `/cluster-dashboard/listings/create` | ✅ | `POST /farmers/listings/create` |
| `/cluster-dashboard/pending-approvals` | ✅ | `GET /cluster/pending-approvals`, `PATCH /cluster/pending-approvals/:id` |
| `/cluster-dashboard/farmers` | ✅ | `GET /cluster/farmers` — empty state when no farmers |
| `/cluster-dashboard/farmers/[id]` | ✅ | `GET /cluster/farmers/:farmerId` — error state until B4b |
| `/cluster-dashboard/orders` | ✅ | `GET /cluster/orders`, `PATCH /cluster/orders/:id` |
| `/cluster-dashboard/demands` | ✅ | `GET /cluster/demands`, accept/decline/fulfill endpoints |
| `/cluster-dashboard/profile` | ✅ | `GET /auth/me`, `PATCH /cluster/account-profile` |

### Buyer Dashboard

| Page | Status | API calls |
|------|--------|-----------|
| `/buyers-dashboard` | ✅ | `GET /buyers/orders` (stats derived from orders) |
| `/buyers-dashboard/orders` | ✅ | `GET /buyers/orders` |
| `/buyers-dashboard/orders/[id]` | ✅ | `GET /buyers/orders/:id`, confirm delivery, pay |
| `/buyers-dashboard/demands` | ✅ | `GET /buyers/demands`, `DELETE /buyers/demands/:id` — "Place a Demand" button links to `/marketplace#special-demand` |
| `/buyers-dashboard/saved` | ✅ | `GET /buyers/saved`, `DELETE /buyers/saved/:id` — error state until B3 |
| `/buyers-dashboard/profile` | ✅ | `GET /auth/me`, `PATCH /buyers/account-profile` |

> **Note:** `/buyers-dashboard/demands/create` has been removed. Demand creation is now an inline form on the marketplace page triggered by a checkbox under `#special-demand`.

### Admin Dashboard

| Page | Status | API calls |
|------|--------|-----------|
| `/admin-dashboard` | ✅ | `GET /admin/dashboard/metrics` |
| `/admin-dashboard/analytics` | ✅ | `GET /admin/dashboard/charts`, `GET /admin/dashboard/activities` |
| `/admin-dashboard/farmers` | ✅ | `GET /admin/farmers`, approve/reject |
| `/admin-dashboard/cluster-applications` | ✅ | `GET /admin/cluster-applications`, approve/reject |
| `/admin-dashboard/listings` | ✅ | `GET /admin/listings`, approve/reject/flag/remove |
| `/admin-dashboard/demands` | ✅ | `GET /admin/demands`, `PATCH /admin/demands/:id/assign` |
| `/admin-dashboard/orders` | ✅ | `GET /admin/orders`, `GET /admin/orders/:id` |
| `/admin-dashboard/settings` | ✅ | `GET /admin/settings`, `PATCH /admin/settings/price` — price editor now shows all 10 fish types |

### Marketplace (public)

| Page | Status | API calls |
|------|--------|-----------|
| `/marketplace` | ✅ | `GET /marketplace` + optional `?category=live\|processed` query — see B7 for backend filter support |
| `/marketplace` | ✅ | Inline Special Demand form (checkbox toggle, AnimatePresence dropdown) → `POST /buyers/demands` |
| `/marketplace/[id]` | ✅ | `GET /marketplace/:id`, cart operations, heart button calls `POST/DELETE /buyers/saved` |
| `/marketplace/checkout` | ✅ | `POST /marketplace/checkout`, Paystack redirect |
| `/payments/verify` | ✅ | `GET /payments/verify?reference=` |

---

## Backend — Outstanding Work

> Priority order listed top to bottom.

---

### B1 — Fix `GET /admin/settings` public access ❌

**File:** `src/routes/admin.routes.ts`

**Problem:** `router.use(authMiddleware)` is registered before `GET /settings`, so marketplace visitors (all guests) get 401 and fall back to wrong hardcoded prices.

**Fix — move GET /settings before the auth middleware:**

```typescript
// admin.routes.ts

// Public — no auth (used by PlatformSettingsContext for all visitors)
router.get("/settings", adminController.getSettings);

// All other routes are admin-only
router.use(authMiddleware);
router.use(adminController.requireAdmin);

router.patch("/settings/price", adminController.updatePrices);
// ... rest unchanged
```

---

### B2 — Add processed fish types to Prisma `FishType` enum and Zod schemas ❌

The frontend now supports 10 fish types across two categories. The backend Prisma enum and Zod validation layers need to match.

#### Step 1 — Update Prisma schema

**File:** `prisma/schema.prisma`

Current enum:
```prisma
enum FishType {
  catfish
  fingerlings
  juveniles
  table_size
  jumbo
  parent_stocks
}
```

Updated enum (keep `catfish` for backwards compat with existing records; add all processed types):
```prisma
enum FishType {
  catfish
  fingerlings
  juveniles
  table_size
  jumbo
  parent_stocks
  dried
  grilled
  peppersoup
  peppered
  smoked
}
```

Run:
```bash
npx prisma migrate dev --name add_processed_fish_types
npx prisma generate
```

#### Step 2 — Update Zod validation

**File:** `src/models/listing.model.ts`

Change both `createListingSchema` and `updateListingSchema`:
```typescript
fish_type: z.enum([
  "catfish",
  "fingerlings",
  "juveniles",
  "table_size",
  "jumbo",
  "parent_stocks",
  "dried",
  "grilled",
  "peppersoup",
  "peppered",
  "smoked",
])
```

Also check `farmers.controller.ts` for any inline `fishType` validation and mirror this list there.

#### Step 3 — Update admin settings price schema

**File:** wherever `PATCH /admin/settings/price` validates its body (likely `src/models/admin.model.ts` or inline in the controller).

The body now accepts prices for all 10 types:
```typescript
pricePerKg: z.object({
  catfish: z.number().positive().optional(),
  fingerlings: z.number().positive().optional(),
  juveniles: z.number().positive().optional(),
  table_size: z.number().positive().optional(),
  jumbo: z.number().positive().optional(),
  parent_stocks: z.number().positive().optional(),
  dried: z.number().positive().optional(),
  grilled: z.number().positive().optional(),
  peppersoup: z.number().positive().optional(),
  peppered: z.number().positive().optional(),
  smoked: z.number().positive().optional(),
}).partial()
```

And the `GET /admin/settings` response `pricePerKg` object should include all 10 keys (fill missing ones with sensible defaults if they are null in the DB).

**Suggested default fallback prices to seed or return when a value is null:**

| Fish Type | ₦ per kg |
|-----------|----------|
| catfish | 3500 |
| fingerlings | 1200 |
| juveniles | 800 |
| table_size | 3500 |
| jumbo | 5000 |
| parent_stocks | 8000 |
| dried | 6000 |
| grilled | 5500 |
| peppersoup | 7000 |
| peppered | 6500 |
| smoked | 6000 |

#### Step 4 — Update Demand model (if fish_type is a Prisma enum there too)

**File:** `prisma/schema.prisma`

If the `Demand` model uses `fish_type FishType` (enum), it automatically picks up the new values from Step 1. If it uses a plain `String`, no change needed.

Also check if there is a Zod demand schema in `src/models/demand.model.ts` and add the same fish type list there.

---

### B3 — Saved Listings endpoints ❌

**Routes called by frontend:** `GET /buyers/saved`, `POST /buyers/saved`, `DELETE /buyers/saved/:listingId`

**Frontend pages affected:**
- `/buyers-dashboard/saved` — shows error state (no endpoint)
- `/marketplace` — save optimistically updates localStorage; API call silently fails
- `/marketplace/[id]` — Heart button silently fails

**None of these exist. Full implementation needed:**

#### Step 1 — Add `SavedListing` model to `prisma/schema.prisma`

```prisma
model SavedListing {
  id         String   @id @default(uuid()) @db.Uuid
  user_id    String   @db.Uuid
  listing_id String   @db.Uuid
  created_at DateTime @default(now())

  user    User    @relation("UserSavedListings", fields: [user_id], references: [id], onDelete: Cascade)
  listing Listing @relation("ListingSavedBy", fields: [listing_id], references: [id], onDelete: Cascade)

  @@unique([user_id, listing_id])
  @@index([user_id])
  @@map("saved_listings")
}
```

Add relations to existing models:
- `User` model: `savedListings SavedListing[] @relation("UserSavedListings")`
- `Listing` model: `savedBy SavedListing[] @relation("ListingSavedBy")`

Then run:
```bash
npx prisma migrate dev --name add_saved_listings
npx prisma generate
```

#### Step 2 — Add controller functions to `src/controllers/buyers.controller.ts`

```typescript
export const getSavedListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.user_id;
    const saved = await prisma.savedListing.findMany({
      where: { user_id: userId },
      include: {
        listing: { include: { images: { where: { is_primary: true }, take: 1 } } },
      },
      orderBy: { created_at: "desc" },
    });
    res.status(200).json({
      status: "success",
      data: { listings: saved.map((s) => s.listing) },
    });
  } catch (error) { next(error); }
};

export const saveListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.user_id;
    const { listingId } = req.body as { listingId: string };
    if (!listingId) throw new ApiError(400, "listingId is required.");
    await prisma.savedListing.upsert({
      where: { user_id_listing_id: { user_id: userId, listing_id: listingId } },
      update: {},
      create: { user_id: userId, listing_id: listingId },
    });
    res.status(200).json({ status: "success", message: "Listing saved." });
  } catch (error) { next(error); }
};

export const unsaveListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.user_id;
    const { listingId } = req.params;
    await prisma.savedListing.deleteMany({
      where: { user_id: userId, listing_id: listingId },
    });
    res.status(200).json({ status: "success", message: "Listing removed from saved." });
  } catch (error) { next(error); }
};
```

#### Step 3 — Register routes in `src/routes/buyers.routes.ts`

```typescript
router.get("/saved", buyersController.getSavedListings);
router.post("/saved", buyersController.saveListing);
router.delete("/saved/:listingId", buyersController.unsaveListing);
```

**Expected response shapes:**

`GET /buyers/saved`:
```json
{
  "status": "success",
  "data": {
    "listings": [
      {
        "id": "uuid",
        "fish_type": "table_size",
        "packaging_weight_kg": 5,
        "quantity_available": 100,
        "price_per_fish": 17500,
        "price_per_kg": 3500,
        "location_state": "Kaduna",
        "location_lga": "Chikun"
      }
    ]
  }
}
```

`POST /buyers/saved` body: `{ "listingId": "uuid" }`

`DELETE /buyers/saved/:listingId` — no body

---

### B4 — `GET /cluster/farmers/:farmerId` endpoint ❌

**Routes called by frontend:** `GET /cluster/farmers/:farmerId`

**Frontend pages affected:**
- `/cluster-dashboard/farmers/[id]` — shows error state
- `/cluster-dashboard/farmers` list — "Full Profile" button hidden (no `id` in list response — see B4a)

#### B4a — Add `id` to `GET /cluster/farmers` response

**File:** `src/controllers/cluster.controller.ts` — `getFarmers` function

In the `farmersWithStats` map, add:
```typescript
return {
  id: f.id,          // ← add this
  farmerName: f.full_name,
  // ... rest unchanged
};
```

#### B4b — Add `getFarmerById` controller function

**File:** `src/controllers/cluster.controller.ts`

```typescript
export const getFarmerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clusterFarmerId = req.user!.user_id;
    const { farmerId } = req.params;

    const farmer = await prisma.user.findFirst({
      where: { id: farmerId, cluster_farmer_id: clusterFarmerId, role: "farmer" },
    });
    if (!farmer) throw new ApiError(404, "Farmer not found.");

    const [totalListings, approvedListings, pendingListings] = await Promise.all([
      prisma.listing.count({ where: { farmer_id: farmerId, status: { not: "deleted" } } }),
      prisma.listing.count({ where: { farmer_id: farmerId, cluster_approved: true } }),
      prisma.listing.count({ where: { farmer_id: farmerId, status: "pending" } }),
    ]);

    const totalKg = await prisma.listing.aggregate({
      where: { farmer_id: farmerId, status: "active" },
      _sum: { total_available_kg: true },
    });

    const recentListings = await prisma.listing.findMany({
      where: { farmer_id: farmerId, status: { not: "deleted" } },
      orderBy: { listed_date: "desc" },
      take: 5,
    });

    res.status(200).json({
      status: "success",
      data: {
        farmer: {
          id: farmer.id,
          fullName: farmer.full_name,
          email: farmer.email,
          phoneNumber: farmer.phone_number,
          profilePhotoUrl: farmer.profile_photo_url,
          farmName: farmer.farm_name,
          state: farmer.location_state,
          localGovernment: farmer.location_lga,
          farmingCapacityKg: farmer.farming_capacity_kg ? Number(farmer.farming_capacity_kg) : null,
          yearsOfExperience: farmer.years_of_experience,
          verificationStatus: farmer.verification_status,
          memberSince: farmer.created_at,
          stats: {
            totalListings,
            approvedListings,
            pendingListings,
            totalSupplyKg: Number(totalKg._sum.total_available_kg ?? 0),
          },
          recentListings: recentListings.map((l) => ({
            id: l.id,
            fishType: l.fish_type,
            totalAvailableKg: Number(l.total_available_kg),
            status: l.status,
            createdAt: l.created_at,
          })),
        },
      },
    });
  } catch (error) { next(error); }
};
```

#### B4c — Register route in `src/routes/cluster.routes.ts`

```typescript
// After: router.get("/farmers", clusterController.getFarmers)
router.get("/farmers/:farmerId", clusterController.getFarmerById);
```

---

### B5 — Notifications system ❌

**Routes called by frontend:** `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`

**Frontend pages affected:** Notifications bell always shows 0. Hook polls every 60 seconds and handles empty responses gracefully.

#### Step 1 — Add `Notification` model to `prisma/schema.prisma`

```prisma
enum NotificationType {
  info
  success
  warning
  error
}

model Notification {
  id         String           @id @default(uuid()) @db.Uuid
  user_id    String           @db.Uuid
  title      String
  message    String           @db.Text
  type       NotificationType @default(info)
  read       Boolean          @default(false)
  created_at DateTime         @default(now())

  user User @relation("UserNotifications", fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id, read])
  @@map("notifications")
}
```

Add to `User` model: `notifications Notification[] @relation("UserNotifications")`

Run: `npx prisma migrate dev --name add_notifications && npx prisma generate`

#### Step 2 — Create `src/controllers/notifications.controller.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import { prisma } from "../models/user.model.js";

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.user_id;
    const notifications = await prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      take: 50,
    });
    const unreadCount = notifications.filter((n) => !n.read).length;
    res.status(200).json({ status: "success", data: { notifications, unreadCount } });
  } catch (error) { next(error); }
};

export const markRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.user_id;
    await prisma.notification.updateMany({
      where: { id: req.params.notificationId, user_id: userId },
      data: { read: true },
    });
    res.status(200).json({ status: "success", message: "Marked as read." });
  } catch (error) { next(error); }
};

export const markAllRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.user_id;
    await prisma.notification.updateMany({
      where: { user_id: userId, read: false },
      data: { read: true },
    });
    res.status(200).json({ status: "success", message: "All notifications marked as read." });
  } catch (error) { next(error); }
};
```

#### Step 3 — Create `src/routes/notifications.routes.ts`

```typescript
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import * as notificationsController from "../controllers/notifications.controller.js";

const router = Router();
router.use(authMiddleware);

router.get("/", notificationsController.getNotifications);
router.patch("/read-all", notificationsController.markAllRead);    // must be before /:id
router.patch("/:notificationId/read", notificationsController.markRead);

export default router;
```

#### Step 4 — Register in `src/routes/index.ts`

```typescript
import notificationRoutes from "./notifications.routes.js";
router.use("/notifications", notificationRoutes);
```

#### Step 5 — Trigger notifications from existing controllers

| Event | File | Recipient | Title | Type |
|-------|------|-----------|-------|------|
| Listing approved by cluster | `cluster.controller.ts → approveRejectListing` | Farmer | "Listing Approved" | `success` |
| Listing rejected by cluster | `cluster.controller.ts → approveRejectListing` | Farmer | "Listing Rejected" | `error` |
| Order placed | `buyers.controller.ts → createOrder` | Cluster farmer | "New Order Received" | `info` |
| Order status updated | `cluster.controller.ts → updateOrder` | Buyer | "Order Update" | `info` |
| Payment confirmed | `buyers.controller.ts → verifyPayment` | Farmer + Cluster farmer | "Payment Received" | `success` |
| Demand assigned | `admin.controller.ts → assignDemand` | Cluster farmer | "New Demand Assigned" | `info` |
| Cluster approved | `admin.controller.ts → approveClusterApplication` | Applicant | "Application Approved" | `success` |
| Cluster rejected | `admin.controller.ts → rejectClusterApplication` | Applicant | "Application Rejected" | `error` |

---

### B6 — `GET /farmers/payouts` response shape verification

Verify both `GET /farmers/payouts` and `GET /cluster/payouts` return:
```json
{
  "status": "success",
  "data": {
    "payouts": [
      {
        "id": "uuid",
        "orderId": "uuid",
        "orderNumber": "AG-2026-123456",
        "amount": 52500,
        "status": "pending",
        "createdAt": "2026-06-01T00:00:00.000Z",
        "paidAt": null
      }
    ],
    "totalEarnings": 105000,
    "pendingPayouts": 52500
  }
}
```

---

### B7 — Marketplace category filter (`?category=live|processed`) ❌

**Route:** `GET /marketplace`

**Problem:** The frontend now sends `?category=live` or `?category=processed` from the filters sidebar and from landing page CTAs. The backend currently ignores this param — it only uses `?fishType`.

**Fix — add category filtering to the marketplace controller:**

**File:** `src/controllers/marketplace.controller.ts` (or wherever `GET /marketplace` is handled)

```typescript
const { fishType, state, lga, minPrice, maxPrice, page = 1, limit = 20, category } = req.query;

// Build where clause
const where: Prisma.ListingWhereInput = { status: "active", visible_on_marketplace: true };

// fishType exact match (existing logic — keep as-is)
if (fishType) {
  where.fish_type = fishType as string;
}

// category filter — maps to live/processed fish type groups
if (category && !fishType) {
  const LIVE_TYPES = ["fingerlings", "juveniles", "table_size", "jumbo", "parent_stocks"];
  const PROCESSED_TYPES = ["dried", "grilled", "peppersoup", "peppered", "smoked"];
  if (category === "live") {
    where.fish_type = { in: LIVE_TYPES };
  } else if (category === "processed") {
    where.fish_type = { in: PROCESSED_TYPES };
  }
}

// ... rest of existing where clause (state, price, etc.)
```

> If `fishType` is also present, it takes precedence and `category` is ignored — the frontend always clears `fishType` when `category` changes, so there should be no conflict in practice.

**No schema changes needed — this is query logic only.**

---

### B8 — Demand `fishVariant` field update ❌

**Route:** `POST /buyers/demands`

**What changed:** The inline demand form (now on the marketplace page) sends:
- `fishType`: the specific sub-type, e.g. `"fingerlings"`, `"dried"`
- `fishVariant`: the category — `"live"` or `"processed"`

**If the Demand model has `fish_variant` as an enum** (not a free string), the backend Zod validation will reject `"live"` and `"processed"` as invalid values.

**Fix — update the demand Zod schema to accept category values:**

**File:** `src/models/demand.model.ts` (or wherever the create-demand body is validated)

```typescript
fish_variant: z.enum([
  // category labels (new — sent by marketplace inline form)
  "live",
  "processed",
  // legacy variant values (keep for backwards compat if old demands exist)
  "dried",
  "jumbo",
  "table_size",
  "broodstock",
]).optional(),
```

If `fish_variant` in the Prisma schema is a plain `String` column, no schema migration is needed — just the Zod validation above.

---

## Known Intentional Limitations (Not Bugs)

| Feature | Location | Notes |
|---------|----------|-------|
| "Report an Issue" button | `/buyers-dashboard/orders/[id]` | Shows toast. No support-ticket API endpoint. |
| "View Sessions" button | `/admin-dashboard/settings` | Shows toast. No `GET /auth/sessions` endpoint. |
| "Invoice" button | `/buyers-dashboard/orders/[id]` | No handler. No invoice-generation endpoint. |
| Platform config values | `/admin-dashboard/settings` | Shows hardcoded OTP expiry, session duration. No config API endpoint. |
| Financial services pages | All `/financial/*` routes | Excluded from current scope. |

---

## All Frontend-Consumed Endpoints (Complete Reference)

### AUTH

| Method | Path | Auth | Body | Notes |
|--------|------|------|------|-------|
| POST | `/auth/role` | None | `{ role }` | |
| POST | `/auth/register` | None | `{ fullName, phone, email, state, localGovernment, password }` | |
| POST | `/auth/register/otp` | None | `{ emailAddress, registerOtp }` | |
| POST | `/auth/register/otp/resend` | None | `{ emailAddress }` | |
| POST | `/auth/login` | None | `{ emailAddress, password }` | |
| POST | `/auth/login/otp` | None | `{ emailAddress, loginOtp }` | |
| POST | `/auth/login/otp/resend` | None | `{ emailAddress }` | |
| POST | `/auth/forgot-password` | None | `{ emailAddress }` | |
| POST | `/auth/forgot-password/otp` | None | `{ emailAddress, resetOtp, newPassword }` | |
| POST | `/auth/forgot-password/otp/resend` | None | `{ emailAddress }` | |
| GET | `/auth/me` | ✓ | — | |
| POST | `/auth/verify` | ✓ | `{ bvn, creditConsent }` | |
| POST | `/auth/refresh` | None | `{ refresh_token }` | |
| POST | `/auth/logout` | ✓ | — | Via Next.js proxy at `/api/auth/logout` |
| POST | `/auth/logout/all` | ✓ | — | |

### FARMER

| Method | Path | Auth | Body | Notes |
|--------|------|------|------|-------|
| POST | `/farmers/listings/create` | ✓ farmer | `{ fishType, harvestDate, totalFishAvailable, weightKg, listedDate? }` | fishType accepts all 10 types — see B2 |
| GET | `/farmers/listings/get` | ✓ farmer | — | Returns `{ summary, listings }` |
| GET | `/farmers/recent-activities` | ✓ farmer | — | Returns `{ activities }` |
| PATCH | `/farmers/account-profile` | ✓ farmer | `{ fullName?, phoneNumber?, email?, profileImage?, farmName?, farmAddress?, localGovernment?, state?, fishType?, farmingCapacityKg?, yearsOfExperience? }` | |
| PATCH | `/farmers/cluster-farmer-application` | ✓ farmer | `{ businessName, cacNumber, warehouseLocation, distributionCapacity, logisticsAvailable?, ... }` | |
| GET | `/farmers/orders` | ✓ farmer | — | |
| GET | `/farmers/payouts` | ✓ farmer | — | See B6 for expected shape |

### CLUSTER

| Method | Path | Auth | Body | Notes |
|--------|------|------|------|-------|
| PATCH | `/cluster/account-profile` | ✓ cluster | `{ fullName?, phoneNumber?, email?, profileImage? }` | |
| GET | `/cluster/listings/get` | ✓ cluster | — | |
| GET | `/cluster/current-activities` | ✓ cluster | — | |
| GET | `/cluster/pending-approvals` | ✓ cluster | — | |
| PATCH | `/cluster/pending-approvals/:listingId` | ✓ cluster | `{ status: "approved"\|"rejected", rejectionReason? }` | |
| GET | `/cluster/farmers` | ✓ cluster | — | Must include `id` per farmer — see B4a |
| GET | `/cluster/farmers/:farmerId` | ✓ cluster | — | **Missing — see B4b** |
| GET | `/cluster/orders` | ✓ cluster | — | |
| PATCH | `/cluster/orders/:orderId` | ✓ cluster | `{ status, notes? }` | |
| GET | `/cluster/demands` | ✓ cluster | — | |
| PATCH | `/cluster/demands/:demandId/accept` | ✓ cluster | — | |
| PATCH | `/cluster/demands/:demandId/decline` | ✓ cluster | `{ reason? }` | |
| PATCH | `/cluster/demands/:demandId/fulfill` | ✓ cluster | — | |
| GET | `/cluster/payouts` | ✓ cluster | — | See B6 for expected shape |

### BUYER

| Method | Path | Auth | Body | Notes |
|--------|------|------|------|-------|
| PATCH | `/buyers/account-profile` | ✓ buyer | `{ fullName?, companyName?, phoneNumber?, email?, profileImage?, deliveryAddress?, localGovernment?, state?, businessType? }` | |
| POST | `/buyers/orders` | ✓ buyer | `{ deliveryType, deliveryAddress?, deliveryFee?, items: [{listingId, quantity, weightKg, pricePerUnit}], totalAmount }` | |
| GET | `/buyers/orders` | ✓ buyer | — | |
| GET | `/buyers/orders/:orderId` | ✓ buyer | — | |
| GET | `/buyers/orders/:orderId/tracking` | ✓ buyer | — | |
| PATCH | `/buyers/orders/:orderId/confirm-delivery` | ✓ buyer | `{ payoutDelay: "24 hours" }` | |
| POST | `/buyers/orders/:orderId/pay` | ✓ buyer | `{ paymentMethod: "card", amount }` | Returns `{ authorizationUrl, transactionReference, amount }` |
| GET | `/payments/verify` | None | `?reference=` | Paystack callback |
| GET | `/buyers/demands` | ✓ buyer | — | |
| POST | `/buyers/demands` | ✓ buyer | `{ fishType, weightKg, fishVariant?, locationState, locationLga, deliveryAddress, notes? }` | fishType = specific sub-type (e.g. "dried"); fishVariant = "live" or "processed" — see B8 |
| DELETE | `/buyers/demands/:demandId` | ✓ buyer | — | |
| GET | `/buyers/saved` | ✓ buyer | — | **Missing — see B3** |
| POST | `/buyers/saved` | ✓ buyer | `{ listingId }` | **Missing — see B3** |
| DELETE | `/buyers/saved/:listingId` | ✓ buyer | — | **Missing — see B3** |

### MARKETPLACE

| Method | Path | Auth | Body / Query | Notes |
|--------|------|------|------|-------|
| GET | `/marketplace` | None | `?fishType=&category=live\|processed&state=&lga=&minPrice=&maxPrice=&page=&limit=` | category filter — see B7 |
| GET | `/marketplace/:listingId` | None | — | |
| GET | `/marketplace/cart` | ✓ | — | |
| POST | `/marketplace/cart` | ✓ | `{ listingId, variant?, processed?, weightKg, quantity, pricePerUnit }` | |
| PATCH | `/marketplace/cart/:cartItemId` | ✓ | `{ quantity?, weightKg? }` | |
| DELETE | `/marketplace/cart/:cartItemId` | ✓ | — | |
| POST | `/marketplace/checkout` | ✓ | `{ deliveryType, deliveryAddress?, deliveryFee?, totalAmount, cartItems: [{cartItemId}] }` | |

### ADMIN

| Method | Path | Auth | Body / Query | Notes |
|--------|------|------|------|-------|
| GET | `/admin/settings` | **None — see B1** | — | Response `pricePerKg` must include all 10 fish types — see B2 |
| PATCH | `/admin/settings/price` | ✓ admin | `{ pricePerKg: { fingerlings?, juveniles?, table_size?, jumbo?, parent_stocks?, dried?, grilled?, peppersoup?, peppered?, smoked? } }` | All keys optional |
| GET | `/admin/dashboard/metrics` | ✓ admin | — | |
| GET | `/admin/dashboard/charts` | ✓ admin | — | |
| GET | `/admin/dashboard/activities` | ✓ admin | — | |
| GET | `/admin/cluster-applications` | ✓ admin | — | |
| PUT | `/admin/cluster-applications/:id/approve` | ✓ admin | — | |
| PUT | `/admin/cluster-applications/:id/reject` | ✓ admin | `{ reason? }` | |
| GET | `/admin/listings` | ✓ admin | `?status=&fishType=&state=` | |
| PUT | `/admin/listings/:id/approve` | ✓ admin | — | |
| PUT | `/admin/listings/:id/reject` | ✓ admin | `{ reason? }` | |
| PATCH | `/admin/listings/:id/flag` | ✓ admin | — | |
| DELETE | `/admin/listings/:id` | ✓ admin | — | |
| GET | `/admin/farmers` | ✓ admin | `?role=&state=&verificationStatus=` | |
| GET | `/admin/farmers/:id` | ✓ admin | — | |
| PATCH | `/admin/farmers/:id/toggle-active` | ✓ admin | — | |
| GET | `/admin/orders` | ✓ admin | `?status=&paymentStatus=` | |
| GET | `/admin/orders/:id` | ✓ admin | — | |
| GET | `/admin/demands` | ✓ admin | `?status=&state=` | |
| GET | `/admin/demands/:id` | ✓ admin | — | |
| PATCH | `/admin/demands/:id/assign` | ✓ admin | `{ cluster_farmer_id }` | |

### NOTIFICATIONS (missing — see B5)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/notifications` | ✓ | Returns `{ notifications: [...], unreadCount: number }` |
| PATCH | `/notifications/read-all` | ✓ | Must be registered BEFORE `/:notificationId/read` |
| PATCH | `/notifications/:notificationId/read` | ✓ | |

---

## Backend Priority Order

1. **B1** — Fix `GET /admin/settings` public access (1-line change in `admin.routes.ts`)
2. **B2** — Add processed fish types to Prisma enum + Zod schemas + admin settings price schema
3. **B7** — Marketplace `?category=` filter (query logic only, no migration)
4. **B8** — Demand `fishVariant` Zod schema accepts `"live"` / `"processed"`
5. **B3** — Saved listings (Prisma migration + 3 controller functions + route wiring)
6. **B4a** — Add `id` field to `GET /cluster/farmers` response
7. **B4b/c** — `GET /cluster/farmers/:farmerId` endpoint
8. **B5** — Notifications system (Prisma migration + controller + routes + trigger points)
9. **B6** — Verify payout response shapes
