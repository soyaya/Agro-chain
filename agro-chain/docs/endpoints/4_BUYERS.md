# ENDPOINTS

## Buyers routes

Buyer role should be "`buyer`";

1. **Buyer Profile**: Update buyer account profile information
   - `/buyers/account-profile`: PATCH

```typescript
interface {
  id: string;
  userId: string;
  profileImage?: File;
  fullName: string;
  companyName?: string;
  phoneNumber: string;
  email: string;
  deliveryAddress: string;
  localGovernment: string;
  state: string;
  businessType: string;
  createdAt: Date;
  updatedAt: Date;
}
```

2. **Create Order**: Buyer places order for marketplace listings
   - `/buyers/orders`: POST

```typescript
type FishType = "Catfish";
type FishVariant = "Dried" | "Jumbo" | "Table Size" | "Broodstock";
type DeliveryType = "pickup" | "delivery";
```

```typescript
interface {
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  deliveryFee?: number;
  items: {
    listingId: string;
    fishType: FishType;
    variant: FishVariant;
    processed: boolean;
    weightKg: number;
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
  }[];
  totalAmount: number;
}
```

3. **Orders**: View orders and tracking history
   - `/buyers/orders`: GET
   - `/buyers/orders/:orderId`: GET

```typescript
type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
```

```typescript
interface {
  orderId: string;
  clusterFarmerName: string;
  deliveryOption: string;
  status: OrderStatus;
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: Date;
  updatedAt: Date;
}
```

4. **Order Tracking**: Track the status of delivery milestones
   - `/buyers/orders/:orderId/tracking`: GET

```typescript
interface {
  status: OrderStatus;
  message: string;
  createdAt: Date;
}
```

5. **Confirm Delivery**: Buyer confirms delivery is received in good condition
   - `/buyers/orders/:orderId/confirm-delivery`: PATCH

```typescript
interface {
  payoutDelay: "30 seconds" | "5 minutes" | "30 minutes" | "1 hour" | "6 hours" | "12 hours" | "24 hours";
  confirmedAt: Date;
}
```

6. **Payments**: Initialize payment for an order
   - `/buyers/orders/:orderId/pay`: POST

```typescript
interface {
  paymentMethod: "card" | "bank-transfer";
  amount: number;
  deliveryFee?: number;
}
```
