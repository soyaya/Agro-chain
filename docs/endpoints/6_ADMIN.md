# Admin Endpoints

All admin endpoints require authentication and the user must have `role: "admin"`. The backend enforces this via the `requireAdmin` middleware on all `/admin/*` routes.

---

## Dashboard Metrics

Returns platform-wide summary numbers used to populate the stat cards on the admin dashboard home page.

**GET /admin/dashboard/metrics**

```typescript
// Response
{
  status: "success",
  data: {
    metrics: {
      totalUsers: number,
      newUsersToday: number,
      activeListings: number,
      ordersToday: number,
      transactionVolume: number,
      platformRevenue: number
    }
  }
}
```

Status: Implemented. Working correctly.

---

## Dashboard Charts

Returns data for the orders-by-status bar chart and the popular fish types chart on the admin dashboard.

**GET /admin/dashboard/charts**

```typescript
// Response
{
  status: "success",
  data: {
    charts: {
      ordersByStatus: Array<{
        status: string,
        _count: { id: number }
      }>,
      popularFishTypes: Array<{
        fish_type: string,
        _count: { id: number }
      }>
    }
  }
}
```

Status: Implemented. Working correctly.

---

## Dashboard Recent Activities

Returns the 5 most recent user registrations and 5 most recent orders for the activity feed on the admin dashboard.

**GET /admin/dashboard/activities**

```typescript
// Response
{
  status: "success",
  data: {
    recentActivities: {
      newRegistrations: Array<{
        id: string,
        full_name: string,
        role: string,
        created_at: string
      }>,
      newOrders: Array<{
        id: string,
        status: string,
        created_at: string,
        buyer: { full_name: string } | null,
        farmer: { full_name: string } | null
      }>
    }
  }
}
```

Status: Implemented. Working correctly.

---

## Cluster Farmer Applications

Returns all pending cluster farmer applications. These are users who have set `is_cluster_farmer: true` but have not yet been approved (`cluster_approved: false`).

**GET /admin/cluster-applications**

The current backend response only returns basic user fields. The admin applications page needs to show the uploaded document URLs so the admin can review them before approving. The backend query needs to include these additional fields.

```typescript
// Response — current backend returns only basic fields
// The following is what the frontend needs
{
  status: "success",
  data: {
    applications: Array<{
      id: string,
      full_name: string,
      phone_number: string,
      email: string,
      location_state: string,
      location_lga: string,
      business_name: string | null,
      cac_number: string | null,
      warehouse_location: string | null,
      distribution_capacity: number | null,
      logistics_available: boolean,
      bvn_doc_url: string | null,           // URL to BVN document on Cloudinary
      proof_of_address_url: string | null,  // URL to proof of address
      cac_registration_url: string | null,  // URL to CAC certificate
      business_license_url: string | null,  // URL to business license
      tax_clearance_url: string | null,     // URL to tax clearance
      cluster_application_updated_at: string | null,
      created_at: string
    }>
  }
}
```

Status: Partially implemented. The endpoint exists and returns basic fields. The document URL fields and business fields need to be added to the Prisma select in the controller.

---

## Approve Cluster Application

Approves a cluster farmer application. This updates the user's role from "farmer" to "cluster", sets `cluster_approved: true`, records the approving admin, and automatically assigns nearby farmers in the same state and LGA to this new cluster farmer.

**PUT /admin/cluster-applications/:id/approve**

```typescript
// No request body required

// Response
{
  status: "success",
  message: "Cluster Farmer approved successfully. Nearby farmers have been assigned to them.",
  data: {
    user: { /* updated user object */ }
  }
}
```

Status: Implemented. Working correctly.

---

## Reject Cluster Application

Rejects a cluster farmer application. Resets `is_cluster_farmer` to false and `cluster_approved` to false.

**PUT /admin/cluster-applications/:id/reject**

```typescript
// No request body required

// Response
{
  status: "success",
  message: "Cluster Farmer application rejected.",
  data: {
    user: { /* updated user object */ }
  }
}
```

Status: Implemented. Working correctly.

---

## Get All Users

Returns all platform users with optional filters. Used by the admin farmers/users management page. The frontend filters by role, state, and verification status and also supports text search on the client side.

**GET /admin/farmers**

