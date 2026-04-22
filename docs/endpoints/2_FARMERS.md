# ENDPOINTS

## Farmers routes

Farmer&apos; role should be "`farmer`";

1. **Create Listings**: This should enable the farmers to create listings
   - `/farmers/listings/create`: POST

```typescript
type FishType = "Catfish";
```

```typescript
interface Packaging {
  weightKg: number;
  quantity: number;
}
```

```typescript
interface {
 fishType: FishType;
 harvestDate: Date;
 listedDate: Date;
  totalFishAvailable: number; // Like 200ks available
  packaging: Packaging;
  isApproved: false; // I will set this by default. The farmer will not see this field.
}
```

2. **Listings**: This should fetch information about a particular farmers listings
 - `/farmers/listings/get`: GET

```typescript
type Status = "approved" | "pending" | "rejected";
```

```typescript
interface {
 totalListings: number;
 pendingApproval: number;
 approved: number;
 rejected: number;
 totalSupply: number;

 totalFishAvailable: number; // Like 200ks available
 harvestDate: Date;
 listedDate: Date;
  packaging: Packaging;
}
```

3. **Recent Activity**: This should fetch information/logs about a particular farmers activity
   - `/farmers/recent-activities`: GET

```typescript
type Status = "approved" | "pending" | "rejected";
```

```typescript
interface {
 supply: number;
 status: Status;
 approved: number;
 totalSupply: number;
}
```

I should be able to render something like

- Listing "Catfish 500kg" was approved
- Listing "Catfish 500kg" is pending approval
- Profile updated successfully

NOTE!!!
Help me auto-complete this one

4. **Farmers Profile**: The farmer should be able to update the information in ther profile
   - `/farmers/account-profile`: PATCH

```typescript
type FishType = "Catfish";
```

```typescript
interface {
  id: string;
  userId: string;
 profileImage: File | undefined;
 fullName: string;
 phoneNumber: number;
 email: string;
 farmName: string;
 farmAddress: string;

 localGovernment: string;
 state: string;
 fishType: FishType;
 farmingCapacityKg: number;
 yearsOfExperience: number;
 isClusterFarmer?: boolean; // This could come in handy or so I think
   createdAt: Date,
  updatedAt: Date,
}
```

5. **Cluster Farmer Applicatione**: The farmer should be able to update their cluster farmer&apos;s application:
   - `/farmers/cluster-farmer-application`: PATCH

```typescript
type ClusterFarmerDocuments = {
  bvnVerification: File | null;
  proofOfAddress: File | null;
  cacRegistration: File | null;
  businessLicense: File | null;
  taxClearance: File | null;
};
```

```typescript
interface {
  businessName: string,
  cacNumber: string,
  warehouseLocation: string,
  distributionCapacity: number,
  logisticsAvailable: false,
  bvnVerification: File | null,
  proofOfAddress: File | null,
  cacRegistration: File | null,
  businessLicense: File | null,
  taxClearance: File | null,
}
```

NOTE: Additionally, I can also make them update this say they can every 6 months from the time they last updated it.

6. **Orders (Read Only)**: Farmers can view orders tied to their listings
   - `/farmers/orders`: GET

```typescript
type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
```

```typescript
interface {
  orderId: string;
  listingId: string;
  buyerName: string;
  quantity: number;
  weightKg: number;
  status: OrderStatus;
  createdAt: Date;
}
```

7. **Payouts**: Farmers can view payout schedule and history
   - `/farmers/payouts`: GET

```typescript
interface {
  payoutId: string;
  orderId: string;
  amount: number;
  scheduledFor: Date;
  status: "pending" | "processing" | "paid" | "failed";
  createdAt: Date;
}
```

<!-- Financial Services will have to come later. We can focus on the MVP for now -->
