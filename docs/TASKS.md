# Backend Tasks

## Project Context

- **Frontend:** `/home/olorunshogo/Projects/Next/Agro-chain/frontend` (Next.js 15, TypeScript, App Router)
- **Backend:** `/home/olorunshogo/Projects/Next/Agro-chain/Agro-chain` (Express, Prisma, PostgreSQL)
- **API base (dev):** `http://localhost:5000/api`
- **Frontend (dev):** `http://localhost:3000`

---

## Fish Type Model — How the Frontend Works

The platform sells **catfish only**, distinguished by processing stage. The frontend has two categories:

| Category | `fishType` values sent to backend |
|----------|-----------------------------------|
| **Live** *(default)* | `fingerlings`, `juveniles`, `table_size`, `jumbo`, `parent_stocks` |
| **Processed** | `dried`, `grilled`, `peppersoup`, `peppered`, `smoked` |

`catfish` as a bare `fishType` value is **legacy** — it may exist in old records but the frontend never sends it in new submissions.

`fishVariant` is now the **category label**: `"live"` or `"processed"`. The frontend sends it on demand creation so cluster farmers and admin know the fulfilment type at a glance.

The Prisma `FishType` enum currently only contains the 5 live types plus the legacy `catfish`. Every task below that touches `fishType` depends on expanding that enum first (see **B2**).

---

## Backend — Outstanding Work

> **Priority order:** B1 → B2 → B7 → B8 → B3 → B4 → B5 → B6

---

### B1 — Fix `GET /admin/settings` public access ❌

**File:** `src/routes/admin.routes.ts`

**Problem:** `router.use(authMiddleware)` fires before `GET /settings`, so unauthenticated marketplace visitors receive a 401. The frontend's `PlatformSettingsContext` calls this endpoint on every page load and falls back to hardcoded prices when it fails.

**Fix — move the GET /settings route above the auth middleware:**

```typescript
// src/routes/admin.routes.ts

const router = Router();

// ── Public (no auth) ─────────────────────────────────────────────────────────
// Used by PlatformSettingsContext on every page load, including unauthenticated
// visitors browsing the marketplace.
router.get("/settings", adminController.getSettings);

// ── Admin-only ────────────────────────────────────────────────────────────────
router.use(authMiddleware);
router.use(adminController.requireAdmin);

router.patch("/settings/price", adminController.updatePrices);
// … rest unchanged
```

**No schema migration needed.**

---

### B2 — Expand `FishType` enum and all Zod/validation layers ❌

This is the single most critical structural change. Everything that touches `fishType` breaks until the enum is expanded.

#### Step 1 — Update `prisma/schema.prisma`

**Current enum:**
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

**Updated enum** (keep `catfish` for backwards-compat with existing DB rows):
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

Also expand `FishVariant` to accept the category labels the frontend sends on demand creation:
```prisma
enum FishVariant {
  dried
  jumbo
  table_size
  broodstock
  live        // ← new — category label sent by marketplace demand form
  processed   // ← new — category label sent by marketplace demand form
}
```

Run:
```bash
npx prisma migrate dev --name add_processed_fish_types
npx prisma generate
```

#### Step 2 — Update Zod validation in `src/models/listing.model.ts`

Both `createListingSchema` and `updateListingSchema` currently reject processed types. Update both:

```typescript
// src/models/listing.model.ts

const FISH_TYPE_ENUM = [
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
] as const;

export const createListingSchema = z.object({
  body: z.object({
    fish_type: z.enum(FISH_TYPE_ENUM),
    quantity_available: z.number().int().positive(),
    price_per_fish: z.number().positive(),
    price_per_kg: z.number().positive().optional(),
    size_min_cm: z.number().positive().optional(),
    size_max_cm: z.number().positive().optional(),
    weight_min_grams: z.number().positive().optional(),
    weight_max_grams: z.number().positive().optional(),
    harvest_date: z.string().datetime(),
    location_state: z.string().min(2),
    location_lga: z.string().min(2),
    location_address: z.string().min(2),
    delivery_available: z.boolean().default(false),
    delivery_fee: z.number().nonnegative().optional(),
    is_draft: z.boolean().default(false),
  }),
});

export const updateListingSchema = z.object({
  body: z.object({
    fish_type: z.enum(FISH_TYPE_ENUM).optional(),
    // … all other optional fields unchanged
  }),
});
```

