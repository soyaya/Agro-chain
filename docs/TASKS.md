# Tasks

## Context

This file tracks all pending work from the `pricePerUnit` removal + per-fish-type admin pricing session.
Pick up from here in any future session.

---

## Loading Prompt

> Paste this into a new session to restore full context instantly.

```
We are working on the Agro-chain project. The frontend and backend live in the same monorepo:
- Frontend: /home/olorunshogo/Projects/Next/Agro-chain/frontend (Next.js 15, TypeScript)
- Backend: /home/olorunshogo/Projects/Next/Agro-chain/Agro-chain2 (Express, Prisma, PostgreSQL)

We completed a major change: removing pricePerUnit from farmer/cluster listing creation and replacing
it with an admin-controlled per-fish-type price config. Here is what was done and what still needs
to be done on the backend. Read docs/endpoints/ for the full API contract.
```

---

## What Was Done (Frontend - COMPLETE)

All frontend changes are done. The frontend is fully wired and waiting for the backend.

- `types/constants.ts` - replaced `BASE_PRICE_PER_KG_NAIRA` with `FALLBACK_PRICES_PER_KG` map (all 6 fish types) and expanded `FISH_TYPES` to all 6 types with `FISH_TYPE_LABELS`
- `types/index.ts` - made `pricePerUnit` optional on `PackagingOption`; changed `SupplyListingFormData` to use flat `weightKg: number` instead of `packaging: PackagingOption[]`
- `lib/services/farmer.service.ts` - `CreateListingPayload` now sends `weightKg` directly (no `packaging` object, no `pricePerUnit`); `FarmerListingRecord` uses flat `weightKg` and `quantity` fields
- `lib/services/admin.service.ts` - added `FishPriceConfig`, `PlatformSettings`, `PlatformSettingsResponse` types; added `getSettings()` and `updatePrices()` methods
- `lib/services/marketplace.service.ts` - removed `pricePerUnit` from `updateCartItem` updates type; added comment on `AddToCartPayload.pricePerUnit` clarifying it is a price snapshot, not user input
- `context/PlatformSettingsContext.tsx` - new context provider that fetches `GET /admin/settings` on mount and exposes `pricePerKg` map + `getPricePerUnit()` helper; falls back to `FALLBACK_PRICES_PER_KG` if backend is unreachable
- `app/layout.tsx` - wrapped app with `PlatformSettingsProvider`
- `components/listings/PackagingSelector.tsx` - removed price input field; now only collects `weightKg`; `pricePerUnit` intentionally omitted from output
- `components/listings/SupplyListingForm.tsx` - replaced packaging array with single `weightKg` field; added pricing note info box
- `farmers-dashboard/listings/create/page.tsx` - sends `weightKg` directly to `farmerService.createListing`
- `farmers-dashboard/listings/page.tsx` - updated mapping to use flat `item.weightKg` and `item.quantity`
- `cluster-dashboard/listings/create/page.tsx` - removed `pricePerUnit` from packaging state and UI; removed `pricePerKg` from form schema
- `cluster-dashboard/pending-approvals/page.tsx` - removed `pricePerUnit: 0` from listing mapping
- `marketplace/page.tsx` - uses `usePlatformSettings()` instead of hardcoded constant
- `marketplace/[id]/page.tsx` - uses `usePlatformSettings()` instead of hardcoded constant
- `components/marketplace/useCart.ts` - `computePricePerUnit` now takes `fishType` and uses context price map
- Docs updated: `2_FARMERS.md`, `3_CLUSTER.md`, `5_MARKETPLACE.md`, `6_ADMIN.md`

---

## Corrections

All frontend corrections are complete.

---

## Implementations

### Backend - Required for the whole thing to work

---

#### 1. Add `PlatformSetting` model to Prisma schema

File: `Agro-chain2/prisma/schema.prisma`

Add this model at the bottom of the file, before the closing:

```prisma
model PlatformSetting {
  id         String   @id @default(uuid()) @db.Uuid
  key        String   @unique
  value      Json
  updated_at DateTime @updatedAt
  updated_by String?  @db.Uuid

  @@map("platform_settings")
}
```

Then run:

```bash
npx prisma migrate dev --name add_platform_settings
npx prisma generate
```

