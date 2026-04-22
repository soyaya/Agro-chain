# Listing Components

Supply listing components for the AgroChainMarketPlace farmer → cluster farmer approval flow.

## Overview

This directory contains modular, type-safe listing components that handle the complete supply listing workflow:
1. Farmer creates listing
2. Farmer submits for approval
3. Cluster farmer reviews listing
4. Cluster farmer approves/rejects
5. Approved listings appear on marketplace

## Components

### PackagingSelector
Interactive component for configuring packaging options.

**Props:**
```typescript
interface PackagingSelectorProps {
  totalKg: number;
  packaging: PackagingOption[];
  onChange: (packaging: PackagingOption[]) => void;
  error?: string;
}
```

**Usage:**
```typescript
<PackagingSelector
  totalKg={2000}
  packaging={packaging}
  onChange={setPackaging}
  error={packagingError}
/>
```

**Features:**
- Standard weight options (1kg, 2kg, 3kg, 5kg, 10kg, 25kg, 50kg)
- Price per unit input
- Auto-calculate quantity based on total kg
- Add/remove packaging options
- Visual summary of total packaged vs available
- Animated list with smooth transitions
- Validation for remaining kg

**Packaging Logic:**
```typescript
// If total = 2000kg and weight = 5kg
quantity = Math.floor(2000 / 5) = 400 units

// User can add multiple packaging options
[
  { weightKg: 1, quantity: 1000, pricePerUnit: 1500 },
  { weightKg: 5, quantity: 200, pricePerUnit: 7000 }
]
```

---

### ListingCard
Display component for supply listings with status and actions.

**Props:**
```typescript
interface ListingCardProps {
  listing: FarmerSupplyListing;
  onClick?: () => void;
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}
```

**Usage:**
```typescript
// Farmer view (no actions)
<ListingCard
  listing={listing}
  onClick={() => router.push(`/listings/${listing.id}`)}
/>

// Cluster farmer view (with actions)
<ListingCard
  listing={listing}
  showActions
  onApprove={handleApprove}
  onReject={handleReject}
/>
```

**Features:**
- Status badge (pending, approved, rejected)
- Fish type and farmer name
- Total available kg
- Harvest and listing dates
- Packaging options summary
- Total value calculation
- Approve/Reject buttons (cluster farmer only)
- Rejection reason display
- Hover animation with scale effect
- Click to view details

**Status Colors:**
- Pending: Yellow
- Approved: Green
- Rejected: Red

---

### SupplyListingForm
Complete form for creating/editing supply listings.

**Props:**
```typescript
interface SupplyListingFormProps {
  initialData?: FarmerSupplyListing;
  onSubmit: (data: SupplyListingFormData) => Promise<void>;
  isLoading?: boolean;
}
```

**Usage:**
```typescript
<SupplyListingForm
  initialData={existingListing}
  onSubmit={handleSubmit}
  isLoading={isSubmitting}
/>
```

**Features:**
- Fish type dropdown (from constants)
- Harvest date picker
- Total available kg input (min 1000kg)
- Integrated PackagingSelector
- Form validation with Zod
- React Hook Form integration
- Information box with submission notes
- Staggered animations
- Error handling with toast notifications

**Validation Rules:**
- Fish type: required
- Harvest date: required
- Total kg: min 1000kg
- Packaging: at least one option required

---

## Pages

### Farmer Listings Page
`/farmers-dashboard/listings`

**Features:**
- View all listings (pending, approved, rejected)
- Filter by status
- Status count cards
- Create new listing button
- Empty state with CTA
- Responsive grid layout
- Click card to view details

**Status Filters:**
- All listings
- Pending (awaiting approval)
- Approved (on marketplace)
- Rejected (with reason)

---

### Create Listing Page
`/farmers-dashboard/listings/create`

**Features:**
- Back navigation
- Complete listing form
- Submission flow
- Loading states
- Success redirect to listings page
- Information about approval process

---

### Pending Approvals Page (Cluster Farmer)
`/cluster-dashboard/pending-approvals`

**Features:**
- View all pending farmer listings
- Approve/Reject actions on each card
- Rejection modal with reason input
- Pending count alert
- Empty state when all reviewed
- Real-time list updates
- Toast notifications

**Approval Flow:**
1. Cluster farmer views pending listing
2. Reviews details (fish type, quantity, packaging, price)
3. Clicks "Approve" or "Reject"
4. If reject: modal opens for reason
5. Listing removed from pending list
6. Farmer notified of status

