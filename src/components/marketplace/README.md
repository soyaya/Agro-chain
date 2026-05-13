# Marketplace Components

Browse and purchase interface for the AgroChainMarketPlace.

## Overview

This directory contains marketplace components that allow buyers to browse approved cluster farmer listings, filter by criteria, view details, and place orders.

## Components

### MarketplaceCard
Display component for marketplace listings with purchase actions.

**Props:**
```typescript
interface MarketplaceCardProps {
  listing: MarketplaceListing;
  onClick?: () => void;
  onAddToCart?: (listing: MarketplaceListing) => void;
}
```

**Usage:**
```typescript
<MarketplaceCard
  listing={listing}
  onClick={() => router.push(`/marketplace/${listing.id}`)}
  onAddToCart={handleAddToCart}
/>
```

**Features:**
- Fish type and business name
- Price range display (lowest - highest)
- Available quantity
- Location (state, LGA)
- Contact information
- Packaging options chips
- Delivery options
- Harvest date
- View Details button
- Order Now button
- Hover animation with scale effect

**Price Display:**
- Shows lowest price prominently
- Shows range if multiple packaging options
- Example: ₦1,500 - ₦13,500

---

### MarketplaceFilters
Comprehensive filtering component for marketplace listings.

**Props:**
```typescript
interface MarketplaceFiltersProps {
  filters: MarketplaceFilters;
  onChange: (filters: MarketplaceFilters) => void;
  onReset: () => void;
}
```

**Usage:**
```typescript
<MarketplaceFilters
  filters={filters}
  onChange={setFilters}
  onReset={handleResetFilters}
/>
```

**Features:**
- Search input (with icon)
- Fish type dropdown
- State dropdown
- Price range (min/max)
- Minimum quantity filter
- Sort options (6 variations)
- Reset button (shows when filters active)
- Smooth animations

**Filter Options:**
- Fish Type: All types from constants
- State: All Nigerian states
- Price Range: Min and max in Naira
- Minimum Quantity: In kg
- Sort By:
  - Latest First
  - Oldest First
  - Price: Low to High
  - Price: High to Low
  - Quantity: Low to High
  - Quantity: High to Low

---

## Pages

### Marketplace Page
`/marketplace`

**Features:**
- Header with marketplace icon
- Stats cards (listings, fish types, states, total kg)
- Sidebar filters (desktop) / top filters (mobile)
- Responsive grid layout
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3 columns
- Real-time filtering
- Real-time sorting
- Empty state with reset button
- Add to cart functionality
- Click card to view details

**Stats Display:**
- Available Listings count
- Unique Fish Types count
- States represented count
- Total Available kg sum

**Grid Layout:**
```
Desktop (lg):
┌─────────┬──────────────────────┐
│ Filters │   Listings Grid      │
│ (1 col) │   (3 columns)        │
│         │                      │
└─────────┴──────────────────────┘

Mobile:
┌──────────────────────┐
│      Filters         │
├──────────────────────┤
│   Listings Grid      │
│   (1 column)         │
└──────────────────────┘
```

---

### Listing Detail Page
`/marketplace/[id]`

**Features:**
- Back navigation
- Listing header (fish type, business name)
- Details grid (available, harvest date, location, contact)
- Packaging options with add to cart
- Quantity selector (+ / -)
- Delivery options (radio buttons)
- Order summary sidebar (sticky)
- Cart management
- Checkout button
- Responsive layout

**Layout:**
```
Desktop:
┌────────────────────┬──────────┐
│  Listing Details   │  Order   │
│  - Header          │  Summary │
│  - Details Grid    │  (Sticky)│
│  - Packaging       │          │
│  - Delivery        │          │
└────────────────────┴──────────┘

Mobile:
┌────────────────────┐
│  Listing Details   │
├────────────────────┤
│  Order Summary     │
└────────────────────┘
```

**Cart Functionality:**
- Add package to cart
- Increase/decrease quantity
- Remove from cart (quantity = 0)
- Max quantity validation
- Real-time total calculation
- Total weight calculation

**Order Summary:**
- List of cart items
- Quantity × Price per item
- Total weight
- Total amount
- Proceed to Checkout button
- Empty state when no items

---

## Workflow

### Browse Marketplace
```
1. User navigates to /marketplace
2. Views all approved cluster farmer listings
3. Applies filters:
   - Fish type
   - State
   - Price range
   - Minimum quantity
4. Sorts results
5. Clicks card to view details
```

### View Listing Details
```
1. User clicks marketplace card
2. Navigates to /marketplace/[id]
3. Views complete listing information
4. Selects packaging options
5. Adds to cart
6. Adjusts quantities
7. Selects delivery option
8. Reviews order summary
9. Proceeds to checkout
```