```typescript
// Query params — all optional
{
  role: "farmer" | "cluster" | "buyer" | "admin",
  state: string,
  verificationStatus: "unverified" | "pending" | "verified" | "rejected"
}

// Response
{
  status: "success",
  data: {
    users: Array<{
      id: string,
      full_name: string,
      email: string | null,
      phone_number: string,
      role: "farmer" | "cluster" | "buyer" | "admin" | "pending",
      verification_status: "unverified" | "pending" | "verified" | "rejected",
      location_state: string,
      location_lga: string,
      is_active: boolean,
      is_cluster_farmer: boolean,
      cluster_approved: boolean,
      farm_name: string | null,
      business_name: string | null,
      created_at: string
    }>,
    total: number
  }
}
```

Status: Not implemented. Needs to be created.

---

## Get Single User

Returns the full profile of a single user. Used in the admin user detail slide-over panel.

**GET /admin/farmers/:id**

```typescript
// Response
{
  status: "success",
  data: {
    user: {
      id: string,
      full_name: string,
      email: string | null,
      phone_number: string,
      role: string,
      verification_status: string,
      location_state: string,
      location_lga: string,
      location_address: string,
      is_active: boolean,
      is_cluster_farmer: boolean,
      cluster_approved: boolean,
      farm_name: string | null,
      business_name: string | null,
      cac_number: string | null,
      warehouse_location: string | null,
      distribution_capacity: number | null,
      logistics_available: boolean,
      farming_capacity_kg: number | null,
      years_of_experience: number | null,
      profile_photo_url: string | null,
      created_at: string,
      updated_at: string
    }
  }
}
```

Status: Not implemented. Needs to be created.

---

## Toggle User Active Status

Toggles the `is_active` field on a user account. If the account is currently active, it becomes inactive and the user cannot log in. If inactive, it becomes active again.

**PATCH /admin/farmers/:id/toggle-active**

```typescript
// No request body required

// Response
{
  status: "success",
  message: "Account deactivated successfully." | "Account activated successfully.",
  data: {
    is_active: boolean
  }
}
```

Status: Not implemented. Needs to be created.

---

## Get All Listings

Returns all platform listings with optional filters. Used by the admin listing oversight page.

**GET /admin/listings**

```typescript
// Query params — all optional
{
  status: "active" | "sold" | "flagged" | "expired" | "draft" | "archived" | "deleted",
  fishType: string,
  state: string
}

// Response
{
  status: "success",
  data: {
    listings: Array<{
      id: string,
      fishType: string,
      quantityAvailable: number,
      totalAvailableKg: number,
      pricePerKg: number,
      clusterFarmerName: string,
      locationState: string,
      locationLga: string,
      status: string,
      clusterApproved: boolean,
      createdAt: string
    }>,
    total: number
  }
}
```

Status: Not implemented. Needs to be created.

---

## Flag Listing

Sets a listing's status to "flagged". Flagged listings are hidden from the marketplace and buyers cannot order from them.

**PATCH /admin/listings/:id/flag**

```typescript
// No request body required

// Response
{
  status: "success",
  message: "Listing flagged successfully."
}
```

Status: Not implemented. Needs to be created.

---

## Remove Listing

Soft-deletes a listing by setting its status to "deleted". The record stays in the database but is no longer visible anywhere.

**DELETE /admin/listings/:id**

```typescript
// No request body required

// Response
{
  status: "success",
  message: "Listing removed successfully."
}
```

Status: Not implemented. Needs to be created.

---

## Get All Orders

Returns all platform orders with optional filters. Used by the admin order management page. The frontend filters by status and order type (direct marketplace order vs demand-based order).

**GET /admin/orders**

```typescript
// Query params — all optional
{
  status: "draft" | "payment_pending" | "paid" | "confirmed" | "processing" | "shipped" | "delivered" | "completed" | "cancelled" | "disputed",
  paymentStatus: "pending" | "paid" | "refunded" | "failed"
}

// Response
{
  status: "success",
  data: {
    orders: Array<{
      id: string,
      orderNumber: string,
      buyerName: string,
      clusterFarmerName: string,
      totalAmount: number,
      grandTotal: number,
      status: string,
      paymentStatus: string,
      orderType: "direct" | "demand",
      createdAt: string
    }>
  }
}
```

Status: Not implemented. Needs to be created.

Note: The `orderType` field distinguishes between orders placed directly from the marketplace and orders created from a buyer demand. The backend needs to track this distinction, either via a field on the Order model or by checking whether the order has a linked demand record.

---

## Get Single Order

Returns full detail of a single order. Used when the admin clicks into an order row.

**GET /admin/orders/:id**