#### Step 3 — Update demand Zod schema

**File:** `src/models/demand.model.ts` (or wherever `POST /buyers/demands` validates its body — may be inline in the controller)

The frontend sends:
- `fishType`: the specific sub-type, e.g. `"fingerlings"` or `"dried"`
- `fishVariant`: the category, either `"live"` or `"processed"`

```typescript
// demand validation schema
z.object({
  fishType: z.enum([
    "catfish", "fingerlings", "juveniles", "table_size", "jumbo",
    "parent_stocks", "dried", "grilled", "peppersoup", "peppered", "smoked",
  ]),
  weightKg: z.number().positive(),
  fishVariant: z.enum(["live", "processed", "dried", "jumbo", "table_size", "broodstock"]).optional(),
  locationState: z.string().min(2),
  locationLga: z.string().min(2),
  deliveryAddress: z.string().min(2),
  notes: z.string().optional(),
})
```

#### Step 4 — Update admin settings price schema and defaults

**File:** `src/controllers/admin.controller.ts`

The current `DEFAULT_PRICES` only covers 6 types. Expand it and ensure `GET /admin/settings` always returns all 11 keys (filling nulls with defaults):

```typescript
// src/controllers/admin.controller.ts

const DEFAULT_PRICES: Record<string, number> = {
  catfish:       3500,
  fingerlings:   1200,
  juveniles:      800,
  table_size:    3500,
  jumbo:         5000,
  parent_stocks: 8000,
  dried:         6000,
  grilled:       5500,
  peppersoup:    7000,
  peppered:      6500,
  smoked:        6000,
};

export const getSettings = async (req, res, next) => {
  try {
    let settings = await prisma.platformSettings.findFirst();
    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: { price_per_kg: DEFAULT_PRICES },
      });
    }
    // Always return all keys so frontend never falls back to stale hardcoded values
    const pricePerKg = { ...DEFAULT_PRICES, ...(settings.price_per_kg as object) };
    res.status(200).json({
      status: "success",
      data: { settings: { pricePerKg, updatedAt: settings.updated_at, updatedBy: settings.updated_by } },
    });
  } catch (error) { next(error); }
};
```

The `PATCH /admin/settings/price` body schema should accept all 11 keys, all optional:
```typescript
pricePerKg: z.object({
  catfish:       z.number().positive().optional(),
  fingerlings:   z.number().positive().optional(),
  juveniles:     z.number().positive().optional(),
  table_size:    z.number().positive().optional(),
  jumbo:         z.number().positive().optional(),
  parent_stocks: z.number().positive().optional(),
  dried:         z.number().positive().optional(),
  grilled:       z.number().positive().optional(),
  peppersoup:    z.number().positive().optional(),
  peppered:      z.number().positive().optional(),
  smoked:        z.number().positive().optional(),
}).partial()
```

**Expected `GET /admin/settings` response:**
```json
{
  "status": "success",
  "data": {
    "settings": {
      "pricePerKg": {
        "catfish":       3500,
        "fingerlings":   1200,
        "juveniles":      800,
        "table_size":    3500,
        "jumbo":         5000,
        "parent_stocks": 8000,
        "dried":         6000,
        "grilled":       5500,
        "peppersoup":    7000,
        "peppered":      6500,
        "smoked":        6000
      },
      "updatedAt": "2026-06-04T00:00:00.000Z",
      "updatedBy": null
    }
  }
}
```

---

### B3 — Saved Listings endpoints ❌

**Routes called by frontend:**
- `GET /buyers/saved`
- `POST /buyers/saved`
- `DELETE /buyers/saved/:listingId`

**Frontend pages affected:**
- `/buyers-dashboard/saved` — shows error state (endpoint missing)
- `/marketplace` — heart/save button silently fails
- `/marketplace/[id]` — heart button silently fails

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

Add relations to existing models in the schema:
```prisma
// User model — add:
savedListings SavedListing[] @relation("UserSavedListings")

// Listing model — add:
savedBy SavedListing[] @relation("ListingSavedBy")
```

