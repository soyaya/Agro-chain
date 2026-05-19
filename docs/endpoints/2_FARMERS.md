# Farmer Endpoints

All farmer endpoints require authentication. The authenticated user must have `role: "farmer"` or `role: "cluster"`.

---

## Create Listing

The farmer submits a new supply listing. If the farmer is assigned to a cluster farmer, the listing is held for cluster approval before appearing on the marketplace. If the farmer has no cluster farmer assigned, it is auto-approved.

`pricePerUnit` is NOT accepted here. The backend computes it from the platform-wide `pricePerKg` config set by the admin (`pricePerUnit = weightKg * pricePerKg[fishType]`).

**POST /farmers/listings/create**

```typescript
// Request body
{
  fishType: "catfish" | "fingerlings" | "juveniles" | "table_size" | "jumbo" | "parent_stocks",
  harvestDate: string,          // ISO date string e.g. "2026-03-15"
  listedDate: string,           // ISO date string, optional, defaults to today
  totalFishAvailable: number,   // Total number of fish e.g. 200
  weightKg: number              // Weight per fish in kg e.g. 1.5
}

// Response
{
  status: "success",
  message: "Listing submitted and sent to your cluster manager for approval.",
  data: {
    listing: {
      id: string,
      farmer_id: string,
      fish_type: string,
      quantity_available: number,
      price_per_fish: number,       // Computed: weightKg * pricePerKg[fishType]
      price_per_kg: number,         // From platform settings for this fish type
      packaging_weight_kg: number,
      total_available_kg: number,
      harvest_date: string,
      listed_date: string,
      location_state: string,
      location_lga: string,
      location_address: string,
      status: "active",
      cluster_approved: boolean,
      expires_at: string,
      created_at: string,
      updated_at: string
    }
  }
}
```

---

## Get Listings

Returns all listings belonging to the logged-in farmer along with summary stats. The frontend uses this to populate the farmer's listings dashboard.

**GET /farmers/listings/get**

```typescript
// Response
{
  status: "success",
  data: {
    summary: {
      totalListings: number,
      pendingApproval: number,
      approved: number,
      rejected: number,
      totalSupply: number   // Total kg across all active listings
    },
    listings: Array<{
      id: string,
      fishType: string,
      harvestDate: string,
      listedDate: string,
      totalFishAvailable: number,
      totalAvailableKg: number,
      weightKg: number,           // Weight per fish in kg
      quantity: number,           // Derived: floor(totalAvailableKg / weightKg)
      status: "approved" | "pending" | "rejected",
      isApproved: boolean,
      createdAt: string
    }>
  }
}
```

---

## Recent Activities

Returns the last 20 activity log entries for the farmer. Used to populate the activity feed on the farmer dashboard.

**GET /farmers/recent-activities**

```typescript
// Response
{
  status: "success",
  data: {
    activities: Array<{
      id: string,
      description: string,   // Human-readable e.g. "Listing Catfish 300kg was approved"
      type: string,          // e.g. "listing_created", "listing_approved", "profile_updated"
      created_at: string
    }>
  }
}
```

---

## Update Profile

The farmer updates their personal and farm information. All fields are optional and only provided fields are updated.

**PATCH /farmers/account-profile**

```typescript
// Request body — all fields optional, only send what changed
{
  fullName: string,
  phoneNumber: string,       // Nigerian format
  email: string,
  profileImage: string,      // URL string from Cloudinary upload
  farmName: string,
  farmAddress: string,
  localGovernment: string,
  state: string,
  fishType: string,
  farmingCapacityKg: number,
  yearsOfExperience: number
}

// Response
{
  status: "success",
  message: "Profile updated successfully.",
  data: {
    profile: {
      id: string,
      userId: string,
      fullName: string,
      phoneNumber: string,
      email: string,
      profileImage: string | null,
      farmName: string | null,
      farmAddress: string | null,
      localGovernment: string,
      state: string,
      fishType: string | null,
      farmingCapacityKg: number | null,
      yearsOfExperience: number | null,
      isClusterFarmer: boolean,
      createdAt: string,
      updatedAt: string
    }
  }
}
```

---

## Cluster Farmer Application

The farmer applies to become a cluster farmer. Document fields receive Cloudinary URL strings obtained by uploading files to the /api/upload endpoint first. The backend stores these URLs directly. The application can only be updated once every 6 months.

**PATCH /farmers/cluster-farmer-application**

```typescript
// Request body — all fields required for a new application
{
  businessName: string,
  cacNumber: string,
  warehouseLocation: string,
  distributionCapacity: number,
  logisticsAvailable: boolean,
  bvnVerification: string,      // Cloudinary secure_url for BVN document
  proofOfAddress: string,       // Cloudinary secure_url for proof of address
  cacRegistration: string,      // Cloudinary secure_url for CAC certificate
  businessLicense: string,      // Cloudinary secure_url for business license
  taxClearance: string          // Cloudinary secure_url for tax clearance
}

// Response
{
  status: "success",
  message: "Cluster farmer application submitted. Admin will review shortly."
}
```

Note: The backend currently accepts these document fields as string URLs and stores them in `bvn_doc_url`, `proof_of_address_url`, `cac_registration_url`, `business_license_url`, and `tax_clearance_url` on the user record. It also sets `is_cluster_farmer: true` and `cluster_approved: false` automatically on submission.

---

## Orders

Returns all orders tied to the farmer's listings. Read-only for farmers.

**GET /farmers/orders**

```typescript
// Response
{
  status: "success",
  data: {
    orders: Array<{
      orderId: string,
      listingId: string | null,
      buyerName: string,
      quantity: number,
      weightKg: number | null,
      status: "draft" | "payment_pending" | "paid" | "confirmed" | "processing" | "shipped" | "delivered" | "completed" | "cancelled" | "disputed",
      createdAt: string
    }>
  }
}
```

---

## Payouts

Returns the farmer's payout history. Payouts are created when a buyer confirms delivery.

**GET /farmers/payouts**

```typescript
// Response
{
  status: "success",
  data: {
    payouts: Array<{
      payoutId: string,
      orderId: string,
      amount: number,
      scheduledFor: string,
      status: "pending" | "processing" | "paid" | "failed",
      createdAt: string
    }>
  }
}
```
