# ENDPOINTS

## Marketplace routes

Marketplace routes support browsing listings, managing cart items, and checkout.

1. **Marketplace Listings**
   - `/marketplace`: GET
   - `/marketplace/:listingId`: GET

```typescript
type FishType = "Catfish";

interface Packaging {
  weightKg: number;
  quantity: number;
  pricePerUnit: number;
}

interface {
  id: string;
  clusterFarmerId: string;
  clusterFarmerName: string;
  businessName: string;
  fishType: FishType;
  harvestDate: Date;
  totalAvailableKg: number;
  packaging: Packaging[];
  location: string;
  state: string;
  localGovernment: string;
  pricePerKg: number;
  deliveryOptions: string[];
  visibleOnMarketplace: boolean;
  status: "approved";
  createdAt: Date;
  updatedAt: Date;
}
```

2. **Cart**
   - `/marketplace/cart`: GET
   - `/marketplace/cart`: POST
   - `/marketplace/cart/:cartItemId`: PATCH
   - `/marketplace/cart/:cartItemId`: DELETE

```typescript
type FishVariant = "Dried" | "Jumbo" | "Table Size" | "Broodstock";
```

```typescript
interface {
  cartItemId: string;
  listingId: string;
  fishType: "Catfish";
  variant: FishVariant;
  processed: boolean;
  weightKg: number;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}
```

3. **Checkout**
   - `/marketplace/checkout`: POST

```typescript
interface {
  deliveryType: "pickup" | "delivery";
  deliveryAddress?: string;
  deliveryFee?: number;
  totalAmount: number;
  cartItems: {
    cartItemId: string;
    quantity: number;
  }[];
}
```