### Purchase Flow
```
1. Add packages to cart
2. Select delivery option
3. Review order summary
4. Click "Proceed to Checkout"
5. [TODO] Checkout page
6. [TODO] Payment processing
7. [TODO] Order confirmation
```

---

## Filtering Logic

### Client-Side Filtering
```typescript
const filteredListings = listings.filter((listing) => {
  if (filters.fishType && listing.fishType !== filters.fishType) 
    return false;
  if (filters.state && listing.state !== filters.state) 
    return false;
  if (filters.minPrice && listing.pricePerKg < filters.minPrice) 
    return false;
  if (filters.maxPrice && listing.pricePerKg > filters.maxPrice) 
    return false;
  if (filters.minQuantity && listing.totalAvailableKg < filters.minQuantity)
    return false;
  return true;
});
```

### Sorting Logic
```typescript
const sortedListings = [...filteredListings].sort((a, b) => {
  const order = filters.sortOrder === "asc" ? 1 : -1;

  switch (filters.sortBy) {
    case "price":
      return (a.pricePerKg - b.pricePerKg) * order;
    case "quantity":
      return (a.totalAvailableKg - b.totalAvailableKg) * order;
    case "date":
    default:
      return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) * order;
  }
});
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
- `text-(--theme-green-dark)` - Price highlights
- `border-(--border-gray)` - Borders

**Responsive Breakpoints:**
- Mobile: < 768px (1 column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (3-4 columns)

---

## Animations

All components use Framer Motion:

**Variants Used:**
- `FADE_IN_VARIANT` - Opacity fade
- `SCALE_IN_VARIANT` - Scale with fade
- `SLIDE_UP_VARIANT` - Slide from bottom
- `STAGGER_CONTAINER_VARIANT` - Staggered children

**Card Hover:**
```typescript
whileHover={{ scale: 1.02, y: -4 }}
transition={{ duration: 0.2 }}
```

**Staggered Grid:**
```typescript
<motion.div variants={STAGGER_CONTAINER_VARIANT}>
  {listings.map(listing => (
    <motion.div variants={SCALE_IN_VARIANT}>
      <MarketplaceCard listing={listing} />
    </motion.div>
  ))}
</motion.div>
```

---

## Type Safety

All components are fully typed:

```typescript
import type {
  MarketplaceListing,
  MarketplaceFilters,
  PackagingOption,
} from "~/types";
```

No `any` types used. All props strictly typed.

---

## API Integration

Replace mock data with actual API calls:

### Fetch Listings
```typescript
const fetchListings = async (filters: MarketplaceFilters) => {
  const queryParams = new URLSearchParams({
    fishType: filters.fishType || "",
    state: filters.state || "",
    minPrice: filters.minPrice?.toString() || "",
    maxPrice: filters.maxPrice?.toString() || "",
    minQuantity: filters.minQuantity?.toString() || "",
    sortBy: filters.sortBy || "date",
    sortOrder: filters.sortOrder || "desc",
  });

  const response = await fetch(`/api/marketplace?${queryParams}`);
  if (!response.ok) throw new Error("Failed to fetch listings");

  const data = await response.json();
  return data.listings;
};
```

### Fetch Listing Detail
```typescript
const fetchListing = async (id: string) => {
  const response = await fetch(`/api/marketplace/${id}`);
  if (!response.ok) throw new Error("Failed to fetch listing");

  const data = await response.json();
  return data.listing;
};
```

### Create Order
```typescript
const createOrder = async (orderData: {
  listingId: string;
  items: CartItem[];
  deliveryOption: string;
}) => {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) throw new Error("Failed to create order");

  const data = await response.json();
  return data.order;
};
```

---

## Testing Scenarios

1. **Browse Marketplace:**
   - View all listings
   - See stats update
   - Hover cards for animation

2. **Apply Filters:**
   - Select fish type
   - Select state
   - Enter price range
   - Enter minimum quantity
   - Verify filtered results

3. **Sort Listings:**
   - Sort by price (asc/desc)
   - Sort by quantity (asc/desc)
   - Sort by date (asc/desc)
   - Verify sort order

4. **View Details:**
   - Click card
   - Navigate to detail page
   - View all information

5. **Add to Cart:**
   - Add package
   - Increase quantity
   - Decrease quantity
   - Remove from cart
   - Verify max quantity

6. **Checkout:**
   - Select delivery option
   - Review summary
   - Click checkout
   - Verify navigation

---

## Next Steps

1. Implement checkout page
2. Add payment integration
3. Create order confirmation page
4. Add order tracking
5. Implement buyer dashboard with order history
6. Add saved listings feature
7. Add contact cluster farmer feature

---

## File Structure

```
src/components/marketplace/
├── MarketplaceCard.tsx        # Listing card
├── MarketplaceFilters.tsx     # Filter sidebar
└── README.md                  # This file

src/app/marketplace/
├── page.tsx                   # Browse listings
└── [id]/
    └── page.tsx              # Listing details
```
