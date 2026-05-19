# Cluster Farmer Endpoints

All cluster farmer endpoints require authentication. The authenticated user must have `role: "cluster"`.

---

## Update Profile

The cluster farmer updates their personal, farm, and business information. All fields are optional.

**PATCH /cluster/account-profile**

```typescript
// Request body — all fields optional
{
  fullName: string,
  phoneNumber: string,
  email: string,
  profileImage: string,        // Cloudinary URL
  farmName: string,
  farmAddress: string,
  localGovernment: string,
  state: string,
  fishType: string,
  farmingCapacityKg: number,
  yearsOfExperience: number,
  businessName: string,
  cacNumber: string,
  warehouseLocation: string,
  distributionCapacity: number,
  logisticsAvailable: boolean
}

// Response
{
  status: "success",
  message: "Profile updated successfully.",
  data: {
    profile: {
      id: string,
      userId: string,
      profileImage: string | null,
      fullName: string,
      phoneNumber: string,
      email: string,
      farmName: string | null,
      farmAddress: string | null,
      localGovernment: string,
      state: string,
      fishType: string | null,
      farmingCapacityKg: number | null,
      yearsOfExperience: number | null,
      businessName: string | null,
      cacNumber: string | null,
      warehouseLocation: string | null,
      distributionCapacity: number | null,
      logisticsAvailable: boolean,
      isClusterFarmer: boolean,
      verificationStatus: boolean,   // true means cluster_approved
      createdAt: string,
      updatedAt: string
    }
  }
}
```

---

## Create Listing

The cluster farmer creates a marketplace listing directly. Unlike regular farmers, cluster farmers post listings themselves without an approval step.

`pricePerUnit` is NOT accepted here. The backend computes it from the platform-wide `pricePerKg` config set by the admin (`pricePerUnit = weightKg * pricePerKg[fishType]`).

**POST /cluster/listings/create**

```typescript
// Request body
{
  fishType: "catfish" | "fingerlings" | "juveniles" | "table_size" | "jumbo" | "parent_stocks",
  harvestDate: string,          // ISO date string e.g. "2026-03-15"
  totalFishAvailable: number,   // Total number of fish
  weightKg: number,             // Weight per fish in kg e.g. 1.5
  location: string,             // Warehouse / pickup address
  state: string,
  localGovernment: string,
  deliveryOptions: Array<"pickup" | "delivery">,
  visibleOnMarketplace: boolean
}

// Response
{
  status: "success",
  message: "Listing created successfully.",
  data: {
    listing: { /* full listing object */ }
  }
}
```

---

## Listings Overview

Returns a summary of all listings from farmers under this cluster farmer, along with the full list. This is the cluster farmer's view of all supply under their management.

**GET /cluster/listings/get**

```typescript
// Response
{
  status: "success",
  data: {
    summary: {
      farmersUnderMe: number,
      pendingApproval: number,
      allListings: number,
      totalSupply: number       // Total kg of approved active listings
    },
    listings: Array<{
      id: string,
      farmerId: string,
      fishType: string,
      location: string,         // "LGA, State" format
      harvestDate: string,
      listedDate: string,
      totalFishAvailable: number,
      weightKg: number,         // Weight per fish in kg
      quantity: number,         // Derived: floor(totalAvailableKg / weightKg)
      status: "approved" | "pending" | "rejected"
    }>
  }
}
```

---

## Current Activities

Returns recent activity logs for the cluster farmer and all farmers under them. Used to populate the activity feed on the cluster dashboard.

**GET /cluster/current-activities**

```typescript
// Response
{
  status: "success",
  data: {
    activities: Array<{
      id: string,
      description: string,
      type: string,
      created_at: string,
      user: {
        full_name: string
      }
    }>
  }
}
```

---

## Pending Approvals

Returns all listings from farmers under this cluster farmer that are waiting for approval. The cluster farmer reviews each one and either approves or rejects it.

**GET /cluster/pending-approvals**

```typescript
// Response
{
  status: "success",
  data: {
    listings: Array<{
      id: string,
      fishType: string,
      farmerName: string,
      harvestDate: string,
      listedDate: string,
      totalFishAvailable: number,
      weightKg: number,         // Weight per fish in kg
      quantity: number,         // Derived: floor(totalAvailableKg / weightKg)
      createdAt: string,
      updatedAt: string
    }>
  }
}
```

**PATCH /cluster/pending-approvals/:listingId**

The cluster farmer approves or rejects a specific listing. Approved listings become visible on the marketplace under the cluster farmer's name.