---

## Workflow

### Farmer Submission Flow
```
1. Farmer navigates to /farmers-dashboard/listings/create
2. Fills out form:
   - Select fish type
   - Enter harvest date
   - Enter total kg (min 1000kg)
   - Add packaging options
3. Submits listing
4. Status = "pending"
5. Redirected to listings page
6. Waits for cluster farmer approval
```

### Cluster Farmer Approval Flow
```
1. Cluster farmer navigates to /cluster-dashboard/pending-approvals
2. Views pending farmer listings
3. Reviews listing details
4. Approves or rejects:
   
   If APPROVE:
   - Listing status = "approved"
   - Listing owner = cluster farmer
   - Listing visible on marketplace
   - Farmer notified
   
   If REJECT:
   - Modal opens for rejection reason
   - Listing status = "rejected"
   - Rejection reason saved
   - Farmer notified with reason
```

---

## Styling

All components follow the existing design system:

**Spacing:**
- `gap-(--gap-base)` - 1rem
- `gap-(--gap-lg)` - 2rem
- `gap-(--section-gap)` - 3rem
- `p-(--space-lg)` - 1.5rem
- `p-(--space-xl)` - 2rem

**Colors:**
- `text-(--heading-colour)` - Headings
- `text-(--text-colour)` - Body text
- `bg-(--gray-bg)` - Background
- `bg-(--theme-green-dark)` - Primary buttons
- `border-(--border-gray)` - Borders

**Status Colors (from constants):**
```typescript
STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
}
```

---

## Animations

All components use Framer Motion:

**Variants Used:**
- `FADE_IN_VARIANT` - Opacity fade
- `SCALE_IN_VARIANT` - Scale with fade
- `STAGGER_CONTAINER_VARIANT` - Staggered children

**Card Hover:**
```typescript
whileHover={{ scale: 1.02, y: -4 }}
transition={{ duration: 0.2 }}
```

**List Animations:**
```typescript
<AnimatePresence>
  {items.map(item => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {item}
    </motion.div>
  ))}
</AnimatePresence>
```

---

## Type Safety

All components are fully typed:

```typescript
import type {
  FarmerSupplyListing,
  SupplyListingFormData,
  PackagingOption,
  ListingStatus,
} from "~/types";
```

No `any` types used. All props strictly typed.

---

## API Integration

Replace mock data with actual API calls:

### Create Listing
```typescript
const handleSubmit = async (data: SupplyListingFormData) => {
  const response = await fetch("/api/farmer/listings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Failed to create listing");

  const listing = await response.json();
  return listing;
};
```

### Approve Listing
```typescript
const handleApprove = async (id: string) => {
  const response = await fetch(`/api/cluster/listings/${id}/approve`, {
    method: "POST",
  });

  if (!response.ok) throw new Error("Failed to approve listing");

  // Listing now belongs to cluster farmer
  // Visible on marketplace
};
```

### Reject Listing
```typescript
const handleReject = async (id: string, reason: string) => {
  const response = await fetch(`/api/cluster/listings/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) throw new Error("Failed to reject listing");
};
```

---

## Testing Scenarios

1. **Create Listing:**
   - Fill all fields
   - Add multiple packaging options
   - Submit form
   - Verify redirect to listings page

2. **View Listings:**
   - See all statuses
   - Filter by status
   - Click card to view details

3. **Approve Listing:**
   - View pending listing
   - Click approve
   - Verify listing removed from pending
   - Verify success toast

4. **Reject Listing:**
   - View pending listing
   - Click reject
   - Enter rejection reason
   - Confirm rejection
   - Verify listing removed
   - Verify success toast

5. **Validation:**
   - Try submitting without packaging
   - Try submitting with < 1000kg
   - Verify error messages

---

## Next Steps

1. Implement API endpoints
2. Add listing detail view page
3. Add edit listing functionality
4. Add notification system
5. Build marketplace display (Step 4)

---

## File Structure

```
src/components/listings/
├── PackagingSelector.tsx      # Packaging configuration
├── ListingCard.tsx            # Listing display
├── SupplyListingForm.tsx      # Create/edit form
└── README.md                  # This file

src/app/(dasboards)/farmers-dashboard/listings/
├── page.tsx                   # All listings
└── create/
    └── page.tsx              # Create listing

src/app/(dasboards)/cluster-dashboard/
└── pending-approvals/
    └── page.tsx              # Review listings
```
