# Backend Tasks — Agro-chain API

## How to Read This Document

Every task follows the same structure:

1. **What is broken right now** — the exact symptom a user sees in the browser.
2. **Why it is broken** — the root cause in the backend code.
3. **Exactly which file(s) to open** — full path from the repo root.
4. **What the file currently looks like** — the relevant snippet as it exists today.
5. **What to change it to** — the full replacement, ready to copy-paste.
6. **The exact JSON the frontend expects** — field names, types, nesting, everything.

Do not skip steps. Do not reorder tasks. B2 (enum expansion) must land before any other task that
touches `fishType`, because every subsequent Prisma query that writes a processed fish type will throw
a `P2003` / invalid enum value error until the migration runs.

---

## Project Layout

```
Agro-chain/
├── Agro-chain/           ← Express + Prisma backend (YOU ARE HERE)
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── controllers/
│       │   ├── admin.controller.ts
│       │   ├── buyers.controller.ts
│       │   ├── cluster.controller.ts
│       │   ├── farmers.controller.ts
│       │   └── marketplace.controller.ts
│       ├── models/
│       │   └── listing.model.ts      ← Zod request validation
│       └── routes/
│           ├── admin.routes.ts
│           ├── buyers.routes.ts
│           ├── cluster.routes.ts
│           └── index.ts
└── frontend/             ← Next.js 15 frontend (do not modify)
    └── src/
        ├── lib/services/ ← API call definitions — the contract you must satisfy
        └── types/
            └── constants.ts ← canonical fish type lists
```

**API base URL (dev):** `http://localhost:5000/api`
**Frontend URL (dev):** `http://localhost:3000`

All routes in `src/routes/index.ts` are mounted under `/api`, so
`router.use("/admin", adminRoutes)` becomes `http://localhost:5000/api/admin`.

---

## Fish Type Model — Read This Before Touching Anything

The platform sells **catfish only**. Every product is catfish. The distinction is how it was
processed before sale. The frontend organises fish types into two hard categories:

### Category: Live

These are live catfish at different growth stages. A buyer orders them alive.

| `fishType` value | Display label | Default price per kg |
| ---------------- | ------------- | -------------------- |
| `fingerlings`    | Fingerlings   | ₦1,200               |
| `juveniles`      | Juveniles     | ₦800                 |
| `table_size`     | Table Size    | ₦3,500               |
| `jumbo`          | Jumbo         | ₦5,000               |
| `parent_stocks`  | Parent Stocks | ₦8,000               |

### Category: Processed

These are catfish that have already been processed (smoked, grilled, etc.) before sale.

| `fishType` value | Display label | Default price per kg |
| ---------------- | ------------- | -------------------- |
| `dried`          | Dried         | ₦6,000               |
| `grilled`        | Grilled       | ₦5,500               |
| `peppersoup`     | Peppersoup    | ₦7,000               |
| `peppered`       | Peppered      | ₦6,500               |
| `smoked`         | Smoked        | ₦6,000               |

### The `catfish` legacy value

`catfish` exists in the Prisma enum only to avoid breaking old database rows. The frontend
**never sends `"catfish"` as a `fishType`** in any new form submission. Do not rely on it in
new code. When the backend needs a fallback/default fish type, use `"table_size"`.

### How `fishVariant` is used

`fishVariant` is **not** a sub-type of `fishType`. It is the **category label** sent when a
buyer creates a demand. It tells the cluster farmer (and admin) at a glance what kind of
fulfilment is needed.

- Buyer selects category → `"live"` or `"processed"` → stored in `fish_variant`
- Buyer then selects the specific type → e.g. `"fingerlings"` → stored in `fish_type`

The `FishVariant` Prisma enum currently only contains legacy values (`dried`, `jumbo`,
`table_size`, `broodstock`). It must be expanded to include `"live"` and `"processed"`.

### Current backend enum vs what the frontend sends

| Layer                     | Currently accepts                                                             | Must accept after B2                                     |
| ------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------- |
| Prisma `FishType` enum    | `catfish`, `fingerlings`, `juveniles`, `table_size`, `jumbo`, `parent_stocks` | + `dried`, `grilled`, `peppersoup`, `peppered`, `smoked` |
| Prisma `FishVariant` enum | `dried`, `jumbo`, `table_size`, `broodstock`                                  | + `live`, `processed`                                    |
| Zod `createListingSchema` | `fingerlings`, `juveniles`, `table_size`, `jumbo`, `parent_stocks`            | + `catfish` + all 5 processed types                      |
| Zod demand schema         | No dedicated schema found — inline validation only                            | Must validate all 10 `fishType` values                   |
| `DEFAULT_PRICES` object   | 6 keys                                                                        | 11 keys                                                  |

---

## Outstanding Tasks

> **Mandatory execution order:** B1 → B2 → B7 → B8 → B3 → B4 → B5 → B6
>
> B1 is a one-line route reorder with no migration. Do it first so the frontend stops
> falling back to hardcoded prices immediately. B2 must come before B3, B7, and B8
> because all three write `fishType` values to the database.

---

## B1 — `GET /admin/settings` must be public (no auth) ❌

### What the user sees right now

Every page on the site — including the public marketplace — shows incorrect prices. The
admin-set prices are never loaded. If you open the browser network tab you will see
`GET /api/admin/settings` returning `401 Unauthorized`.

### Why it happens

Open `src/routes/admin.routes.ts`. The very first middleware registered is
`router.use(authMiddleware)`. This runs on **every request** to any `/admin/*` route,
including `GET /admin/settings`. Unauthenticated visitors (all marketplace browsers) are
rejected before `getSettings` is ever called.

### The fix

`GET /admin/settings` must be registered **before** `router.use(authMiddleware)`.
`PATCH /admin/settings/price` stays protected — only admins can update prices.

### Current state of `src/routes/admin.routes.ts` (relevant lines)

```typescript
const router = Router();

// ← authMiddleware is registered HERE, before /settings
router.use(authMiddleware);
router.use(adminController.requireAdmin);

router.get("/settings", adminController.getSettings); // ← blocked by the line above
router.patch("/settings/price", adminController.updatePrices);
```

### What it must look like after the fix

```typescript
const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
// PlatformSettingsContext fetches this on every page load, including guests.
// It must not require a token.
router.get("/settings", adminController.getSettings);

// ── Admin-only ────────────────────────────────────────────────────────────────
router.use(authMiddleware);
router.use(adminController.requireAdmin);

router.patch("/settings/price", adminController.updatePrices);

// ── Cluster Applications ──────────────────────────────────────────────────────
router.get("/cluster-applications", adminController.getClusterApplications);
router.put(
  "/cluster-applications/:id/approve",
  adminController.approveClusterApplication,
);
router.put(
  "/cluster-applications/:id/reject",
  adminController.rejectClusterApplication,
);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get("/dashboard/metrics", adminController.getDashboardMetrics);
router.get("/dashboard/charts", adminController.getDashboardCharts);
router.get("/dashboard/activities", adminController.getRecentActivities);

// ── Listing Management ────────────────────────────────────────────────────────
router.get("/listings/pending", adminController.getPendingListings);
router.get("/listings", adminController.getAllListings);
router.put("/listings/:id/approve", adminController.approveListingAdmin);
router.put("/listings/:id/reject", adminController.rejectListingAdmin);
router.patch("/listings/:id/flag", adminController.flagListingAdmin);
router.delete("/listings/:id", adminController.removeListingAdmin);

// ── User / Farmer Management ──────────────────────────────────────────────────
router.get("/farmers", adminController.getUsers);
router.get("/farmers/:id", adminController.getUserById);
router.patch("/farmers/:id/toggle-active", adminController.toggleUserActive);

// ── Orders ────────────────────────────────────────────────────────────────────
router.get("/orders", adminController.getAdminOrders);
router.get("/orders/:id", adminController.getAdminOrderById);

// ── Demands ───────────────────────────────────────────────────────────────────
router.get("/demands", adminController.getAdminDemands);
router.get("/demands/:id", adminController.getAdminDemandById);
router.patch("/demands/:id/assign", adminController.assignDemand);

export default router;
```

**No Prisma migration needed. No `npx prisma generate` needed. This is a route reorder only.**

---

## B2 — Expand `FishType` and `FishVariant` enums + all validation layers ❌

### What breaks without this

- `POST /farmers/listings/create` with `fishType: "dried"` → Prisma throws
  `Invalid value for argument fish_type. Expected FishType.`