```typescript
// Request body
{
  status: "approved" | "rejected",
  rejectionReason: string    // Required when status is "rejected"
}

// Response
{
  status: "success",
  message: "Listing approved successfully." | "Listing rejected successfully.",
  data: {
    listing: { /* updated listing object */ }
  }
}
```

Note: The frontend also calls `PUT /listings/:id/cluster-approve` with `{ action: "approve" | "reject", reason?: string }` for the same purpose. Both routes exist. The cluster pending approvals page uses the listings route directly.

---

## Farmers Under Cluster

Returns all farmers assigned to this cluster farmer along with their stats.

**GET /cluster/farmers**

```typescript
// Response
{
  status: "success",
  data: {
    summary: {
      totalFarmers: number,
      totalFarmersCapacity: number,   // Sum of all farmers' farming_capacity_kg
      locationCovering: number        // Number of unique LGAs covered
    },
    farmers: Array<{
      farmerName: string,
      fishType: string,
      totalListings: number,
      totalApprovedListings: number,
      totalPendingListings: number,
      farmName: string | null,
      location: string,               // "LGA, State" format
      phoneNumber: string,
      emailAddress: string | null,
      capacity: number | null,
      experience: number | null,
      memberSince: string,
      lastActive: string
    }>
  }
}
```

---

## Orders

Returns all orders routed through this cluster farmer.

**GET /cluster/orders**

```typescript
// Response
{
  status: "success",
  data: {
    orders: Array<{
      orderId: string,
      buyerName: string,
      buyerPhone: string,
      fishType: string,
      variant: string | null,
      processed: boolean,
      weightKg: number | null,
      quantity: number,
      deliveryOption: string | null,
      status: "draft" | "payment_pending" | "paid" | "confirmed" | "processing" | "shipped" | "delivered" | "completed" | "cancelled" | "disputed",
      createdAt: string
    }>
  }
}
```

**PATCH /cluster/orders/:orderId**

The cluster farmer updates the status of an order as they process and ship it.

```typescript
// Request body
{
  status: "confirmed" | "processing" | "shipped" | "delivered" | "cancelled",
  notes: string    // Optional notes about the status update
}

// Response
{
  status: "success",
  message: "Order updated successfully.",
  data: {
    order: { /* updated order object */ }
  }
}
```

---

## Demands

These endpoints are not yet implemented on the backend. The frontend is fully built and wired. Once these endpoints exist, the cluster demands page will work automatically.

**GET /cluster/demands**

Returns all demands assigned to this cluster farmer by admin.

```typescript
// Response
{
  status: "success",
  data: {
    demands: Array<{
      id: string,
      buyerName: string,
      buyerPhone: string,
      fishType: "catfish" | "fingerlings" | "juveniles" | "table_size" | "jumbo" | "parent_stocks",
      weightKg: number,
      fishVariant: "dried" | "jumbo" | "table_size" | "broodstock",
      locationState: string,
      locationLga: string,
      deliveryAddress: string,
      notes: string | null,
      status: "pending" | "assigned" | "accepted" | "declined" | "fulfilled" | "cancelled",
      assignedAt: string | null,
      acceptedAt: string | null,
      fulfilledAt: string | null,
      createdAt: string
    }>
  }
}
```

**PATCH /cluster/demands/:id/accept**

The cluster farmer accepts a demand. This sets status to "accepted" and records the accepted timestamp.

```typescript
// No request body required

// Response
{
  status: "success",
  message: "Demand accepted.",
  data: {
    demand: {
      id: string,
      status: "accepted",
      acceptedAt: string
    }
  }
}
```

**PATCH /cluster/demands/:id/decline**

The cluster farmer declines a demand with an optional reason.

```typescript
// Request body
{
  reason: string    // Optional
}

// Response
{
  status: "success",
  message: "Demand declined.",
  data: {
    demand: {
      id: string,
      status: "declined"
    }
  }
}
```

**PATCH /cluster/demands/:id/fulfill**

The cluster farmer marks a demand as fulfilled after delivery.

```typescript
// No request body required

// Response
{
  status: "success",
  message: "Demand marked as fulfilled.",
  data: {
    demand: {
      id: string,
      status: "fulfilled",
      fulfilledAt: string
    }
  }
}
```

---

## Payouts

Returns payout history for the cluster farmer.

**GET /cluster/payouts**

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
      status: "pending" | "processing" | "paid" | "failed"
    }>
  }
}
```