Run:
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
        listing: {
          include: { images: { where: { is_primary: true }, take: 1 } },
        },
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
        "location_lga": "Chikun",
        "status": "active",
        "cluster_approved": true,
        "images": [{ "image_url": "https://...", "is_primary": true }]
      }
    ]
  }
}
```

`POST /buyers/saved` — request body:
```json
{ "listingId": "uuid" }
```

`DELETE /buyers/saved/:listingId` — no body, idempotent (200 even if record does not exist).

---

### B4 — `GET /cluster/farmers/:farmerId` + `id` field in farmers list ❌

#### B4a — Add `id` to `GET /cluster/farmers` response

**File:** `src/controllers/cluster.controller.ts` — `getFarmers` function

In the `farmersWithStats` map, the `id` field is currently missing. The frontend's "Full Profile" button on `/cluster-dashboard/farmers` uses `farmer.id` to navigate to `/cluster-dashboard/farmers/[id]`. Without it the button never renders.

```typescript
return {
  id: f.id,              // ← add this line
  farmerName: f.full_name,
  fishType: f.fish_type_preference ?? "fingerlings",  // default to live type, not "catfish"
  totalListings,
  totalApprovedListings,
  totalPendingListings,
  farmName: f.farm_name,
  location: `${f.location_lga}, ${f.location_state}`,
  phoneNumber: f.phone_number,
  emailAddress: f.email,
  capacity: f.farming_capacity_kg ? Number(f.farming_capacity_kg) : null,
  experience: f.years_of_experience,
  memberSince: f.created_at,
  lastActive: lastActivity?.created_at ?? f.created_at,
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
// Must come AFTER router.get("/farmers", clusterController.getFarmers)
router.get("/farmers/:farmerId", clusterController.getFarmerById);
```

**Expected `GET /cluster/farmers/:farmerId` response:**
```json
{
  "status": "success",
  "data": {
    "farmer": {
      "id": "uuid",
      "fullName": "Musa Aliyu",
      "email": "musa@example.com",
      "phoneNumber": "08012345678",
      "profilePhotoUrl": null,
      "farmName": "Musa Farms",
      "state": "Kaduna",
      "localGovernment": "Chikun",
      "farmingCapacityKg": 5000,
      "yearsOfExperience": 4,
      "verificationStatus": "verified",
      "memberSince": "2026-01-15T00:00:00.000Z",
      "stats": {
        "totalListings": 8,
        "approvedListings": 6,
        "pendingListings": 1,
        "totalSupplyKg": 3200
      },
      "recentListings": [
        {
          "id": "uuid",
          "fishType": "table_size",
          "totalAvailableKg": 500,
          "status": "active",
          "createdAt": "2026-05-20T00:00:00.000Z"
        }
      ]
    }
  }
}
```

---

### B5 — Notifications system ❌

**Routes called by frontend:**
- `GET /notifications`
- `PATCH /notifications/:notificationId/read`
- `PATCH /notifications/read-all`

The frontend notification bell polls `GET /notifications` every 60 seconds and renders `unreadCount` as a badge. It handles empty responses gracefully (shows 0).

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

Add to the `User` model:
```prisma
notifications Notification[] @relation("UserNotifications")
```

Run:
```bash
npx prisma migrate dev --name add_notifications
npx prisma generate
```

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

/** Utility — call this from any controller to push a notification. */
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" = "info",
) => {
  await prisma.notification.create({ data: { user_id: userId, title, message, type } });
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
router.patch("/read-all", notificationsController.markAllRead);   // must be BEFORE /:notificationId
router.patch("/:notificationId/read", notificationsController.markRead);

export default router;
```

#### Step 4 — Register in `src/routes/index.ts`

```typescript
import notificationRoutes from "./notifications.routes.js";
router.use("/notifications", notificationRoutes);
```

#### Step 5 — Wire notification triggers into existing controllers

Import `createNotification` at the top of each relevant controller:
```typescript
import { createNotification } from "./notifications.controller.js";
```

| Event | File | Where to call | Recipient | Title | Message | Type |
|-------|------|---------------|-----------|-------|---------|------|
| Listing approved by cluster | `cluster.controller.ts` → `approveRejectListing` | After the `prisma.listing.update` | `listing.farmer_id` | `"Listing Approved"` | `"Your listing \"${fishType} ${totalKg}kg\" has been approved and is now live on the marketplace."` | `success` |
| Listing rejected by cluster | `cluster.controller.ts` → `approveRejectListing` | After the `prisma.listing.update` | `listing.farmer_id` | `"Listing Rejected"` | `"Your listing \"${fishType} ${totalKg}kg\" was rejected. Reason: ${rejectionReason}"` | `error` |
| Order placed | `marketplace.controller.ts` → `checkout` | After `prisma.order.create` | `clusterFarmerId` (if set) | `"New Order Received"` | `"A buyer placed an order. Order #${orderNumber}."` | `info` |
| Order status updated | `cluster.controller.ts` → `updateOrder` | After `prisma.order.update` | `order.buyer_id` | `"Order Update"` | `"Your order #${orderNumber} status changed to ${status}."` | `info` |
| Payment confirmed | `buyers.controller.ts` → `verifyPayment` | After `prisma.order.update` | `order.farmer_id` and `order.cluster_farmer_id` | `"Payment Received"` | `"Payment for order #${orderNumber} has been confirmed."` | `success` |
| Demand assigned | `admin.controller.ts` → `assignDemand` | After `prisma.demand.update` | `cluster_farmer_id` | `"New Demand Assigned"` | `"A demand for ${weightKg}kg of ${fishType} has been assigned to you."` | `info` |
| Cluster application approved | `admin.controller.ts` → `approveClusterApplication` | After `prisma.user.update` | `applicantId` | `"Application Approved"` | `"Your cluster farmer application has been approved. You can now manage farmers and listings."` | `success` |
| Cluster application rejected | `admin.controller.ts` → `rejectClusterApplication` | After `prisma.user.update` | `applicantId` | `"Application Rejected"` | `"Your cluster farmer application was not approved at this time."` | `error` |

**Expected `GET /notifications` response:**
```json
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "title": "Listing Approved",
        "message": "Your listing \"table_size 500kg\" has been approved and is now live on the marketplace.",
        "type": "success",
        "read": false,
        "created_at": "2026-06-04T10:00:00.000Z"
      }
    ],
    "unreadCount": 1
  }
}
```

---

### B6 — Fix payout response shape for `GET /farmers/payouts` and `GET /cluster/payouts` ❌

The frontend expects `orderNumber`, `paidAt`, `totalEarnings`, and `pendingPayouts` — none of which the current controller returns.

#### Step 1 — Add `paid_at` to `Payout` model in `prisma/schema.prisma`

```prisma
model Payout {
  id            String       @id @default(uuid()) @db.Uuid
  order_id      String       @db.Uuid
  user_id       String       @db.Uuid
  amount        Decimal      @db.Decimal(10, 2)
  scheduled_for DateTime
  paid_at       DateTime?    // ← add this
  status        PayoutStatus @default(pending)
  created_at    DateTime     @default(now())
  updated_at    DateTime     @updatedAt

  order Order @relation(fields: [order_id], references: [id])
  user  User  @relation(fields: [user_id], references: [id])

  @@index([user_id])
  @@map("payouts")
}
```

Run:
```bash
npx prisma migrate dev --name add_payout_paid_at
npx prisma generate
```

#### Step 2 — Update `getPayouts` in `src/controllers/farmers.controller.ts`

```typescript
export const getPayouts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) throw new ApiError(401, "Unauthorized.");

    const payouts = await prisma.payout.findMany({
      where: { user_id: userId },
      include: { order: { select: { order_number: true } } },
      orderBy: { created_at: "desc" },
    });

    const formatted = payouts.map((p) => ({
      id: p.id,
      orderId: p.order_id,
      orderNumber: p.order.order_number,
      amount: Number(p.amount),
      status: p.status,
      createdAt: p.created_at,
      paidAt: p.paid_at ?? null,
    }));

    const totalEarnings = payouts
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const pendingPayouts = payouts
      .filter((p) => p.status === "pending" || p.status === "processing")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    res.status(200).json({
      status: "success",
      data: { payouts: formatted, totalEarnings, pendingPayouts },
    });
  } catch (error) { next(error); }
};
```

Apply the **same shape** to `getPayouts` in `src/controllers/cluster.controller.ts`, replacing `totalEarnings` with `totalClusterEarnings` to match the frontend type:

```typescript
res.status(200).json({
  status: "success",
  data: { payouts: formatted, totalClusterEarnings: totalEarnings, pendingPayouts },
});
```

**Expected response (both farmer and cluster):**
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

### B7 — Marketplace `?category=live|processed` server-side filter ❌

**Route:** `GET /marketplace`

The frontend currently fetches all listings and filters client-side. This is fine for now but becomes slow at scale. Add server-side support so the frontend can pass `?category=live` or `?category=processed` as a query param.

**File:** `src/controllers/marketplace.controller.ts` — `getListings` function

```typescript
const {
  fishType, state, lga, minPrice, maxPrice,
  page = "1", limit = "20",
  category,           // ← new param
} = req.query;

const LIVE_TYPES   = ["fingerlings", "juveniles", "table_size", "jumbo", "parent_stocks"];
const PROCESSED_TYPES = ["dried", "grilled", "peppersoup", "peppered", "smoked"];

const where: any = {
  status: "active",
  cluster_approved: true,
  is_draft: false,
  expires_at: { gte: new Date() },
};

// fishType exact match takes precedence over category
if (fishType) {
  where.fish_type = fishType;
} else if (category === "live") {
  where.fish_type = { in: LIVE_TYPES };
} else if (category === "processed") {
  where.fish_type = { in: PROCESSED_TYPES };
}

// state, lga, price filters — unchanged
```

**No schema migration needed.**

---

### B8 — Accept `"live"` / `"processed"` as valid `fishVariant` on demand creation ❌

**Route:** `POST /buyers/demands`

**What the frontend sends:**

```json
{
  "fishType": "dried",
  "weightKg": 100,
  "fishVariant": "processed",
  "locationState": "Lagos",
  "locationLga": "Ikeja",
  "deliveryAddress": "12 Allen Avenue, Ikeja"
}
```

The `fishVariant` is the **category** (`"live"` or `"processed"`), not a sub-type. This is rejected today because `FishVariant` enum does not include those values.

This is resolved automatically once Step 2 of **B2** (expanding the `FishVariant` Prisma enum) is complete. No additional code change is needed in the controller — Prisma will accept `"live"` and `"processed"` as valid values after the migration.

If there is any inline validation in the `createDemand` controller that duplicates the Prisma enum, remove it or update it to include `"live"` and `"processed"`.

---

## All Frontend-Consumed Endpoints (Complete Reference)

### AUTH

| Method | Path | Auth | Request Body | Notes |
|--------|------|------|-------------|-------|
| POST | `/auth/role` | None | `{ role: "farmer" \| "buyer" \| "cluster" \| "admin" }` | |
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

---

### FARMER

| Method | Path | Auth | Request Body | Notes |
|--------|------|------|-------------|-------|
| POST | `/farmers/listings/create` | ✓ farmer | `{ fishType, harvestDate, totalFishAvailable, weightKg, listedDate? }` | `fishType` must accept all 10 types after B2 |
| GET | `/farmers/listings/get` | ✓ farmer | — | Returns `{ summary, listings }` |
| GET | `/farmers/recent-activities` | ✓ farmer | — | Returns `{ activities: [{ id, description, type, created_at }] }` |
| PATCH | `/farmers/account-profile` | ✓ farmer | `{ fullName?, phoneNumber?, email?, profileImage?, farmName?, farmAddress?, localGovernment?, state?, fishType?, farmingCapacityKg?, yearsOfExperience? }` | |
| PATCH | `/farmers/cluster-farmer-application` | ✓ farmer | `{ businessName, cacNumber, warehouseLocation, distributionCapacity, logisticsAvailable?, bvnVerification?, proofOfAddress?, cacRegistration?, businessLicense?, taxClearance? }` | |
| GET | `/farmers/orders` | ✓ farmer | — | |
| GET | `/farmers/payouts` | ✓ farmer | — | See B6 for required shape |

**`GET /farmers/listings/get` expected response:**
```json
{
  "status": "success",
  "data": {
    "summary": {
      "totalListings": 5,
      "pendingApproval": 1,
      "approved": 3,
      "rejected": 1,
      "totalSupply": 2500
    },
    "listings": [
      {
        "id": "uuid",
        "fishType": "table_size",
        "harvestDate": "2026-05-01T00:00:00.000Z",
        "listedDate": "2026-05-10T00:00:00.000Z",
        "totalFishAvailable": 500,
        "totalAvailableKg": 2500,
        "weightKg": 5,
        "quantity": 500,
        "status": "approved",
        "isApproved": true,
        "createdAt": "2026-05-10T00:00:00.000Z"
      }
    ]
  }
}
```

---

### CLUSTER

| Method | Path | Auth | Request Body | Notes |
|--------|------|------|-------------|-------|
| PATCH | `/cluster/account-profile` | ✓ cluster | `{ fullName?, phoneNumber?, email?, profileImage? }` | |
| GET | `/cluster/listings/get` | ✓ cluster | — | |
| GET | `/cluster/current-activities` | ✓ cluster | — | |
| GET | `/cluster/pending-approvals` | ✓ cluster | — | |
| PATCH | `/cluster/pending-approvals/:listingId` | ✓ cluster | `{ status: "approved" \| "rejected", rejectionReason? }` | |
| GET | `/cluster/farmers` | ✓ cluster | — | Must include `id` per farmer — see B4a |
| GET | `/cluster/farmers/:farmerId` | ✓ cluster | — | **Missing — see B4b** |
| GET | `/cluster/orders` | ✓ cluster | — | |
| PATCH | `/cluster/orders/:orderId` | ✓ cluster | `{ status: "confirmed" \| "processing" \| "shipped" \| "delivered" \| "cancelled", notes? }` | |
| GET | `/cluster/demands` | ✓ cluster | — | |
| PATCH | `/cluster/demands/:demandId/accept` | ✓ cluster | — | |
| PATCH | `/cluster/demands/:demandId/decline` | ✓ cluster | `{ reason? }` | |
| PATCH | `/cluster/demands/:demandId/fulfill` | ✓ cluster | — | |
| GET | `/cluster/payouts` | ✓ cluster | — | See B6; response key is `totalClusterEarnings` not `totalEarnings` |

---

### BUYER

| Method | Path | Auth | Request Body | Notes |
|--------|------|------|-------------|-------|
| PATCH | `/buyers/account-profile` | ✓ buyer | `{ fullName?, companyName?, phoneNumber?, email?, profileImage?, deliveryAddress?, localGovernment?, state?, businessType? }` | |
| POST | `/buyers/orders` | ✓ buyer | `{ deliveryType, deliveryAddress?, deliveryFee?, items: [{listingId, quantity, weightKg, pricePerUnit}], totalAmount }` | |
| GET | `/buyers/orders` | ✓ buyer | — | |
| GET | `/buyers/orders/:orderId` | ✓ buyer | — | |
| GET | `/buyers/orders/:orderId/tracking` | ✓ buyer | — | |
| PATCH | `/buyers/orders/:orderId/confirm-delivery` | ✓ buyer | `{ payoutDelay?: "24 hours" }` | |
| POST | `/buyers/orders/:orderId/pay` | ✓ buyer | `{ paymentMethod: "card", amount }` | Returns `{ authorizationUrl, transactionReference, amount }` |
| GET | `/payments/verify` | None | `?reference=` | Paystack callback — no auth |
| GET | `/buyers/demands` | ✓ buyer | — | |
| POST | `/buyers/demands` | ✓ buyer | `{ fishType, weightKg, fishVariant?, locationState, locationLga, deliveryAddress, notes? }` | `fishType` = specific sub-type; `fishVariant` = `"live"` or `"processed"` — see B8 |
| DELETE | `/buyers/demands/:demandId` | ✓ buyer | — | |
| GET | `/buyers/saved` | ✓ buyer | — | **Missing — see B3** |
| POST | `/buyers/saved` | ✓ buyer | `{ listingId: "uuid" }` | **Missing — see B3** |
| DELETE | `/buyers/saved/:listingId` | ✓ buyer | — | **Missing — see B3** |

---

### MARKETPLACE (public + buyer)

| Method | Path | Auth | Query / Body | Notes |
|--------|------|------|-------------|-------|
| GET | `/marketplace` | None | `?fishType=&category=live\|processed&state=&lga=&minPrice=&maxPrice=&page=&limit=` | `category` filter — see B7 |
| GET | `/marketplace/:listingId` | None | — | |
| GET | `/marketplace/cart` | ✓ | — | |
| POST | `/marketplace/cart` | ✓ | `{ listingId, variant?, processed?, weightKg, quantity, pricePerUnit }` | |
| PATCH | `/marketplace/cart/:cartItemId` | ✓ | `{ quantity?, weightKg? }` | |
| DELETE | `/marketplace/cart/:cartItemId` | ✓ | — | |
| POST | `/marketplace/checkout` | ✓ | `{ deliveryType, deliveryAddress?, deliveryFee, totalAmount, cartItems: [{cartItemId, quantity}] }` | Returns `{ order: { id, order_number, status, grand_total } }` |

**`GET /marketplace` expected listing shape:**
```json
{
  "id": "uuid",
  "clusterFarmerId": "uuid",
  "clusterFarmerName": "Ibrahim Farms",
  "clusterFarmerContact": "08012345678",
  "businessName": "Ibrahim Aquaculture Ltd",
  "warehouseLocation": "Zaria Road, Kaduna",
  "logisticsAvailable": true,
  "fishType": "table_size",
  "harvestDate": "2026-05-01T00:00:00.000Z",
  "totalAvailableKg": 2500,
  "packaging": [{ "weightKg": 5, "quantity": 500, "pricePerUnit": 17500 }],
  "location": "12 Farm Road, Chikun",
  "state": "Kaduna",
  "localGovernment": "Chikun",
  "pricePerKg": 3500,
  "deliveryOptions": ["delivery", "pickup"],
  "visibleOnMarketplace": true,
  "status": "approved",
  "createdAt": "2026-05-10T00:00:00.000Z",
  "updatedAt": "2026-05-10T00:00:00.000Z"
}
```

---

### ADMIN

| Method | Path | Auth | Request Body / Query | Notes |
|--------|------|------|---------------------|-------|
| GET | `/admin/settings` | **None** | — | Must be public — see B1. Returns all 11 fish type prices — see B2 |
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
| PATCH | `/admin/demands/:id/assign` | ✓ admin | `{ cluster_farmer_id: "uuid" }` | |

---

### NOTIFICATIONS (missing — see B5)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/notifications` | ✓ | Returns `{ notifications: [...], unreadCount: number }` |
| PATCH | `/notifications/read-all` | ✓ | Must be registered **before** `/:notificationId/read` in the router |
| PATCH | `/notifications/:notificationId/read` | ✓ | |

---

## Prisma Migration Plan (All schema changes batched)

Rather than running four separate migrations, batch all schema changes into one or two:

**Migration 1 — fish types + variant expansion:**
- Expand `FishType` enum (+5 processed types)
- Expand `FishVariant` enum (+`live`, +`processed`)
- Add `paid_at DateTime?` to `Payout`

```bash
npx prisma migrate dev --name "expand_fish_types_and_payout"
```

**Migration 2 — new models:**
- Add `SavedListing` model
- Add `NotificationType` enum
- Add `Notification` model

```bash
npx prisma migrate dev --name "add_saved_listings_and_notifications"
```

Always run `npx prisma generate` after each migration.

---

## Known Intentional Limitations (Not Bugs)

| Feature | Location | Notes |
|---------|----------|-------|
| "Report an Issue" button | `/buyers-dashboard/orders/[id]` | Shows toast. No support-ticket endpoint. |
| "View Sessions" button | `/admin-dashboard/settings` | Shows toast. No `GET /auth/sessions` endpoint. |
| "Invoice" button | `/buyers-dashboard/orders/[id]` | No handler. No invoice-generation endpoint. |
| Platform config values | `/admin-dashboard/settings` | Shows hardcoded OTP expiry, session duration. No config API. |
| Financial services pages | All `/financial/*` routes | Excluded from current scope. |
| Marketplace category filter | `/marketplace` | Currently client-side only. B7 adds server-side support. |

---

## Summary — Priority Order

| # | Task | Type | Effort |
|---|------|------|--------|
| B1 | Move `GET /admin/settings` before auth middleware | Route fix | 1 line |
| B2 | Expand `FishType`/`FishVariant` enums, Zod schemas, admin price defaults | Schema + validation | Medium |
| B7 | Add `?category=` filter to `GET /marketplace` | Controller logic | Small |
| B8 | Ensure `"live"`/`"processed"` accepted in demand `fishVariant` | Covered by B2 schema | — |
| B3 | Saved listings: Prisma model + 3 controller functions + route wiring | New feature | Medium |
| B4 | Add `id` to cluster farmers list + `GET /cluster/farmers/:farmerId` | Controller | Medium |
| B5 | Notifications: Prisma model + controller + routes + trigger points | New feature | Large |
| B6 | Fix payout response shape (`orderNumber`, `paidAt`, totals) | Controller + schema | Small |