- `PATCH /admin/settings/price` with a `dried` key → silently ignored, price never saved.
- `GET /admin/settings` always missing the 5 processed type keys → frontend falls back to
  hardcoded prices for all processed fish.
- `POST /buyers/demands` with `fishVariant: "live"` → Prisma throws
  `Invalid value for argument fish_variant. Expected FishVariant.`

### Step 1 of 4 — Update `prisma/schema.prisma`

#### 1a — Expand `FishType` enum

Find this block in `schema.prisma`:

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

Replace it with:

```prisma
enum FishType {
  catfish        // legacy — kept for backward compat with old DB rows only
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

#### 1b — Expand `FishVariant` enum

Find this block in `schema.prisma`:

```prisma
enum FishVariant {
  dried
  jumbo
  table_size
  broodstock
}
```

Replace it with:

```prisma
enum FishVariant {
  dried
  jumbo
  table_size
  broodstock
  live        // category label — sent by the demand creation form
  processed   // category label — sent by the demand creation form
}
```

#### 1c — Run the migration

```bash
cd Agro-chain
npx prisma migrate dev --name "expand_fish_types_and_fish_variant"
npx prisma generate
```

If the migration fails with "cannot add value to enum in a transaction", this is a known
PostgreSQL limitation. Run the SQL manually:

```sql
ALTER TYPE "FishType" ADD VALUE IF NOT EXISTS 'dried';
ALTER TYPE "FishType" ADD VALUE IF NOT EXISTS 'grilled';
ALTER TYPE "FishType" ADD VALUE IF NOT EXISTS 'peppersoup';
ALTER TYPE "FishType" ADD VALUE IF NOT EXISTS 'peppered';
ALTER TYPE "FishType" ADD VALUE IF NOT EXISTS 'smoked';
ALTER TYPE "FishVariant" ADD VALUE IF NOT EXISTS 'live';
ALTER TYPE "FishVariant" ADD VALUE IF NOT EXISTS 'processed';
```

Then mark the migration as applied:

```bash
npx prisma migrate resolve --applied "expand_fish_types_and_fish_variant"
npx prisma generate
```

---

### Step 2 of 4 — Update Zod validation in `src/models/listing.model.ts`

#### Current state (what the file looks like now)

```typescript
export const createListingSchema = z.object({
  body: z.object({
    fish_type: z.enum([
      "fingerlings",
      "juveniles",
      "table_size",
      "jumbo",
      "parent_stocks",
    ]),
    // ...
  }),
});

export const updateListingSchema = z.object({
  body: z.object({
    fish_type: z
      .enum([
        "fingerlings",
        "juveniles",
        "table_size",
        "jumbo",
        "parent_stocks",
      ])
      .optional(),
    // ...
  }),
});
```

#### What it must look like after the fix

Extract the enum list into a constant at the top of the file so it is maintained in one
place. Both schemas reference the same constant.

```typescript
import { z } from "zod";

