# AgroChainMarketPlace Type System

Complete TypeScript type definitions for the AgroChainMarketPlace platform.

## Overview

This directory contains all type definitions following strict TypeScript rules:
- **NO `any` types**
- **NO unsafe casting**
- All interfaces and types are strongly typed
- Centralized for consistency across the platform

## Files

### `index.ts`
Main type definitions file containing all interfaces and types.

### `constants.ts`
Platform constants, enums, and configuration values.

### `types.ts` (legacy)
Original types file - will be migrated to use new type system.

## Type Categories

### 1. User & Authentication
```typescript
BaseUser
AuthUser
UserRole: "farmer" | "buyer" | "admin"
```

### 2. Farmer System
```typescript
FarmerProfile
FarmerProfileFormData
```

### 3. Cluster Farmer System
```typescript
ClusterFarmerProfile
ClusterApplication
ClusterApplicationFormData
ApplicationStatus: "pending" | "approved" | "rejected"
```

### 4. Buyer System
```typescript
BuyerProfile
BuyerProfileFormData
```

### 5. Supply Listing System
```typescript
PackagingOption
FarmerSupplyListing
ClusterFarmerListing
SupplyListingFormData
ListingStatus: "pending" | "approved" | "rejected"
```

### 6. Marketplace & Orders
```typescript
MarketplaceListing
Order
OrderItem
OrderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
```

### 7. Admin System
```typescript
AdminProfile
PlatformAnalytics
```

### 8. Common Types
```typescript
NavLink
SelectOption
Notification
ApiResponse<T>
PaginatedResponse<T>
MarketplaceFilters
ListingFilters
```

## Usage Examples

### Import Types
```typescript
import type {
  FarmerProfile,
  SupplyListingFormData,
  ClusterApplication,
  MarketplaceListing,
} from "~/types";
```

### Import Constants
```typescript
import {
  FISH_TYPES,
  NIGERIAN_STATES,
  MIN_SUPPLY_KG,
  DASHBOARD_ROUTES,
} from "~/types/constants";
```

### Using Types in Components
```typescript
interface ProfileFormProps {
  initialData?: FarmerProfile;
  onSubmit: (data: FarmerProfileFormData) => Promise<void>;
}

export function ProfileForm({ initialData, onSubmit }: ProfileFormProps) {
  // Component implementation
}
```

### Using Types in API Routes
```typescript
import type { ApiResponse, FarmerProfile } from "~/types";

export async function POST(request: Request): Promise<Response> {
  const data = await request.json();
  
  const response: ApiResponse<FarmerProfile> = {
    success: true,
    data: farmerProfile,
    message: "Profile created successfully",
  };
  
  return Response.json(response);
}
```

### Using Types with React Hook Form
```typescript
import { useForm } from "react-hook-form";
import type { FarmerProfileFormData } from "~/types";

export function FarmerProfileForm() {
  const { register, handleSubmit } = useForm<FarmerProfileFormData>();
  
  const onSubmit = (data: FarmerProfileFormData) => {
    // Handle form submission
  };
  
  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

## Type Safety Rules

### ✅ DO
```typescript
// Use explicit types
const user: FarmerProfile = { ... };

// Use type inference when obvious
const listings = await getListings(); // Type inferred from function return

// Use generics for reusable components
function DataTable<T>({ data }: { data: T[] }) { ... }

// Use union types for status
type Status = "pending" | "approved" | "rejected";
```

### ❌ DON'T
```typescript
// Never use any
const data: any = { ... }; // ❌

// Never use unsafe casting
const user = data as FarmerProfile; // ❌ (unless you validate first)

// Never use implicit any
function handleData(data) { ... } // ❌
```

## Constants Usage

### Fish Types
```typescript
import { FISH_TYPES } from "~/types/constants";

// Use in select options
const fishOptions = FISH_TYPES.map(fish => ({
  label: fish,
  value: fish,
}));
```

### States
```typescript
import { NIGERIAN_STATES } from "~/types/constants";

// Use in location selector
<Select options={NIGERIAN_STATES} />
```

### Validation
```typescript
import { MIN_SUPPLY_KG, PHONE_REGEX } from "~/types/constants";

// Use in form validation
const schema = z.object({
  totalKg: z.number().min(MIN_SUPPLY_KG),
  phone: z.string().regex(PHONE_REGEX),
});
```

### Dashboard Routes
```typescript
import { DASHBOARD_ROUTES } from "~/types/constants";

// Use in navigation
if (user.role === "farmer") {
  router.push(
    user.isClusterFarmer 
      ? DASHBOARD_ROUTES.CLUSTER_FARMER 
      : DASHBOARD_ROUTES.FARMER
  );
}
```

## Animation Variants

```typescript
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";

<motion.div variants={FADE_IN_VARIANT}>
  Content
</motion.div>

<motion.div variants={STAGGER_CONTAINER_VARIANT}>
  {items.map(item => (
    <motion.div key={item.id} variants={FADE_IN_VARIANT}>
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

## Status Colors

```typescript
import { STATUS_COLORS } from "~/types/constants";

<span className={STATUS_COLORS[listing.status]}>
  {listing.status}
</span>
```

## Extending Types

When you need to extend existing types:

```typescript
// Extend base type
interface ExtendedFarmerProfile extends FarmerProfile {
  customField: string;
}

// Pick specific fields
type FarmerBasicInfo = Pick<FarmerProfile, "id" | "fullName" | "email">;

// Omit fields
type FarmerWithoutDates = Omit<FarmerProfile, "createdAt" | "updatedAt">;

// Partial for updates
type FarmerProfileUpdate = Partial<FarmerProfile>;
```

## Type Guards

Create type guards for runtime type checking:

```typescript
export function isFarmerProfile(profile: unknown): profile is FarmerProfile {
  return (
    typeof profile === "object" &&
    profile !== null &&
    "farmName" in profile &&
    "farmingCapacityKg" in profile
  );
}

// Usage
if (isFarmerProfile(data)) {
  // TypeScript knows data is FarmerProfile here
  console.log(data.farmName);
}
```

## Migration Guide

To migrate existing code to use new types:

1. Replace old type imports:
```typescript
// Old
import { Object } from "~/types/types";

// New
import type { SelectOption } from "~/types";
```

2. Update component props:
```typescript
// Old
interface Props {
  user: any;
}

// New
import type { FarmerProfile } from "~/types";

interface Props {
  user: FarmerProfile;
}
```

3. Use constants instead of hardcoded values:
```typescript
// Old
if (totalKg < 1000) { ... }

// New
import { MIN_SUPPLY_KG } from "~/types/constants";
if (totalKg < MIN_SUPPLY_KG) { ... }
```

## Next Steps

With types defined, you can now:
1. Build farmer profile system with type-safe forms
2. Create supply listing flow with validated data
3. Build marketplace with filtered listings
4. Implement admin dashboard with analytics

All components will have full TypeScript support and autocomplete.
