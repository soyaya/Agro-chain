# Marketplace Endpoints

Marketplace listing endpoints are public (no authentication required). Cart and checkout endpoints require authentication.

---

## Get All Listings

Returns all active, cluster-approved, non-expired listings. Supports filtering and pagination.

`pricePerUnit` in the packaging array is backend-computed as `weightKg * pricePerKg[fishType]` using the platform settings set by the admin. It is never farmer-supplied.

**GET /marketplace**

```typescript
// Query params — all optional
{
  fishType: string,     // e.g. "catfish"
  state: string,        // e.g. "Kaduna"
  lga: string,          // e.g. "Kaduna South"
  minPrice: number,
  maxPrice: number,
  page: number,         // Default 1
  limit: number         // Default 20
}

// Response
{
  status: "success",
  data: {
    listings: Array<{
      id: string,
      clusterFarmerId: string | null,
      clusterFarmerName: string,
      clusterFarmerContact: string | null,
      businessName: string | null,
      warehouseLocation: string | null,
      logisticsAvailable: boolean,
      fishType: string,
      harvestDate: string,
      totalAvailableKg: number,
      packaging: Array<{
        weightKg: number,
        quantity: number,
        pricePerUnit: number    // Backend-computed: weightKg * pricePerKg[fishType]
      }>,
      location: string,
      state: string,
      localGovernment: string,
      pricePerKg: number,       // Platform price for this fish type from admin settings
      deliveryOptions: Array<"pickup" | "delivery">,
      visibleOnMarketplace: boolean,
      status: "approved",
      createdAt: string,
      updatedAt: string
    }>,
    pagination: {
      total: number,
      page: number,
      limit: number,
      totalPages: number
    }
  }
}
```

---

## Get Single Listing

Returns full details of a single marketplace listing including images.

**GET /marketplace/:listingId**

```typescript
// Response
{
  status: "success",
  data: {
    listing: {
      id: string,
      clusterFarmerId: string | null,
      clusterFarmerName: string,
      clusterFarmerContact: string | null,
      businessName: string | null,
      warehouseLocation: string | null,
      logisticsAvailable: boolean,
      fishType: string,
      harvestDate: string,
      totalAvailableKg: number,
      packaging: Array<{
        weightKg: number,
        quantity: number,
        pricePerUnit: number    // Backend-computed: weightKg * pricePerKg[fishType]
      }>,
      location: string,
      state: string,
      localGovernment: string,
      pricePerKg: number,       // Platform price for this fish type from admin settings
      deliveryOptions: Array<"pickup" | "delivery">,
      images: Array<{
        id: string,
        image_url: string,
        is_primary: boolean,
        sort_order: number
      }>,
      visibleOnMarketplace: boolean,
      status: "approved",
      createdAt: string,
      updatedAt: string
    }
  }
}
```

---

## Get Cart

Returns the current buyer's cart with all items. Requires authentication.

**GET /marketplace/cart**

```typescript
// Response
{
  status: "success",
  data: {
    cartId: string,
    items: Array<{
      cartItemId: string,
      listingId: string,
      fishType: string,
      variant: "dried" | "jumbo" | "table_size" | "broodstock",
      processed: boolean,
      weightKg: number,
      quantity: number,
      pricePerUnit: number,   // Snapshotted at time of cart addition
      totalPrice: number
    }>,
    cartTotal: number
  }
}
```

---

## Add to Cart

Adds a listing item to the buyer's cart. Requires authentication.

`pricePerUnit` here is read from the listing's packaging array (backend-computed) and passed through as a price snapshot. It is not user input.

**POST /marketplace/cart**

```typescript
// Request body
{
  listingId: string,
  variant: "Dried" | "Jumbo" | "Table Size" | "Broodstock",
  processed: boolean,
  weightKg: number,
  quantity: number,
  pricePerUnit: number    // Read from listing.packaging[n].pricePerUnit — price snapshot
}

// Response
{
  status: "success",
  message: "Item added to cart.",
  data: {
    cartItemId: string,
    listingId: string,
    variant: string,
    weightKg: number,
    quantity: number,
    pricePerUnit: number,
    totalPrice: number
  }
}
```

Note: The frontend expects `cartItemId` in the response. The backend currently returns `id` in some cases. Make sure the response always uses `cartItemId` as the field name.

---

## Update Cart Item

Updates the quantity or weight of an existing cart item. Requires authentication.

**PATCH /marketplace/cart/:cartItemId**

```typescript
// Request body — all fields optional
{
  quantity: number,
  weightKg: number
}

// Response
{
  status: "success",
  message: "Cart item updated.",
  data: {
    item: { /* updated cart item */ }
  }
}
```

---

## Remove Cart Item

Removes an item from the cart. Requires authentication.

**DELETE /marketplace/cart/:cartItemId**

```typescript
// No request body

// Response
{
  status: "success",
  message: "Item removed from cart."
}
```

---

## Checkout

Creates an order from selected cart items and removes them from the cart. Requires authentication. The order starts in "payment_pending" status.

**POST /marketplace/checkout**

```typescript
// Request body
{
  deliveryType: "pickup" | "delivery",
  deliveryAddress: string,    // Required when deliveryType is "delivery"
  deliveryFee: number,
  totalAmount: number,
  cartItems: Array<{
    cartItemId: string,
    quantity: number
  }>
}

// Response
{
  status: "success",
  message: "Order created successfully. Proceed to payment.",
  data: {
    order: { /* full order object */ }
  }
}
```
