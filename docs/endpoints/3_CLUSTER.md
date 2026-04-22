# ENDPOINTS

## Cluster Farmers routes

Cluster Farmer&apos; role should be "`cluster`";

1. **Cluster Farmers Profile**: The cluster farmer should be able to update the information in ther profile
   - `/cluster/account-profile`: PATCH

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

  businessName: string;
  cacNumber: string;
  warehouseLocation: string; // Shop Locations
  distributionCapacity: number;
  logisticsAvailable: boolean;

  isClusterFarmer?: boolean;
  verificationStatus: boolean; // This could be useful incase we want to revoke the status of a cluster farmer whether they will remain one or not
  createdAt: Date;
  updatedAt: Date;
}
```

2. **Listings**: This should fetch information about a particular cluster farmers listings
   - `/cluster/listings/get`: GET

```typescript
type Status = "approved" | "pending" | "rejected";

interface Packaging {
  weightKg: number;
  quantity: number;
}
```

```typescript
interface {
  farmersUnderMe: number;
 pendingApproval: number; // Listings to either approve or reject
 allListings: number; // All listings ever approved or rejected
  totalSupply: number;

  // === These 2 fields may inform us, maybe later of some stats if we have to know the rate at which a cluster farmer is approving or rejecting listings and whatever decisions have to be made with that
 status: Status;


  totalListings: number;

 totalFishAvailable: number; // Like 200ks available
 location: string; // This will be the location of the farmer that posted the listing
 harvestDate: Date;
 listedDate: Date;
  packaging: Packaging;
}
```

3. **Recent Activity**: This should fetch information/logs about a particular farmers activity
   - `/cluster/current-activities`: GET

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

There's a number of things they can do on their dashboard which is limited to approvals, profile, listings and farmers, they should receive notifications about some activities done by the farmers under them like:

- I should be able to display changes like Approved listings from John Doe - Catfish 500kg
- New listing pending approval from Jane Smith
- New farmer joined your cluster - Mike Johnson
- Jane Doe updated their profile

4. **Pending Approval**: This is where the farmer approves the listings of the farmers under them. The farmers under them submits listings and they submit the form. It appears here as a card with a choice for the cluster farmer to reject or approve.
   In retrospect, it's actually better I fetch the lsitings, and just approve it for the marketplace here and not submit the whole thing again.
   So, I'll fetch the listings then, and append approve to it.
   The backend will now watch for an approved lsitings before going to the marketplace.

   - `/cluster/pending-approvals`: GET

```typescript
type Status = "approved" | "pending" | "rejected";

type FishType = "Catfish";

interface Packaging {
  weightKg: number;
  quantity: number;
}

interface {
 fishType: FishType;
 farmerName: string;
  harvestDate: Date;
 listedDate: Date;
  totalFishAvailable: number; // Like 200kgs available
  packaging: Packaging;
  createdAt: Date;
  updatedAt: Date;
}
```

 - `/cluster/pending-approvals/:listingId`: PATCH
```typescript
type Status = "approved" | "pending" | "rejected";

type FishType = "Catfish";

interface Packaging {
  weightKg: number;
  quantity: number;
}

interface {
 fishType: FishType;
 farmerName: string;
  harvestDate: Date;
 listedDate: Date;
  totalFishAvailable: number; // Like 200kgs available
  packaging: Packaging;
  createdAt: Date;
  updatedAt: Date;
  status: Status;
  rejectionReason?: string;
}
```

5. **Farmers**: This is where the cluster farmer sees the farmers under them

   - `/cluster/farmers`: GET
```typescript
type Status = "approved" | "pending" | "rejected";

type FishType = "Catfish";

interface Packaging {
  weightKg: number;
  quantity: number;
}

interface {
  totalFarmers: number;
  totalFarmersCapacity: number; // This should be the Sigma of all the totalCapacity of the farmers under the cluster farmer;
  locationCovering: number; // Depending on how its structured if its by lgas, city's or states, how many is this one covering?

  farmerName: string;
 fishType: FishType;
 totalListings: number;
 totalApprovedListings: number;
 totalPendingListings: number;

 farmName: string;
 location: string;
 phoneNumber: number;
 emailAddress: string;
 capacity: number;
 experience: number;
 memberSince: Date;
 lastActive: Date;
}
```

6. **Orders**: Manage incoming buyer orders for the cluster farmer
   - `/cluster/orders`: GET

```typescript
type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
```

```typescript
interface {
  orderId: string;
  buyerName: string;
  buyerPhone: string;
  fishType: "Catfish";
  variant: "Dried" | "Jumbo" | "Table Size" | "Broodstock";
  processed: boolean;
  weightKg: number;
  quantity: number;
  deliveryOption: string;
  status: OrderStatus;
  createdAt: Date;
}
```

   - `/cluster/orders/:orderId`: PATCH

```typescript
interface {
  status: OrderStatus;
  notes?: string;
}
```

7. **Payouts**: View upcoming payouts after buyer confirmation
   - `/cluster/payouts`: GET

```typescript
interface {
  payoutId: string;
  orderId: string;
  amount: number;
  scheduledFor: Date;
  status: "pending" | "processing" | "paid" | "failed";
}
```
