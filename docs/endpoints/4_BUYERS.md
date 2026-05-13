# Buyer Endpoints

All buyer endpoints require authentication. The authenticated user must have `role: "buyer"`.

---

## Update Profile

The buyer updates their account information. All fields are optional.

**PATCH /buyers/account-profile**

```typescript
// Request body — all fields optional
{
  fullName: string,
  companyName: string,
  phoneNumber: string,
  email: string,
  profileImage: string,      // Cloudinary URL
  deliveryAddress: string,
  localGovernment: string,
  state: string,
  businessType: string
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
      companyName: string | null,
      phoneNumber: string,
      email: string,
      deliveryAddress: string,
      localGovernment: string,
      state: string,
      businessType: string | null,
      createdAt: string,
      updatedAt: string
    }
  }
}
```

---

## Create Order

The buyer places an order directly from a marketplace listing. The order starts in "payment_pending" status and requires payment before it is confirmed.

**POST /buyers/orders**

```typescript
// Request body
{
  deliveryType: "pickup" | "delivery",
  deliveryAddress: string,    // Required when deliveryType is "delivery"
  deliveryFee: number,        // 0 for pickup
  totalAmount: number,
  items: Array<{
    listingId: string,
    fishType: string,
    variant: "Dried" | "Jumbo" | "Table Size" | "Broodstock",
    processed: boolean,
    weightKg: number,
    quantity: number,
    pricePerUnit: number,
    totalPrice: number
  }>
}

// Response
{
  status: "success",
  message: "Order placed successfully.",
  data: {
    order: { /* full order object from database */ }
  }
}
```

---

## Get Orders

Returns all orders placed by the buyer.

**GET /buyers/orders**

```typescript
// Response
{
  status: "success",
  data: {
    orders: Array<{
      orderId: string,
      orderNumber: string,
      clusterFarmerName: string,
      deliveryOption: string | null,
      status: "draft" | "payment_pending" | "paid" | "confirmed" | "processing" | "shipped" | "delivered" | "completed" | "cancelled" | "disputed",
      payment_status: "pending" | "paid" | "refunded" | "failed",
      createdAt: string,
      updatedAt: string
    }>
  }
}
```

---

## Get Order Detail

Returns full details of a single order including cluster farmer contact and listing info.

**GET /buyers/orders/:orderId**

```typescript
// Response
{
  status: "success",
  data: {
    order: {
      id: string,
      order_number: string,
      delivery_type: string,
      delivery_address: string,
      status: string,
      payment_status: string,
      total_amount: number,
      delivery_fee: number,
      grand_total: number,
      created_at: string,
      clusterFarmer: {
        full_name: string,
        phone_number: string
      } | null,
      listing: {
        fish_type: string,
        packaging_weight_kg: number
      } | null
    }
  }
}
```

---

## Order Tracking

Returns the full tracking history for an order as a timeline of status changes.

**GET /buyers/orders/:orderId/tracking**

```typescript
// Response
{
  status: "success",
  data: {
    tracking: Array<{
      status: string,
      message: string,
      createdAt: string
    }>
  }
}
```

---

## Confirm Delivery

The buyer confirms they have received the order in good condition. This triggers the payout to the cluster farmer after the selected delay window.

**PATCH /buyers/orders/:orderId/confirm-delivery**

```typescript
// Request body
{
  payoutDelay: "30 seconds" | "5 minutes" | "30 minutes" | "1 hour" | "6 hours" | "12 hours" | "24 hours",
  confirmedAt: string    // ISO timestamp, optional, defaults to now
}

// Response
{
  status: "success",
  message: "Delivery confirmed successfully.",
  data: {
    scheduledPayoutAt: string    // ISO timestamp when payout will be released
  }
}
```

---

## Initiate Payment

Initializes a Paystack payment for an order. Returns a redirect URL that the frontend opens for the buyer to complete payment.

**POST /buyers/orders/:orderId/pay**

```typescript
// Request body
{
  paymentMethod: "card" | "bank-transfer",
  amount: number    // Amount in Naira
}

// Response
{
  status: "success",
  message: "Payment initialized.",
  data: {
    transactionReference: string,
    authorizationUrl: string,    // Paystack checkout URL — redirect buyer here
    amount: number
  }
}
```

---

## Payment Verification

Called by the frontend after Paystack redirects back. Verifies the payment with Paystack and updates the order status to "confirmed".

**GET /buyers/payments/verify?reference=TXN-xxx**

```typescript
// Query param
reference: string    // The transaction reference from Paystack callback

// Response
{
  status: "success",
  message: "Payment verified successfully.",
  data: {
    orderId: string,
    orderStatus: "confirmed",
    paymentStatus: "paid"
  }
}
```

---

## Demands

These endpoints are not yet implemented on the backend. The frontend is fully built and wired. Once these endpoints exist, the buyer demands page will work automatically.

**POST /buyers/demands**

The buyer creates a custom demand for a specific quantity of fish. There is no minimum weight — the buyer can request any amount including less than 1kg.

```typescript
// Request body
{
  fishType: "catfish" | "fingerlings" | "juveniles" | "table_size" | "jumbo" | "parent_stocks",
  weightKg: number,      // Any positive decimal, e.g. 0.5 for half a kg
  fishVariant: "dried" | "jumbo" | "table_size" | "broodstock",
  locationState: string,
  locationLga: string,
  deliveryAddress: string,
  notes: string          // Optional
}

// Response
{
  status: "success",
  message: "Demand submitted. Admin will assign a cluster farmer shortly.",
  data: {
    demand: {
      id: string,
      status: "pending",
      createdAt: string
    }
  }
}
```

**GET /buyers/demands**

Returns all demands created by the buyer.

```typescript
// Response
{
  status: "success",
  data: {
    demands: Array<{
      id: string,
      fishType: string,
      weightKg: number,
      fishVariant: string,
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

**DELETE /buyers/demands/:id**

The buyer cancels a pending demand. Only demands with status "pending" can be cancelled.

```typescript
// No request body

// Response
{
  status: "success",
  message: "Demand cancelled."
}
```