```typescript
// Response
{
  status: "success",
  data: {
    order: {
      id: string,
      orderNumber: string,
      buyerName: string,
      buyerPhone: string,
      clusterFarmerName: string,
      clusterFarmerPhone: string,
      totalAmount: number,
      grandTotal: number,
      deliveryFee: number,
      deliveryType: string,
      deliveryAddress: string,
      status: string,
      paymentStatus: string,
      orderType: "direct" | "demand",
      items: Array<{
        fishType: string,
        variant: string,
        weightKg: number,
        quantity: number,
        pricePerUnit: number,
        totalPrice: number
      }>,
      tracking: Array<{
        status: string,
        message: string,
        createdAt: string
      }>,
      createdAt: string,
      updatedAt: string
    }
  }
}
```

Status: Not implemented. Needs to be created.

---

## Get All Demands

Returns all buyer demands with optional filters. Used by the admin demand management page. The admin reviews pending demands and assigns them to available cluster farmers.

**GET /admin/demands**

```typescript
// Query params — all optional
{
  status: "pending" | "assigned" | "accepted" | "declined" | "fulfilled" | "cancelled",
  state: string    // Filter by buyer's location state to find nearby cluster farmers
}

// Response
{
  status: "success",
  data: {
    demands: Array<{
      id: string,
      buyerName: string,
      buyerPhone: string,
      fishType: string,
      weightKg: number,
      fishVariant: string,
      locationState: string,
      locationLga: string,
      deliveryAddress: string,
      notes: string | null,
      status: "pending" | "assigned" | "accepted" | "declined" | "fulfilled" | "cancelled",
      assignedClusterFarmerName: string | null,
      assignedAt: string | null,
      createdAt: string
    }>
  }
}
```

Status: Not implemented. Needs to be created.

---

## Get Single Demand

Returns full detail of a single demand.

**GET /admin/demands/:id**

```typescript
// Response
{
  status: "success",
  data: {
    demand: {
      id: string,
      buyerName: string,
      buyerPhone: string,
      fishType: string,
      weightKg: number,
      fishVariant: string,
      locationState: string,
      locationLga: string,
      deliveryAddress: string,
      notes: string | null,
      status: string,
      assignedClusterFarmerName: string | null,
      assignedAt: string | null,
      acceptedAt: string | null,
      fulfilledAt: string | null,
      createdAt: string
    }
  }
}
```

Status: Not implemented. Needs to be created.

---

## Assign Demand to Cluster Farmer

The admin assigns a pending demand to a specific cluster farmer. This sets the demand status to "assigned" and notifies the cluster farmer. The cluster farmer then sees it in their demands page and can accept or decline.

**PATCH /admin/demands/:id/assign**

```typescript
// Request body
{
  cluster_farmer_id: string    // UUID of the cluster farmer to assign
}

// Response
{
  status: "success",
  message: "Demand assigned to cluster farmer.",
  data: {
    demand: {
      id: string,
      status: "assigned",
      assigned_cluster_farmer_id: string,
      assignedAt: string
    }
  }
}
```

Status: Not implemented. Needs to be created.

---

## Get Cluster Farmers for Assignment

Returns all users with `role: "cluster"` for the assign demand modal. The frontend filters this list by state to show cluster farmers in the same area as the demand.

**GET /admin/farmers?role=cluster**

This uses the same `/admin/farmers` endpoint with a role filter. See the Get All Users section above for the full response shape.

Status: Not implemented. Depends on the Get All Users endpoint being created first.

---

## Summary of What Needs to Be Built

| Endpoint                                | Method | Status                                                      |
| --------------------------------------- | ------ | ----------------------------------------------------------- |
| /admin/dashboard/metrics                | GET    | Implemented                                                 |
| /admin/dashboard/charts                 | GET    | Implemented                                                 |
| /admin/dashboard/activities             | GET    | Implemented                                                 |
| /admin/cluster-applications             | GET    | Implemented but needs document URL fields added to response |
| /admin/cluster-applications/:id/approve | PUT    | Implemented                                                 |
| /admin/cluster-applications/:id/reject  | PUT    | Implemented                                                 |
| /admin/farmers                          | GET    | Not implemented                                             |
| /admin/farmers/:id                      | GET    | Not implemented                                             |
| /admin/farmers/:id/toggle-active        | PATCH  | Not implemented                                             |
| /admin/listings                         | GET    | Not implemented                                             |
| /admin/listings/:id/flag                | PATCH  | Not implemented                                             |
| /admin/listings/:id                     | DELETE | Not implemented                                             |
| /admin/orders                           | GET    | Not implemented                                             |
| /admin/orders/:id                       | GET    | Not implemented                                             |
| /admin/demands                          | GET    | Not implemented                                             |
| /admin/demands/:id                      | GET    | Not implemented                                             |
| /admin/demands/:id/assign               | PATCH  | Not implemented                                             |