---

#### 2. Seed default fish prices

File: `Agro-chain2/prisma/seed.ts` (create if it doesn't exist) or add to your existing seed script.

```typescript
await prisma.platformSetting.upsert({
  where: { key: "fish_prices" },
  update: {},
  create: {
    key: "fish_prices",
    value: {
      catfish: 3500,
      fingerlings: 1200,
      juveniles: 800,
      table_size: 3500,
      jumbo: 5000,
      parent_stocks: 8000,
    },
  },
});
```

Run with: `npx prisma db seed`

---

#### 3. Create `settings.controller.ts`

File: `Agro-chain2/src/controllers/settings.controller.ts` (new file)

```typescript
import { Request, Response, NextFunction } from "express";
import { prisma } from "../models/user.model.js";
import { ApiError } from "../middleware/error.middleware.js";

const FISH_PRICE_KEY = "fish_prices";

const DEFAULT_PRICES = {
  catfish: 3500,
  fingerlings: 1200,
  juveniles: 800,
  table_size: 3500,
  jumbo: 5000,
  parent_stocks: 8000,
};

// GET /admin/settings — public, no auth required
export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: FISH_PRICE_KEY },
    });

    const pricePerKg = setting ? (setting.value as typeof DEFAULT_PRICES) : DEFAULT_PRICES;

    res.status(200).json({
      status: "success",
      data: {
        settings: {
          pricePerKg,
          updatedAt: setting?.updated_at ?? null,
          updatedBy: setting?.updated_by ?? null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /admin/settings/price — admin only
export const updatePrices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user?.user_id;
    if (!adminId) throw new ApiError(401, "Unauthorized.");

    const { pricePerKg } = req.body;
    if (!pricePerKg || typeof pricePerKg !== "object") {
      throw new ApiError(400, "pricePerKg must be an object.");
    }

    // Validate all provided values are positive numbers
    const validKeys = [
      "catfish",
      "fingerlings",
      "juveniles",
      "table_size",
      "jumbo",
      "parent_stocks",
    ];
    for (const [key, val] of Object.entries(pricePerKg)) {
      if (!validKeys.includes(key)) throw new ApiError(400, `Unknown fish type: ${key}`);
      if (typeof val !== "number" || val <= 0) {
        throw new ApiError(400, `Price for ${key} must be a positive number.`);
      }
    }

    // Fetch existing, merge, then save — partial update
    const existing = await prisma.platformSetting.findUnique({
      where: { key: FISH_PRICE_KEY },
    });
    const currentPrices = existing ? (existing.value as typeof DEFAULT_PRICES) : DEFAULT_PRICES;
    const merged = { ...currentPrices, ...pricePerKg };

    const updated = await prisma.platformSetting.upsert({
      where: { key: FISH_PRICE_KEY },
      update: { value: merged, updated_by: adminId },
      create: { key: FISH_PRICE_KEY, value: merged, updated_by: adminId },
    });

    res.status(200).json({
      status: "success",
      message: "Prices updated successfully.",
      data: {
        settings: {
          pricePerKg: updated.value,
          updatedAt: updated.updated_at,
          updatedBy: updated.updated_by,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
```

---

#### 4. Create `settings.routes.ts`

File: `Agro-chain2/src/routes/settings.routes.ts` (new file)

```typescript
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import * as settingsController from "../controllers/settings.controller.js";

const router = Router();

/**
 * @openapi
 * /admin/settings:
 *   get:
 *     tags: [Admin]
 *     summary: Get platform settings (public)
 *     responses:
 *       200:
 *         description: Platform settings retrieved successfully
 * /admin/settings/price:
 *   patch:
 *     tags: [Admin]
 *     summary: Update fish prices (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pricePerKg:
 *                 type: object
 *                 properties:
 *                   catfish:
 *                     type: number
 *                   fingerlings:
 *                     type: number
 *                   juveniles:
 *                     type: number
 *                   table_size:
 *                     type: number
 *                   jumbo:
 *                     type: number
 *                   parent_stocks:
 *                     type: number
 *     responses:
 *       200:
 *         description: Prices updated successfully
 */

// GET is public — no auth
router.get("/settings", settingsController.getSettings);

// PATCH requires admin
router.patch("/settings/price", authMiddleware, requireAdmin, settingsController.updatePrices);

export default router;
```

---

#### 5. Register the settings routes in `routes/index.ts`

File: `Agro-chain2/src/routes/index.ts`

The admin routes are currently registered as `router.use("/admin", adminRoutes)`. The settings endpoints need to be accessible at `/admin/settings` and `/admin/settings/price`.

**Option A** (recommended): Add the settings routes directly inside `admin.routes.ts` by importing and using the settings controller there.

**Option B**: Import `settingsRoutes` in `index.ts` and mount at `/admin`:

```typescript
import settingsRoutes from "./settings.routes.js";
// ...
router.use("/admin", settingsRoutes);
```

Either way, the final URLs must be:

- `GET /api/admin/settings`
- `PATCH /api/admin/settings/price`

---

#### 6. Update `farmers.controller.ts` - `createListing`

File: `Agro-chain2/src/controllers/farmers.controller.ts`

**Current code (lines ~30-45):**

```typescript
const { fishType, harvestDate, listedDate, totalFishAvailable, packaging } = req.body;
// ...
price_per_fish: packaging?.pricePerUnit ?? 0,
price_per_kg: packaging?.pricePerUnit ?? 0,
packaging_weight_kg: packaging?.weightKg ?? 0,
total_available_kg: (packaging?.weightKg ?? 0) * totalFishAvailable,
```

**Replace with:**

```typescript
const { fishType, harvestDate, listedDate, totalFishAvailable, weightKg } = req.body;

// Fetch platform price for this fish type
const priceSetting = await prisma.platformSetting.findUnique({
  where: { key: "fish_prices" },
});
const prices = priceSetting?.value as Record<string, number> | null;
const pricePerKg = prices?.[fishType?.toLowerCase()] ?? 3500;
const pricePerFish = (weightKg ?? 0) * pricePerKg;

// Then in prisma.listing.create:
price_per_fish: pricePerFish,
price_per_kg: pricePerKg,
packaging_weight_kg: weightKg ?? 0,
total_available_kg: (weightKg ?? 0) * totalFishAvailable,
```

Also update the `logActivity` call below it — it currently references `packaging?.weightKg`, change to `weightKg`.

---

#### 7. Update `farmers.controller.ts` - `getListings` response shape

File: `Agro-chain2/src/controllers/farmers.controller.ts`

**Current code (lines ~115-122):**

```typescript
packaging: {
  weightKg: l.packaging_weight_kg,
  quantity: l.quantity_available,
  pricePerUnit: l.price_per_fish,
},
```

**Replace with flat fields:**

```typescript
weightKg: l.packaging_weight_kg,
quantity: l.quantity_available,
```

Remove `packaging` entirely from the formatted listing object. The frontend now reads `item.weightKg` and `item.quantity` directly.

---

#### 8. Update `marketplace.controller.ts` - compute `pricePerUnit` from platform config

File: `Agro-chain2/src/controllers/marketplace.controller.ts`

Both `getListings` and `getListingById` currently return:

```typescript
packaging: [
  {
    weightKg: l.packaging_weight_kg,
    quantity: l.quantity_available,
    pricePerUnit: l.price_per_fish,   // This is currently 0 for new listings
  },
],
pricePerKg: l.price_per_kg,           // This is also 0 for new listings
```

Since `price_per_fish` and `price_per_kg` on the listing record are now computed from the platform config at creation time (step 6 above), these fields will be correct for new listings. However, to ensure the marketplace always reflects the current admin price (in case prices change after a listing is created), fetch the platform price and recompute:

**In `getListings`**, before the `formatted` map, add:

```typescript
const priceSetting = await prisma.platformSetting.findUnique({
  where: { key: "fish_prices" },
});
const platformPrices = priceSetting?.value as Record<string, number> | null;
```

Then in the map:

```typescript
const fishPricePerKg = platformPrices?.[l.fish_type] ?? Number(l.price_per_kg) ?? 3500;
const pricePerUnit = Number(l.packaging_weight_kg) * fishPricePerKg;

// In the returned object:
packaging: [
  {
    weightKg: Number(l.packaging_weight_kg),
    quantity: l.quantity_available,
    pricePerUnit,   // Always current platform price
  },
],
pricePerKg: fishPricePerKg,
```

Apply the same pattern to `getListingById`.

---

#### 9. Update `marketplace.controller.ts` - `updateCartItem`

File: `Agro-chain2/src/controllers/marketplace.controller.ts`

**Current code:**

```typescript
const { quantity, weightKg, pricePerUnit } = req.body;
// ...
const newPricePerUnit = pricePerUnit ?? item.price_per_unit;
const newTotalPrice = Number(newPricePerUnit) * newQuantity;
```

**Replace with** (price is not user-editable, always use stored value):

```typescript
const { quantity, weightKg } = req.body;
// ...
const newQuantity = quantity ?? item.quantity;
const newWeightKg = weightKg ?? item.weight_kg;
const newTotalPrice = Number(item.price_per_unit) * newQuantity;

const updated = await prisma.cartItem.update({
  where: { id: cartItemId },
  data: {
    quantity: newQuantity,
    weight_kg: newWeightKg,
    total_price: newTotalPrice,
    // price_per_unit is NOT updated — it is snapshotted at cart-add time
  },
});
```

---

#### 10. Update Swagger docs in `farmers.routes.ts`

File: `Agro-chain2/src/routes/farmers.routes.ts`

Find the `@openapi` block for `POST /farmers/listings/create` and update the `requestBody` schema:

**Current:**

```yaml
required: [fishType, harvestDate, totalFishAvailable, packaging]
properties:
  fishType:
    type: string
  harvestDate:
    type: string
    format: date
  listedDate:
    type: string
    format: date
  totalFishAvailable:
    type: number
  packaging:
    type: object
    properties:
      weightKg:
        type: number
      pricePerUnit:
        type: number
```

**Replace with:**

```yaml
required: [fishType, harvestDate, totalFishAvailable, weightKg]
properties:
  fishType:
    type: string
    enum: [catfish, fingerlings, juveniles, table_size, jumbo, parent_stocks]
  harvestDate:
    type: string
    format: date
  listedDate:
    type: string
    format: date
  totalFishAvailable:
    type: number
  weightKg:
    type: number
    description: Weight per fish in kg. pricePerUnit is computed server-side from admin config.
```

---

#### 11. Update Swagger docs in `listing.routes.ts`

File: `Agro-chain2/src/routes/listing.routes.ts`

Find the `@openapi` block for `POST /listings` and `PUT /listings/{id}` and remove `pricePerUnit` from both `required` arrays and `properties` objects. These legacy routes still exist but should not accept `pricePerUnit` from clients.

---

#### 12. Check `requireAdmin` middleware exists

The settings PATCH route uses `requireAdmin`. Verify this middleware exists at `Agro-chain2/src/middleware/admin.middleware.ts`. If it doesn't exist, create it:

```typescript
import { Request, Response, NextFunction } from "express";
import { ApiError } from "./error.middleware.js";

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    throw new ApiError(403, "Admin access required.");
  }
  next();
};
```

---

## Base API URL - Production Checklist

When deploying to production:

- Set `NEXT_PUBLIC_BASE_BACKEND_URL=https://your-api-domain.com` in Vercel (or your host) environment variables
- Optionally also set `BASE_BACKEND_URL` to the same value for server-side usage
- The `api.ts` file already handles both - no code changes needed
- The `.env` and `.env.local` files have a real ipstack API key hardcoded - make sure these are in `.gitignore` and not committed
- The `.env.example` is the clean reference - use it as the template

---

## Notes

- `pricePerUnit` still appears in cart items, order items, and order history - this is intentional. It is a price snapshot at time of purchase, not user input.
- `MarketplaceCard.tsx` reads `p.pricePerUnit` from the packaging array to show price range - this works correctly once the backend sends it computed from the platform config.
- The `FALLBACK_PRICES_PER_KG` constant in `constants.ts` is the dev-time fallback only. In production, the live values come from `GET /admin/settings`.
- The `catfish` fish type is missing from the `FishType` enum in `listing.model.ts` (Zod schema) - it only has `fingerlings | juveniles | table_size | jumbo | parent_stocks`. Add `catfish` to that enum.