// All valid fish types accepted by the platform.
// Keep this in sync with the FishType enum in prisma/schema.prisma.
const FISH_TYPE_VALUES = [
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
    fish_type: z.enum(FISH_TYPE_VALUES),
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

export type CreateListingInput = z.infer<typeof createListingSchema>["body"];

export const updateListingSchema = z.object({
  body: z.object({
    fish_type: z.enum(FISH_TYPE_VALUES).optional(),
    quantity_available: z.number().int().positive().optional(),
    price_per_fish: z.number().positive().optional(),
    price_per_kg: z.number().positive().optional(),
    size_min_cm: z.number().positive().optional(),
    size_max_cm: z.number().positive().optional(),
    weight_min_grams: z.number().positive().optional(),
    weight_max_grams: z.number().positive().optional(),
    harvest_date: z.string().datetime().optional(),
    location_state: z.string().min(2).optional(),
    location_lga: z.string().min(2).optional(),
    location_address: z.string().min(2).optional(),
    delivery_available: z.boolean().optional(),
    delivery_fee: z.number().nonnegative().optional(),
  }),
});

export type UpdateListingInput = z.infer<typeof updateListingSchema>["body"];

export const changeListingStatusSchema = z.object({
  body: z.object({
    status: z.enum(["active", "sold", "draft", "archived", "deleted"]),
  }),
});
```

---

### Step 3 of 4 — Update `DEFAULT_PRICES` and `getSettings` in `src/controllers/admin.controller.ts`

#### Why `getSettings` also needs to change

The current `getSettings` returns exactly what is stored in the database. If the database
row was created before processed types existed, it will be missing those 5 keys. The
frontend's `PlatformSettingsContext` indexes into the returned object by `fishType` —
if a key is missing the context returns `undefined`, the price computation returns `NaN`,
and the UI shows `₦NaN` next to listings.

The fix is to always merge `DEFAULT_PRICES` (all 11 keys) **under** whatever is in the DB,
so the response is always guaranteed to have all 11 keys.

#### Current state (relevant lines)

```typescript
const DEFAULT_PRICES = {
  catfish: 1800,
  fingerlings: 500,
  juveniles: 800,
  table_size: 1800,
  jumbo: 2500,
  parent_stocks: 3000,
};

export const getSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let settings = await prisma.platformSettings.findFirst();
    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: { price_per_kg: DEFAULT_PRICES },
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        settings: {
          pricePerKg: settings.price_per_kg, // ← may be missing processed keys
          updatedAt: settings.updated_at,
          updatedBy: settings.updated_by,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
```

#### What it must look like after the fix

```typescript
// Canonical default prices for all 11 fish types.
// These are the fallback values used when:
//   (a) no platform_settings row exists yet
//   (b) the DB row predates a new fish type being added
// The admin can override any of these via PATCH /admin/settings/price.
const DEFAULT_PRICES: Record<string, number> = {
  catfish: 3500,
  fingerlings: 1200,
  juveniles: 800,
  table_size: 3500,
  jumbo: 5000,
  parent_stocks: 8000,
  dried: 6000,
  grilled: 5500,
  peppersoup: 7000,
  peppered: 6500,
  smoked: 6000,
};

export const getSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let settings = await prisma.platformSettings.findFirst();
    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: { price_per_kg: DEFAULT_PRICES },
      });
    }
    // Merge: DEFAULT_PRICES provides all 11 keys as a baseline.
    // Whatever the admin has set in the DB overwrites the defaults.
    // This guarantees the response always contains all 11 keys even
    // if the DB row is from before processed types were introduced.
    const pricePerKg = {
      ...DEFAULT_PRICES,
      ...(settings.price_per_kg as Record<string, number>),
    };
    res.status(200).json({
      status: "success",
      data: {
        settings: {
          pricePerKg,
          updatedAt: settings.updated_at,
          updatedBy: settings.updated_by,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
```

Also update `updatePrices` to accept the 5 new keys. The current implementation already
merges the body into the DB value, so no structural change is needed there — the only fix
is that `DEFAULT_PRICES` is now larger, so the base merge includes all 11 keys:

```typescript
export const updatePrices = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const adminId = req.user?.user_id;
    const { pricePerKg } = req.body;
    if (!pricePerKg || typeof pricePerKg !== "object") {
      throw new ApiError(400, "pricePerKg must be an object.");
    }

    // Validate that no unknown keys sneak in
    const allowedKeys = Object.keys(DEFAULT_PRICES);
    const unknownKeys = Object.keys(pricePerKg).filter(
      (k) => !allowedKeys.includes(k),
    );
    if (unknownKeys.length > 0) {
      throw new ApiError(
        400,
        `Unknown fish type(s): ${unknownKeys.join(", ")}`,
      );
    }

    let settings = await prisma.platformSettings.findFirst();
    // Start from defaults, overlay whatever is in DB, then overlay the patch body
    const existing = (settings?.price_per_kg as Record<string, number>) ?? {};
    const merged = { ...DEFAULT_PRICES, ...existing, ...pricePerKg };

    if (settings) {
      settings = await prisma.platformSettings.update({
        where: { id: settings.id },
        data: { price_per_kg: merged, updated_by: adminId },
      });
    } else {
      settings = await prisma.platformSettings.create({
        data: { price_per_kg: merged, updated_by: adminId },
      });
    }

    // Sync active listings that match the updated fish types
    for (const [fishType, newPricePerKg] of Object.entries(
      pricePerKg as Record<string, number>,
    )) {
      await prisma.$executeRaw`
                UPDATE listings
                SET
                    price_per_kg   = ${newPricePerKg},
                    price_per_fish = GREATEST(COALESCE(packaging_weight_kg, 1), 0.1) * ${newPricePerKg}
                WHERE fish_type = ${fishType}::\"FishType\"
                  AND status NOT IN ('deleted', 'sold', 'archived')
            `;
    }

    const pricePerKgOut = {
      ...DEFAULT_PRICES,
      ...(settings.price_per_kg as Record<string, number>),
    };
    res.status(200).json({
      status: "success",
      data: {
        settings: {
          pricePerKg: pricePerKgOut,
          updatedAt: settings.updated_at,
          updatedBy: settings.updated_by,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
```

---

### Step 4 of 4 — Update the `createListing` controller to handle processed fish types

**File:** `src/controllers/farmers.controller.ts` — `createListing` function

The current code falls back to `priceMap["catfish"]` when the fish type is not in the price
map. After B2 the processed types will be in the map, but the fallback should be updated
to use `"table_size"` (not `"catfish"`) to give a sensible price for unlisted types.

Find this line:

```typescript
const adminPricePerKg =
  priceMap[normalizedFishType] ?? priceMap["catfish"] ?? 0;
```

Replace with:

```typescript
const adminPricePerKg =
  priceMap[normalizedFishType] ?? priceMap["table_size"] ?? 0;
```

Also, the `fish_type` is currently defaulted to `"catfish"` when the field is missing:

```typescript
fish_type: fishType?.toLowerCase() ?? "catfish",
```

Replace with:

```typescript
fish_type: fishType?.toLowerCase() ?? "table_size",
```

**Expected `GET /admin/settings` response after B2:**

```json
{
  "status": "success",
  "data": {
    "settings": {
      "pricePerKg": {
        "catfish": 3500,
        "fingerlings": 1200,
        "juveniles": 800,
        "table_size": 3500,
        "jumbo": 5000,
        "parent_stocks": 8000,
        "dried": 6000,
        "grilled": 5500,
        "peppersoup": 7000,
        "peppered": 6500,
        "smoked": 6000
      },
      "updatedAt": "2026-06-04T00:00:00.000Z",
      "updatedBy": null
    }
  }
}
```

---

## B3 — Saved Listings endpoints (3 routes entirely missing) ❌

### What the user sees right now

- `/buyers-dashboard/saved` — page loads then shows an error state with "Something went
  wrong" because the `GET /buyers/saved` returns a 404.
- On `/marketplace` and `/marketplace/[id]` — the heart/bookmark button does nothing.
  There is no network error visible to the user because the frontend catches the failure
  silently (it uses local state optimistically), but the save is never persisted to the DB.
  On page refresh the listing is no longer shown as saved.

### Why it happens

`GET /buyers/saved`, `POST /buyers/saved`, and `DELETE /buyers/saved/:listingId` do not
exist at all in `src/routes/buyers.routes.ts` or `src/controllers/buyers.controller.ts`.
There is no `SavedListing` table in the database either.

### Step 1 of 3 — Add `SavedListing` model to `prisma/schema.prisma`

The `SavedListing` table is a join table between `User` (the buyer) and `Listing`. A buyer
can save many listings; a listing can be saved by many buyers. The `@@unique` constraint
ensures a buyer cannot save the same listing twice (the `upsert` in the controller handles
this gracefully).

Add this model anywhere after the `Listing` model in `schema.prisma`:

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

`onDelete: Cascade` on both foreign keys means:

- If a user is deleted → all their saved listings are automatically removed.
- If a listing is deleted → it is automatically removed from all buyers' saved lists.

You also need to add back-relations on the two models Prisma already knows about.

Find the `User` model and add inside it (anywhere in the relations block):

```prisma
savedListings SavedListing[] @relation("UserSavedListings")
```

Find the `Listing` model and add inside it:

```prisma
savedBy SavedListing[] @relation("ListingSavedBy")
```

Run:

```bash
npx prisma migrate dev --name "add_saved_listings"
npx prisma generate
```

---

### Step 2 of 3 — Add three controller functions to `src/controllers/buyers.controller.ts`

Add these three exports anywhere after the `cancelDemand` function and before the payment
functions. Keep them together for readability.

```typescript
// ─── Saved Listings ───────────────────────────────────────────────────────────

export const getSavedListings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) throw new ApiError(401, "Unauthorized.");

    const saved = await prisma.savedListing.findMany({
      where: { user_id: userId },
      include: {
        listing: {
          include: {
            // Only pull the primary image to avoid over-fetching
            images: { where: { is_primary: true }, take: 1 },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Return the listing objects directly — not the SavedListing wrappers.
    // The frontend expects data.listings to be an array of listing objects.
    res.status(200).json({
      status: "success",
      data: { listings: saved.map((s) => s.listing) },
    });
  } catch (error) {
    next(error);
  }
};

export const saveListing = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) throw new ApiError(401, "Unauthorized.");

    const { listingId } = req.body as { listingId: string };
    if (!listingId) throw new ApiError(400, "listingId is required.");

    // Verify the listing actually exists and is active before saving it.
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!listing) throw new ApiError(404, "Listing not found.");

    // upsert: if the save already exists, do nothing (update: {}).
    // This makes POST /buyers/saved idempotent.
    await prisma.savedListing.upsert({
      where: { user_id_listing_id: { user_id: userId, listing_id: listingId } },
      update: {},
      create: { user_id: userId, listing_id: listingId },
    });

    res.status(200).json({ status: "success", message: "Listing saved." });
  } catch (error) {
    next(error);
  }
};

export const unsaveListing = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) throw new ApiError(401, "Unauthorized.");

    const { listingId } = req.params;

    // deleteMany instead of delete: does not throw if the record does not exist.
    // This makes DELETE /buyers/saved/:listingId idempotent.
    await prisma.savedListing.deleteMany({
      where: { user_id: userId, listing_id: listingId },
    });

    res
      .status(200)
      .json({ status: "success", message: "Listing removed from saved." });
  } catch (error) {
    next(error);
  }
};
```

---

### Step 3 of 3 — Register routes in `src/routes/buyers.routes.ts`

Add these three lines **after** the demand routes and **before** `export default router`:

```typescript
// ── Saved Listings ────────────────────────────────────────────────────────────
router.get("/saved", buyersController.getSavedListings);
router.post("/saved", buyersController.saveListing);
router.delete("/saved/:listingId", buyersController.unsaveListing);
```

---

### B3 — Expected response shapes

#### `GET /buyers/saved` — 200 OK

```json
{
  "status": "success",
  "data": {
    "listings": [
      {
        "id": "a1b2c3d4-0000-0000-0000-000000000001",
        "farmer_id": "a1b2c3d4-0000-0000-0000-000000000010",
        "fish_type": "table_size",
        "quantity_available": 100,
        "quantity_sold": 5,
        "price_per_fish": 17500,
        "price_per_kg": 3500,
        "packaging_weight_kg": 5,
        "total_available_kg": 500,
        "harvest_date": "2026-05-01T00:00:00.000Z",
        "listed_date": "2026-05-10T00:00:00.000Z",
        "location_state": "Kaduna",
        "location_lga": "Chikun",
        "location_address": "12 Farm Road, Chikun",
        "delivery_available": true,
        "status": "active",
        "cluster_approved": true,
        "created_at": "2026-05-10T00:00:00.000Z",
        "updated_at": "2026-05-10T00:00:00.000Z",
        "images": [
          {
            "id": "img-uuid",
            "image_url": "https://res.cloudinary.com/...",
            "is_primary": true
          }
        ]
      }
    ]
  }
}
```

If no listings have been saved: `"listings": []` — not an error, not a 404.

#### `POST /buyers/saved` — request body

```json
{ "listingId": "a1b2c3d4-0000-0000-0000-000000000001" }
```

Response (200 OK):

```json
{ "status": "success", "message": "Listing saved." }
```

#### `DELETE /buyers/saved/:listingId` — no body

Response (200 OK — even if it was already removed):

```json
{ "status": "success", "message": "Listing removed from saved." }
```

---

## B4 — Cluster farmers list missing `id` + `GET /cluster/farmers/:farmerId` entirely missing ❌

### What the user sees right now

- On `/cluster-dashboard/farmers`, every farmer row is missing a "Full Profile" button. The
  button only renders when `farmer.id` is present. The current response omits `id`.
- Navigating directly to `/cluster-dashboard/farmers/some-uuid` always shows an error state
  because `GET /cluster/farmers/:farmerId` does not exist.

### B4a — Add `id` to `GET /cluster/farmers` response

**File:** `src/controllers/cluster.controller.ts` — `getFarmers` function

Find the return value inside the `farmersWithStats` map. It currently looks like this:

```typescript
return {
  farmerName: f.full_name,
  fishType: f.fish_type_preference ?? "catfish",
  totalListings,
  totalApprovedListings,
  totalPendingListings,
  farmName: f.farm_name,
  location: `${f.location_lga}, ${f.location_state}`,
  phoneNumber: f.phone_number,
  emailAddress: f.email,
  capacity: f.farming_capacity_kg,
  experience: f.years_of_experience,
  memberSince: f.created_at,
  lastActive: lastActivity?.created_at ?? f.created_at,
};
```

Change it to:

```typescript
return {
  id: f.id, // ← ADD THIS
  farmerName: f.full_name,
  fishType: f.fish_type_preference ?? "table_size", // ← change default away from "catfish"
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

---

### B4b — Add `getFarmerById` controller function

**File:** `src/controllers/cluster.controller.ts`

Add this new export after the `getFarmers` function:

```typescript
export const getFarmerById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const clusterFarmerId = req.user?.user_id;
    if (!clusterFarmerId) throw new ApiError(401, "Unauthorized.");

    await requireClusterFarmer(clusterFarmerId);

    const { farmerId } = req.params;

    // Scope the query to farmers that belong to THIS cluster farmer.
    // A cluster farmer must not be able to view farmers from another cluster.
    const farmer = await prisma.user.findFirst({
      where: {
        id: farmerId,
        cluster_farmer_id: clusterFarmerId,
        role: "farmer",
      },
    });

    if (!farmer) throw new ApiError(404, "Farmer not found in your cluster.");

    // Run listing counts in parallel to avoid sequential DB round-trips.
    const [totalListings, approvedListings, pendingListings] =
      await Promise.all([
        prisma.listing.count({
          where: { farmer_id: farmerId, status: { not: "deleted" } },
        }),
        prisma.listing.count({
          where: { farmer_id: farmerId, cluster_approved: true },
        }),
        prisma.listing.count({
          where: { farmer_id: farmerId, status: "pending" },
        }),
      ]);

    const totalKgResult = await prisma.listing.aggregate({
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
          farmingCapacityKg: farmer.farming_capacity_kg
            ? Number(farmer.farming_capacity_kg)
            : null,
          yearsOfExperience: farmer.years_of_experience,
          verificationStatus: farmer.verification_status,
          memberSince: farmer.created_at,
          stats: {
            totalListings,
            approvedListings,
            pendingListings,
            totalSupplyKg: Number(totalKgResult._sum.total_available_kg ?? 0),
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
  } catch (error) {
    next(error);
  }
};
```

---

### B4c — Register the new route in `src/routes/cluster.routes.ts`

The new route must come **after** the existing `/farmers` route. Express matches routes in
registration order — if `/:farmerId` were registered first, the string `"farmers"` in a
path like `/cluster/farmers` would match `:farmerId` and return a 404 "Farmer not found"
instead of the list.

```typescript
router.get("/farmers", clusterController.getFarmers);
router.get("/farmers/:farmerId", clusterController.getFarmerById); // ← add after the line above
```

---

### B4 — Expected response shapes

#### `GET /cluster/farmers` — 200 OK (note the new `id` field on each farmer)

```json
{
  "status": "success",
  "data": {
    "summary": {
      "totalFarmers": 3,
      "totalFarmersCapacity": 15000,
      "locationCovering": 2
    },
    "farmers": [
      {
        "id": "a1b2c3d4-0000-0000-0000-000000000020",
        "farmerName": "Musa Aliyu",
        "fishType": "table_size",
        "totalListings": 8,
        "totalApprovedListings": 6,
        "totalPendingListings": 1,
        "farmName": "Musa Farms",
        "location": "Chikun, Kaduna",
        "phoneNumber": "08012345678",
        "emailAddress": "musa@example.com",
        "capacity": 5000,
        "experience": 4,
        "memberSince": "2026-01-15T00:00:00.000Z",
        "lastActive": "2026-06-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### `GET /cluster/farmers/:farmerId` — 200 OK

```json
{
  "status": "success",
  "data": {
    "farmer": {
      "id": "a1b2c3d4-0000-0000-0000-000000000020",
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
          "id": "listing-uuid",
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

#### `GET /cluster/farmers/:farmerId` — 404 Not Found (farmer not in this cluster)

```json
{
  "status": "error",
  "message": "Farmer not found in your cluster."
}
```

---

## B5 — Notifications system (new Prisma model + controller + routes + 8 trigger points) ❌

### What the user sees right now

The notification bell in every dashboard header shows `0` permanently and never updates.
Clicking "Mark all read" does nothing. The frontend polls `GET /notifications` every 60
seconds — every poll returns a 404, which the frontend silently ignores by displaying 0.

### Step 1 of 5 — Add `Notification` model and `NotificationType` enum to `prisma/schema.prisma`

Add the enum above the `Notification` model declaration:

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

Add the back-relation on the `User` model:

```prisma
notifications Notification[] @relation("UserNotifications")
```

Run:

```bash
npx prisma migrate dev --name "add_notifications"
npx prisma generate
```

---

### Step 2 of 5 — Create `src/controllers/notifications.controller.ts`

This file is new — create it from scratch.

```typescript
import { Request, Response, NextFunction } from "express";
import { prisma } from "../models/user.model.js";

// ─── Public API ───────────────────────────────────────────────────────────────

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) throw new Error("Unauthorized");

    const notifications = await prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      take: 50, // cap at 50 — the bell doesn't paginate
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    res.status(200).json({
      status: "success",
      data: { notifications, unreadCount },
    });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) throw new Error("Unauthorized");

    // Use updateMany + user_id scope so a user cannot mark another user's notification.
    await prisma.notification.updateMany({
      where: {
        id: req.params.notificationId,
        user_id: userId,
      },
      data: { read: true },
    });

    res.status(200).json({ status: "success", message: "Marked as read." });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) throw new Error("Unauthorized");

    await prisma.notification.updateMany({
      where: { user_id: userId, read: false },
      data: { read: true },
    });

    res.status(200).json({
      status: "success",
      message: "All notifications marked as read.",
    });
  } catch (error) {
    next(error);
  }
};

// ─── Internal utility (not a route handler) ───────────────────────────────────
// Call this from any controller whenever an event worth notifying the user about occurs.
// It is fire-and-forget — await it with void so it does not block the response.
//
// Usage example:
//   void createNotification(order.buyer_id, "Order Update", "Your order was shipped.", "info");

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" = "info",
): Promise<void> => {
  await prisma.notification.create({
    data: { user_id: userId, title, message, type },
  });
};
```

---

### Step 3 of 5 — Create `src/routes/notifications.routes.ts`

This file is new — create it from scratch.

```typescript
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import * as notificationsController from "../controllers/notifications.controller.js";

const router = Router();

// All notification routes require authentication.
router.use(authMiddleware);

router.get("/", notificationsController.getNotifications);

// IMPORTANT: /read-all must be registered BEFORE /:notificationId/read.
// Express matches routes in order. If /:notificationId/read is first,
// the string "read-all" will match :notificationId and the PATCH will
// try to mark a notification with id "read-all" as read (and silently do nothing).
router.patch("/read-all", notificationsController.markAllRead);
router.patch("/:notificationId/read", notificationsController.markRead);

export default router;
```

---

### Step 4 of 5 — Register in `src/routes/index.ts`

Add one import and one `router.use` call. The full file should look like this after the
change (new lines marked with `// ← NEW`):

```typescript
import { Router } from "express";
import { getHealth } from "../controllers/health.controller.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import adminRoutes from "./admin.routes.js";
import listingRoutes from "./listing.routes.js";
import farmersRoutes from "./farmers.routes.js";
import clusterRoutes from "./cluster.routes.js";
import buyersRoutes from "./buyers.routes.js";
import marketplaceRoutes from "./marketplace.routes.js";
import notificationRoutes from "./notifications.routes.js"; // ← NEW

const router = Router();

router.get("/health", getHealth);

router.use("/auth", authRoutes);
router.use("/farmers", farmersRoutes);
router.use("/cluster", clusterRoutes);
router.use("/buyers", buyersRoutes);
router.use("/marketplace", marketplaceRoutes);
router.use("/notifications", notificationRoutes); // ← NEW
router.use("/users", userRoutes);
router.use("/admin", adminRoutes);
router.use("/listings", listingRoutes);

export default router;
```

---

### Step 5 of 5 — Wire `createNotification` into existing controllers

For each controller file below: add the import at the top of the file, then add the
`void createNotification(...)` call in the exact location specified.

#### Import line to add at the top of each affected file

```typescript
import { createNotification } from "./notifications.controller.js";
```

---

#### Trigger 1 — Listing approved by cluster farmer

**File:** `src/controllers/cluster.controller.ts` — `approveRejectListing`

Find the block that runs when `status === "approved"`. It currently ends with a
`logActivity` call. Add the notification call immediately after:

```typescript
// After: await logActivity(listing.user.cluster_farmer_id ?? userId, `listing_${status}`, ...)
if (status === "approved") {
  void createNotification(
    listing.farmer_id,
    "Listing Approved",
    `Your listing "${updated.fish_type} ${Number(updated.total_available_kg ?? 0)}kg" has been approved and is now live on the marketplace.`,
    "success",
  );
} else {
  void createNotification(
    listing.farmer_id,
    "Listing Rejected",
    `Your listing "${updated.fish_type} ${Number(updated.total_available_kg ?? 0)}kg" was not approved. Reason: ${rejectionReason || "No reason provided."}`,
    "error",
  );
}
```

---

#### Trigger 2 — Order placed (checkout)

**File:** `src/controllers/marketplace.controller.ts` — `checkout`

Find the section after `prisma.orderTracking.create`. Add:

```typescript
// Notify cluster farmer that a new order has arrived
if (clusterFarmerId) {
  void createNotification(
    clusterFarmerId,
    "New Order Received",
    `A buyer placed a new order (#${order.order_number}). Please confirm and begin processing.`,
    "info",
  );
}
```

---

#### Trigger 3 — Order status updated by cluster farmer

**File:** `src/controllers/cluster.controller.ts` — `updateOrder`

Find the section after `prisma.orderTracking.create`. Add:

```typescript
// Notify buyer that their order status changed
void createNotification(
  order.buyer_id,
  "Order Update",
  `Your order #${order.order_number} has been updated to "${status}".`,
  "info",
);
```

Note: you will need to include `order_number` in the `prisma.order.findUnique` select, or
use the `updated` result — `updated.order_number`.

---

#### Trigger 4 — Payment confirmed

**File:** `src/controllers/buyers.controller.ts` — `verifyPayment`

Find the section after `prisma.orderTracking.create`. Add:

```typescript
// Notify both the farmer and the cluster farmer that payment was received
void createNotification(
  order.farmer_id,
  "Payment Received",
  `Payment for order #${order.order_number} has been confirmed. Funds are in escrow.`,
  "success",
);
if (order.cluster_farmer_id) {
  void createNotification(
    order.cluster_farmer_id,
    "Payment Received",
    `Payment for order #${order.order_number} has been confirmed. Prepare for fulfilment.`,
    "success",
  );
}
```

---

#### Trigger 5 — Demand assigned to cluster farmer

**File:** `src/controllers/admin.controller.ts` — `assignDemand`

Find the section after `prisma.demand.update`. Add:

```typescript
void createNotification(
  cluster_farmer_id,
  "New Demand Assigned",
  `A demand for ${Number(demand.weight_kg)}kg of ${demand.fish_type} has been assigned to you. Review it in your Demands dashboard.`,
  "info",
);
```

Note: you will need the `demand` object before the update to read `weight_kg` and
`fish_type`. The `demand` variable is already fetched by `prisma.demand.findUnique` just
above.

---

#### Trigger 6 — Cluster application approved

**File:** `src/controllers/admin.controller.ts` — `approveClusterApplication`

Find the section after `prisma.activityLog.create`. Add:

```typescript
void createNotification(
  applicantId,
  "Application Approved",
  "Your cluster farmer application has been approved. You can now manage farmers and listings from your Cluster Dashboard.",
  "success",
);
```

---

#### Trigger 7 — Cluster application rejected

**File:** `src/controllers/admin.controller.ts` — `rejectClusterApplication`

Find the section after `prisma.user.update`. Add:

```typescript
void createNotification(
  applicantId,
  "Application Rejected",
  "Your cluster farmer application was not approved at this time. Please contact support if you have questions.",
  "error",
);
```

---

### B5 — Expected response shapes

#### `GET /notifications` — 200 OK

```json
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "id": "notif-uuid-1",
        "user_id": "user-uuid",
        "title": "Listing Approved",
        "message": "Your listing \"table_size 500kg\" has been approved and is now live on the marketplace.",
        "type": "success",
        "read": false,
        "created_at": "2026-06-04T10:30:00.000Z"
      },
      {
        "id": "notif-uuid-2",
        "user_id": "user-uuid",
        "title": "Order Update",
        "message": "Your order #AG-2026-112233 has been updated to \"shipped\".",
        "type": "info",
        "read": true,
        "created_at": "2026-06-03T08:00:00.000Z"
      }
    ],
    "unreadCount": 1
  }
}
```

If the user has no notifications: `"notifications": []`, `"unreadCount": 0` — not an error.

#### `PATCH /notifications/read-all` — 200 OK

```json
{ "status": "success", "message": "All notifications marked as read." }
```

#### `PATCH /notifications/:notificationId/read` — 200 OK

```json
{ "status": "success", "message": "Marked as read." }
```

---

## B6 — Fix payout response shape ❌

### What the user sees right now

- On `/farmers-dashboard` and `/cluster-dashboard`, the payouts section shows `₦0 total
earnings` and `₦0 pending` even when real payouts exist.
- The payout list itself renders rows but shows no order number next to each payout.

### Why it happens

The current `getPayouts` in both `farmers.controller.ts` and `cluster.controller.ts`:

1. Does not join the `Order` table, so `orderNumber` is unavailable.
2. Does not include `paidAt` (the column does not exist yet on the `Payout` model).
3. Returns `{ payouts }` only — the top-level `totalEarnings` and `pendingPayouts` fields
   that the frontend expects are missing entirely.

### Step 1 of 2 — Add `paid_at` column to `Payout` in `prisma/schema.prisma`

Find the `Payout` model and add the `paid_at` field:

```prisma
model Payout {
  id            String       @id @default(uuid()) @db.Uuid
  order_id      String       @db.Uuid
  user_id       String       @db.Uuid
  amount        Decimal      @db.Decimal(10, 2)
  scheduled_for DateTime
  paid_at       DateTime?    // ← ADD THIS — null until the payout is processed
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
npx prisma migrate dev --name "add_payout_paid_at"
npx prisma generate
```

---

### Step 2 of 2 — Update `getPayouts` in both controller files

#### `src/controllers/farmers.controller.ts`

Replace the existing `getPayouts` function entirely:

```typescript
export const getPayouts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) throw new ApiError(401, "Unauthorized.");

    const payouts = await prisma.payout.findMany({
      where: { user_id: userId },
      include: {
        // Join order to get the order number for display
        order: { select: { order_number: true } },
      },
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

    // Compute totals from the fetched rows to avoid a second DB round-trip
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
  } catch (error) {
    next(error);
  }
};
```

#### `src/controllers/cluster.controller.ts`

Apply the same logic but use `totalClusterEarnings` as the key name — the frontend
TypeScript type for cluster payouts uses that name specifically:

```typescript
export const getPayouts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) throw new ApiError(401, "Unauthorized.");

    await requireClusterFarmer(userId);

    const payouts = await prisma.payout.findMany({
      where: { user_id: userId },
      include: {
        order: { select: { order_number: true } },
      },
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

    const totalClusterEarnings = payouts
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const pendingPayouts = payouts
      .filter((p) => p.status === "pending" || p.status === "processing")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    res.status(200).json({
      status: "success",
      data: { payouts: formatted, totalClusterEarnings, pendingPayouts },
    });
  } catch (error) {
    next(error);
  }
};
```

---

### B6 — Expected response shapes

#### `GET /farmers/payouts` — 200 OK

```json
{
  "status": "success",
  "data": {
    "payouts": [
      {
        "id": "payout-uuid",
        "orderId": "order-uuid",
        "orderNumber": "AG-2026-112233",
        "amount": 52500,
        "status": "pending",
        "createdAt": "2026-06-01T00:00:00.000Z",
        "paidAt": null
      },
      {
        "id": "payout-uuid-2",
        "orderId": "order-uuid-2",
        "orderNumber": "AG-2026-100001",
        "amount": 17500,
        "status": "paid",
        "createdAt": "2026-05-20T00:00:00.000Z",
        "paidAt": "2026-05-22T14:30:00.000Z"
      }
    ],
    "totalEarnings": 17500,
    "pendingPayouts": 52500
  }
}
```

#### `GET /cluster/payouts` — 200 OK (note `totalClusterEarnings`, not `totalEarnings`)

```json
{
  "status": "success",
  "data": {
    "payouts": [ ... ],
    "totalClusterEarnings": 17500,
    "pendingPayouts": 52500
  }
}
```

---

## B7 — `GET /marketplace` server-side `?category=` filter ❌

### What the user sees right now

Nothing is visually broken — the filtering works, but it is done entirely in the browser
after fetching all listings. As the listing count grows this becomes slow: the browser
downloads thousands of listings, then discards most of them.

### The fix

Add `category` to the query param handling in the `getListings` controller. `fishType`
(exact match) always takes precedence over `category` (group match). If both are provided,
`fishType` wins and `category` is ignored.

**File:** `src/controllers/marketplace.controller.ts` — `getListings` function

#### Current state (query extraction + where clause)

```typescript
const {
  fishType,
  state,
  lga,
  minPrice,
  maxPrice,
  page = "1",
  limit = "20",
} = req.query;

const where: any = {
  status: "active",
  cluster_approved: true,
  is_draft: false,
  expires_at: { gte: new Date() },
};

if (fishType) where.fish_type = fishType;
if (state) where.location_state = { contains: state, mode: "insensitive" };
// ...
```

#### What it must look like after the fix

```typescript
const {
  fishType,
  state,
  lga,
  minPrice,
  maxPrice,
  page = "1",
  limit = "20",
  category, // ← new: "live" | "processed" | undefined
} = req.query;

// These must stay in sync with the LIVE_FISH_TYPES and PROCESSED_FISH_TYPES
// constants in the frontend (frontend/src/types/constants.ts).
const LIVE_TYPES = [
  "fingerlings",
  "juveniles",
  "table_size",
  "jumbo",
  "parent_stocks",
];
const PROCESSED_TYPES = [
  "dried",
  "grilled",
  "peppersoup",
  "peppered",
  "smoked",
];

const where: any = {
  status: "active",
  cluster_approved: true,
  is_draft: false,
  expires_at: { gte: new Date() },
};

if (fishType) {
  // Exact type match — ignore category if fishType is also present
  where.fish_type = fishType;
} else if (category === "live") {
  where.fish_type = { in: LIVE_TYPES };
} else if (category === "processed") {
  where.fish_type = { in: PROCESSED_TYPES };
}
// If neither fishType nor category is provided, no fish_type filter is applied
// and all approved listings are returned.

if (state) where.location_state = { contains: state, mode: "insensitive" };
if (lga) where.location_lga = { contains: lga, mode: "insensitive" };
if (minPrice)
  where.price_per_kg = {
    ...where.price_per_kg,
    gte: parseFloat(minPrice as string),
  };
if (maxPrice)
  where.price_per_kg = {
    ...where.price_per_kg,
    lte: parseFloat(maxPrice as string),
  };
```

**No schema migration needed.**

---

## B8 — `POST /buyers/demands` must accept `fishVariant: "live"` and `"processed"` ❌

### What the user sees right now

When a buyer submits the Special Demand form on the marketplace page with category "Live"
or "Processed", the request fails with a 400 or 500 error and the demand is not created.

### Why it happens

The `Demand` model has `fish_variant FishVariant?` where `FishVariant` is a Prisma enum
that currently only contains `dried`, `jumbo`, `table_size`, `broodstock`. The frontend
sends `"live"` or `"processed"` and Prisma rejects the write.

### The fix

**This task has zero additional work if B2 was completed correctly.**

B2 Step 1b expands the `FishVariant` enum to include `live` and `processed`. Once that
migration runs and `prisma generate` is executed, Prisma will accept those values.

There is one thing to double-check: if `createDemand` in `src/controllers/buyers.controller.ts`
has any inline validation that checks `fishVariant` against a hardcoded list, update that
list too. Search for `fishVariant` in the controller. If you find something like:

```typescript
if (
  fishVariant &&
  !["dried", "jumbo", "table_size", "broodstock"].includes(fishVariant)
) {
  throw new ApiError(400, "Invalid fish variant.");
}
```

Change it to:

```typescript
const VALID_VARIANTS = [
  "dried",
  "jumbo",
  "table_size",
  "broodstock",
  "live",
  "processed",
];
if (fishVariant && !VALID_VARIANTS.includes(fishVariant)) {
  throw new ApiError(
    400,
    `Invalid fish variant. Must be one of: ${VALID_VARIANTS.join(", ")}`,
  );
}
```

---

### B8 — What the frontend sends to `POST /buyers/demands`

```json
{
  "fishType": "dried",
  "weightKg": 100,
  "fishVariant": "processed",
  "locationState": "Lagos",
  "locationLga": "Ikeja",
  "deliveryAddress": "12 Allen Avenue, Ikeja",
  "notes": "Need within 5 business days"
}
```

| Field             | Type   | Required | Notes                                          |
| ----------------- | ------ | -------- | ---------------------------------------------- |
| `fishType`        | string | Yes      | One of the 10 valid types (not `catfish`)      |
| `weightKg`        | number | Yes      | Positive number, in kilograms                  |
| `fishVariant`     | string | No       | `"live"` or `"processed"` — the category label |
| `locationState`   | string | Yes      | Nigerian state name                            |
| `locationLga`     | string | Yes      | LGA within that state                          |
| `deliveryAddress` | string | Yes      | Street address for delivery                    |
| `notes`           | string | No       | Free-text notes from the buyer                 |

Expected 201 response:

```json
{
  "status": "success",
  "message": "Demand created successfully.",
  "data": {
    "demand": {
      "id": "demand-uuid",
      "buyer_id": "user-uuid",
      "fish_type": "dried",
      "weight_kg": "100",
      "fish_variant": "processed",
      "location_state": "Lagos",
      "location_lga": "Ikeja",
      "delivery_address": "12 Allen Avenue, Ikeja",
      "notes": "Need within 5 business days",
      "status": "pending",
      "created_at": "2026-06-04T00:00:00.000Z",
      "updated_at": "2026-06-04T00:00:00.000Z"
    }
  }
}
```

---

## Complete Prisma Migration Sequence

Run these in order. Never skip `npx prisma generate`.

```bash
# 1 — Enum expansions and payout field
#     (depends on: nothing — do this first)
npx prisma migrate dev --name "expand_fish_types_payout_paid_at"
npx prisma generate

# 2 — New tables
#     (depends on: migration 1 must have run so FishType/FishVariant enums are expanded)
npx prisma migrate dev --name "add_saved_listings_and_notifications"
npx prisma generate
```

If you need to run both in one go, you can combine all schema changes before running any
migration. Prisma will generate a single SQL file.

---

## All Frontend-Consumed Endpoints — Complete Reference

This is every API call the frontend makes. If an endpoint here is not listed in your
backend routes, it is either broken or missing. Auth column: `✓` = requires `Authorization:
Bearer <token>`, `—` = public.

### AUTH

| Method | Path                               | Auth | Request Body                                                   | Success Response                              |
| ------ | ---------------------------------- | ---- | -------------------------------------------------------------- | --------------------------------------------- |
| POST   | `/auth/role`                       | —    | `{ role: "farmer"\|"buyer"\|"cluster"\|"admin" }`              | 200                                           |
| POST   | `/auth/register`                   | —    | `{ fullName, phone, email, state, localGovernment, password }` | 201                                           |
| POST   | `/auth/register/otp`               | —    | `{ emailAddress, registerOtp }`                                | 200                                           |
| POST   | `/auth/register/otp/resend`        | —    | `{ emailAddress }`                                             | 200                                           |
| POST   | `/auth/login`                      | —    | `{ emailAddress, password }`                                   | 200 → sends OTP                               |
| POST   | `/auth/login/otp`                  | —    | `{ emailAddress, loginOtp }`                                   | 200 → `{ access_token, refresh_token, user }` |
| POST   | `/auth/login/otp/resend`           | —    | `{ emailAddress }`                                             | 200                                           |
| POST   | `/auth/forgot-password`            | —    | `{ emailAddress }`                                             | 200                                           |
| POST   | `/auth/forgot-password/otp`        | —    | `{ emailAddress, resetOtp, newPassword }`                      | 200                                           |
| POST   | `/auth/forgot-password/otp/resend` | —    | `{ emailAddress }`                                             | 200                                           |
| GET    | `/auth/me`                         | ✓    | —                                                              | 200 → full user object                        |
| POST   | `/auth/verify`                     | ✓    | `{ bvn, creditConsent }`                                       | 200                                           |
| POST   | `/auth/refresh`                    | —    | `{ refresh_token }`                                            | 200 → `{ access_token }`                      |
| POST   | `/auth/logout`                     | ✓    | —                                                              | 200                                           |
| POST   | `/auth/logout/all`                 | ✓    | —                                                              | 200                                           |

---

### FARMER

| Method | Path                                  | Auth     | Request Body                                                                                                                                                                      | Notes                                                                                                                                                                                 |
| ------ | ------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/farmers/listings/create`            | ✓ farmer | `{ fishType, harvestDate, totalFishAvailable, weightKg, listedDate? }`                                                                                                            | After B2: accepts all 10 `fishType` values                                                                                                                                            |
| GET    | `/farmers/listings/get`               | ✓ farmer | —                                                                                                                                                                                 | See response shape below                                                                                                                                                              |
| GET    | `/farmers/recent-activities`          | ✓ farmer | —                                                                                                                                                                                 | `{ activities: [{ id, description, type, created_at }] }`                                                                                                                             |
| PATCH  | `/farmers/account-profile`            | ✓ farmer | `{ fullName?, phoneNumber?, email?, profileImage?, farmName?, farmAddress?, localGovernment?, state?, fishType?, farmingCapacityKg?, yearsOfExperience? }`                        | `profileImage` is a Cloudinary URL string                                                                                                                                             |
| PATCH  | `/farmers/cluster-farmer-application` | ✓ farmer | `{ businessName, cacNumber, warehouseLocation, distributionCapacity, logisticsAvailable?, bvnVerification?, proofOfAddress?, cacRegistration?, businessLicense?, taxClearance? }` | All doc fields are Cloudinary URLs                                                                                                                                                    |
| GET    | `/farmers/orders`                     | ✓ farmer | —                                                                                                                                                                                 | `{ orders: [{ orderId, orderNumber, buyerName, buyerPhone?, fishType, variant?, weightKg, quantity, processed?, deliveryOption, status, paymentStatus?, totalAmount?, createdAt }] }` |
| GET    | `/farmers/payouts`                    | ✓ farmer | —                                                                                                                                                                                 | See B6 — must return `totalEarnings` and `pendingPayouts`                                                                                                                             |

**`GET /farmers/listings/get` full expected response:**

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
        "id": "listing-uuid",
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

| Method | Path                                    | Auth      | Request Body                                                                         | Notes                                                                                                                                                                              |
| ------ | --------------------------------------- | --------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PATCH  | `/cluster/account-profile`              | ✓ cluster | `{ fullName?, phoneNumber?, email?, profileImage? }`                                 |                                                                                                                                                                                    |
| GET    | `/cluster/listings/get`                 | ✓ cluster | —                                                                                    | Same summary+listings shape as farmer listings                                                                                                                                     |
| GET    | `/cluster/current-activities`           | ✓ cluster | —                                                                                    | `{ activities: [] }`                                                                                                                                                               |
| GET    | `/cluster/pending-approvals`            | ✓ cluster | —                                                                                    | `{ listings: [{ id, fishType, farmerName, harvestDate, listedDate, totalFishAvailable, packaging: { weightKg, quantity }, createdAt, updatedAt }] }`                               |
| PATCH  | `/cluster/pending-approvals/:listingId` | ✓ cluster | `{ status: "approved"\|"rejected", rejectionReason? }`                               |                                                                                                                                                                                    |
| GET    | `/cluster/farmers`                      | ✓ cluster | —                                                                                    | Must include `id` per farmer — see B4a                                                                                                                                             |
| GET    | `/cluster/farmers/:farmerId`            | ✓ cluster | —                                                                                    | Missing — see B4b                                                                                                                                                                  |
| GET    | `/cluster/orders`                       | ✓ cluster | —                                                                                    | `{ orders: [{ orderId, buyerName, buyerPhone, fishType, variant?, processed?, weightKg, quantity, deliveryOption, status, createdAt }] }`                                          |
| PATCH  | `/cluster/orders/:orderId`              | ✓ cluster | `{ status: "confirmed"\|"processing"\|"shipped"\|"delivered"\|"cancelled", notes? }` |                                                                                                                                                                                    |
| GET    | `/cluster/demands`                      | ✓ cluster | —                                                                                    | `{ demands: [{ id, buyerName, buyerPhone?, fishType, weightKg, fishVariant, locationState, locationLga, deliveryAddress, notes?, status, assignedAt?, acceptedAt?, createdAt }] }` |
| PATCH  | `/cluster/demands/:demandId/accept`     | ✓ cluster | —                                                                                    |                                                                                                                                                                                    |
| PATCH  | `/cluster/demands/:demandId/decline`    | ✓ cluster | `{ reason? }`                                                                        |                                                                                                                                                                                    |
| PATCH  | `/cluster/demands/:demandId/fulfill`    | ✓ cluster | —                                                                                    |                                                                                                                                                                                    |
| GET    | `/cluster/payouts`                      | ✓ cluster | —                                                                                    | See B6 — must return `totalClusterEarnings` and `pendingPayouts`                                                                                                                   |

---

### BUYER

| Method | Path                                       | Auth    | Request Body                                                                                                                                    | Notes                                                                                                                     |
| ------ | ------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| PATCH  | `/buyers/account-profile`                  | ✓ buyer | `{ fullName?, companyName?, phoneNumber?, email?, profileImage?, deliveryAddress?, localGovernment?, state?, businessType? }`                   |                                                                                                                           |
| POST   | `/buyers/orders`                           | ✓ buyer | `{ deliveryType: "pickup"\|"delivery", deliveryAddress?, deliveryFee?, items: [{ listingId, quantity, weightKg, pricePerUnit }], totalAmount }` | 201                                                                                                                       |
| GET    | `/buyers/orders`                           | ✓ buyer | —                                                                                                                                               | `{ orders: [{ orderId, orderNumber, clusterFarmerName, deliveryOption, status, payment_status, createdAt, updatedAt }] }` |
| GET    | `/buyers/orders/:orderId`                  | ✓ buyer | —                                                                                                                                               | Full order detail — see shape below                                                                                       |
| GET    | `/buyers/orders/:orderId/tracking`         | ✓ buyer | —                                                                                                                                               | `{ tracking: [{ status, message, createdAt }] }`                                                                          |
| PATCH  | `/buyers/orders/:orderId/confirm-delivery` | ✓ buyer | `{ payoutDelay?: "24 hours" }`                                                                                                                  |                                                                                                                           |
| POST   | `/buyers/orders/:orderId/pay`              | ✓ buyer | `{ paymentMethod: "card", amount: number }`                                                                                                     | Returns `{ authorizationUrl, transactionReference, amount }`                                                              |
| GET    | `/payments/verify`                         | —       | `?reference=`                                                                                                                                   | Paystack redirect — no auth required                                                                                      |
| GET    | `/buyers/demands`                          | ✓ buyer | —                                                                                                                                               |                                                                                                                           |
| POST   | `/buyers/demands`                          | ✓ buyer | `{ fishType, weightKg, fishVariant?, locationState, locationLga, deliveryAddress, notes? }`                                                     | See B8                                                                                                                    |
| DELETE | `/buyers/demands/:demandId`                | ✓ buyer | —                                                                                                                                               |                                                                                                                           |
| GET    | `/buyers/saved`                            | ✓ buyer | —                                                                                                                                               | Missing — see B3                                                                                                          |
| POST   | `/buyers/saved`                            | ✓ buyer | `{ listingId: "uuid" }`                                                                                                                         | Missing — see B3                                                                                                          |
| DELETE | `/buyers/saved/:listingId`                 | ✓ buyer | —                                                                                                                                               | Missing — see B3                                                                                                          |

**`GET /buyers/orders/:orderId` full expected response:**

```json
{
  "status": "success",
  "data": {
    "order": {
      "id": "order-uuid",
      "orderNumber": "AG-2026-112233",
      "buyerId": "user-uuid",
      "farmerId": "farmer-uuid",
      "clusterFarmerId": "cluster-uuid",
      "clusterFarmerName": "Ibrahim Farms",
      "clusterFarmerPhone": "08099887766",
      "items": [
        {
          "listingId": "listing-uuid",
          "fishType": "table_size",
          "weightKg": 5,
          "quantity": 10,
          "pricePerUnit": 17500,
          "totalPrice": 175000
        }
      ],
      "quantity": 10,
      "weightKg": 50,
      "totalAmount": 175000,
      "deliveryFee": 1500,
      "grandTotal": 176500,
      "deliveryType": "delivery",
      "deliveryAddress": "12 Allen Avenue, Ikeja",
      "deliveryNotes": null,
      "notes": null,
      "status": "confirmed",
      "paymentStatus": "paid",
      "deliveryConfirmed": false,
      "createdAt": "2026-06-01T00:00:00.000Z",
      "updatedAt": "2026-06-02T00:00:00.000Z",
      "deliveredAt": null,
      "confirmedAt": "2026-06-02T00:00:00.000Z"
    }
  }
}
```

---

### MARKETPLACE

| Method | Path                            | Auth | Query / Body                                                                                                                                | Notes                                                        |
| ------ | ------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| GET    | `/marketplace`                  | —    | `?fishType=&category=live\|processed&state=&lga=&minPrice=&maxPrice=&page=&limit=`                                                          | Server-side `category` filter — see B7                       |
| GET    | `/marketplace/:listingId`       | —    | —                                                                                                                                           | Single listing                                               |
| GET    | `/marketplace/cart`             | ✓    | —                                                                                                                                           |                                                              |
| POST   | `/marketplace/cart`             | ✓    | `{ listingId, variant?, processed?, weightKg, quantity, pricePerUnit }`                                                                     |                                                              |
| PATCH  | `/marketplace/cart/:cartItemId` | ✓    | `{ quantity?, weightKg? }`                                                                                                                  |                                                              |
| DELETE | `/marketplace/cart/:cartItemId` | ✓    | —                                                                                                                                           |                                                              |
| POST   | `/marketplace/checkout`         | ✓    | `{ deliveryType: "pickup"\|"delivery", deliveryAddress?, deliveryFee: number, totalAmount: number, cartItems: [{ cartItemId, quantity }] }` | 201 → `{ order: { id, order_number, status, grand_total } }` |

**`GET /marketplace` individual listing object shape:**

```json
{
  "id": "listing-uuid",
  "clusterFarmerId": "cluster-uuid",
  "clusterFarmerName": "Ibrahim Aquaculture",
  "clusterFarmerContact": "08099887766",
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

| Method | Path                                      | Auth    | Request Body / Query                                         | Notes                                                   |
| ------ | ----------------------------------------- | ------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| GET    | `/admin/settings`                         | **—**   | —                                                            | Public — see B1. Always returns all 11 fish type prices |
| PATCH  | `/admin/settings/price`                   | ✓ admin | `{ pricePerKg: { [fishType]: number } }` — all keys optional |                                                         |
| GET    | `/admin/dashboard/metrics`                | ✓ admin | —                                                            |                                                         |
| GET    | `/admin/dashboard/charts`                 | ✓ admin | —                                                            |                                                         |
| GET    | `/admin/dashboard/activities`             | ✓ admin | —                                                            |                                                         |
| GET    | `/admin/cluster-applications`             | ✓ admin | —                                                            |                                                         |
| PUT    | `/admin/cluster-applications/:id/approve` | ✓ admin | —                                                            |                                                         |
| PUT    | `/admin/cluster-applications/:id/reject`  | ✓ admin | `{ reason? }`                                                |                                                         |
| GET    | `/admin/listings`                         | ✓ admin | `?status=&fishType=&state=`                                  |                                                         |
| PUT    | `/admin/listings/:id/approve`             | ✓ admin | —                                                            |                                                         |
| PUT    | `/admin/listings/:id/reject`              | ✓ admin | `{ reason? }`                                                |                                                         |
| PATCH  | `/admin/listings/:id/flag`                | ✓ admin | —                                                            |                                                         |
| DELETE | `/admin/listings/:id`                     | ✓ admin | —                                                            |                                                         |
| GET    | `/admin/farmers`                          | ✓ admin | `?role=&state=&verificationStatus=`                          |                                                         |
| GET    | `/admin/farmers/:id`                      | ✓ admin | —                                                            |                                                         |
| PATCH  | `/admin/farmers/:id/toggle-active`        | ✓ admin | —                                                            |                                                         |
| GET    | `/admin/orders`                           | ✓ admin | `?status=&paymentStatus=`                                    |                                                         |
| GET    | `/admin/orders/:id`                       | ✓ admin | —                                                            |                                                         |
| GET    | `/admin/demands`                          | ✓ admin | `?status=&state=`                                            |                                                         |
| GET    | `/admin/demands/:id`                      | ✓ admin | —                                                            |                                                         |
| PATCH  | `/admin/demands/:id/assign`               | ✓ admin | `{ cluster_farmer_id: "uuid" }`                              |                                                         |

---

### NOTIFICATIONS

| Method | Path                                  | Auth | Notes                                                               |
| ------ | ------------------------------------- | ---- | ------------------------------------------------------------------- |
| GET    | `/notifications`                      | ✓    | Returns `{ notifications: [...], unreadCount: number }` — see B5    |
| PATCH  | `/notifications/read-all`             | ✓    | Must be registered **before** `/:notificationId/read` in the router |
| PATCH  | `/notifications/:notificationId/read` | ✓    |                                                                     |

---

## Known Intentional Limitations (Not Bugs — Do Not Implement)

These features show a toast message in the UI and take no further action. They are
deliberately out of scope for the current phase. Do not add backend support for them.

| UI Element                           | Page                            | Reason not implemented              |
| ------------------------------------ | ------------------------------- | ----------------------------------- |
| "Report an Issue" button             | `/buyers-dashboard/orders/[id]` | No support ticket system in scope   |
| "View Sessions" button               | `/admin-dashboard/settings`     | No session management API planned   |
| "Invoice" button                     | `/buyers-dashboard/orders/[id]` | No invoice generation service       |
| OTP expiry / session duration config | `/admin-dashboard/settings`     | Hardcoded server-side for now       |
| All `/financial/*` routes            | Farmer + Cluster dashboards     | Financial services excluded from v1 |

---

## Summary Checklist

Copy this into your task tracker. Tick each box only after the feature is tested end-to-end
with the frontend running at `http://localhost:3000`.

- [ ] **B1** — `GET /admin/settings` returns 200 for unauthenticated requests
- [ ] **B2a** — Prisma `FishType` enum includes all 10 types + `catfish`
- [ ] **B2b** — Prisma `FishVariant` enum includes `live` and `processed`
- [ ] **B2c** — `POST /farmers/listings/create` with `fishType: "smoked"` returns 201
- [ ] **B2d** — `GET /admin/settings` response includes all 11 `pricePerKg` keys
- [ ] **B2e** — `PATCH /admin/settings/price` with `{ pricePerKg: { smoked: 6500 } }` returns 200
- [ ] **B3a** — `GET /buyers/saved` returns 200 with `{ listings: [] }` for a new buyer
- [ ] **B3b** — `POST /buyers/saved` returns 200 and is idempotent (second call also 200)
- [ ] **B3c** — `DELETE /buyers/saved/:listingId` returns 200 and is idempotent
- [ ] **B4a** — `GET /cluster/farmers` response includes `id` field on each farmer object
- [ ] **B4b** — `GET /cluster/farmers/:farmerId` returns 200 with full farmer profile
- [ ] **B4c** — `GET /cluster/farmers/nonexistent-uuid` returns 404
- [ ] **B5a** — `GET /notifications` returns 200 with `{ notifications: [], unreadCount: 0 }`
- [ ] **B5b** — `PATCH /notifications/read-all` returns 200
- [ ] **B5c** — Approving a listing creates a notification for the farmer
- [ ] **B5d** — Assigning a demand creates a notification for the cluster farmer
- [ ] **B6a** — `GET /farmers/payouts` response includes `orderNumber`, `paidAt`, `totalEarnings`, `pendingPayouts`
- [ ] **B6b** — `GET /cluster/payouts` response includes `totalClusterEarnings` (not `totalEarnings`)
- [ ] **B7** — `GET /marketplace?category=processed` returns only processed fish type listings
- [ ] **B7** — `GET /marketplace?category=live` returns only live fish type listings
- [ ] **B8** — `POST /buyers/demands` with `fishVariant: "live"` returns 201
