# Profile Components

Reusable profile components for AgroChainMarketPlace.

## Overview

This directory contains modular, type-safe profile components that can be reused across different user roles (Farmer, Buyer, Cluster Farmer).

## Components

### ProfileAvatar

Displays user profile image with optional edit functionality.

**Props:**

```typescript
interface ProfileAvatarProps {
  imageUrl?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
  onImageChange?: (file: File) => void;
}
```

**Usage:**

```typescript
<ProfileAvatar
  imageUrl={user.profileImage}
  name={user.fullName}
  size="lg"
  editable
  onImageChange={handleImageChange}
/>
```

**Features:**

- Three sizes: sm (64px), md (96px), lg (128px)
- Shows initials when no image
- Hover animation with scale effect
- Camera overlay on hover when editable
- File input for image upload

---

### ProfileDetails

Displays user profile information in a grid layout.

**Props:**

```typescript
interface ProfileDetailsProps {
  profile: FarmerProfile;
}
```

**Usage:**

```typescript
<ProfileDetails profile={farmerProfile} />
```

**Features:**

- Responsive grid (1 column mobile, 2 columns desktop)
- Icon-based detail items
- Staggered fade-in animation
- Displays: email, phone, location, farm details, experience, capacity

---

### FarmerProfileForm

Complete form for creating/editing farmer profiles.

**Props:**

```typescript
interface FarmerProfileFormProps {
  initialData?: FarmerProfile;
  onSubmit: (data: FarmerProfileFormData) => Promise<void>;
  isLoading?: boolean;
}
```

**Usage:**

```typescript
<FarmerProfileForm
  initialData={existingProfile}
  onSubmit={handleSubmit}
  isLoading={isSubmitting}
/>
```

**Features:**

- Full form validation with Zod
- React Hook Form integration
- Profile image upload with preview
- State and fish type dropdowns
- Responsive grid layout
- Staggered animations
- Error handling with toast notifications

**Validation Rules:**

- Full name: min 3 characters
- Phone: Nigerian format (+234 or 0)
- Email: valid email format
- Farm name: min 3 characters
- Farm address: min 5 characters
- Farming capacity: min 500kg
- Years of experience: 0-50 years

---

## Page Implementation

### Farmer Profile Page

Located at: `/farmer-dashboard/profile`

**Features:**

- View/Edit mode toggle
- Animated transitions between modes
- Profile avatar with cluster farmer badge
- Complete profile details display
- Edit form with validation
- Loading states
- Success/error notifications

**State Management:**

```typescript
const [isEditing, setIsEditing] = useState(false);
const [profile, setProfile] = useState<FarmerProfile | null>(null);
const [isLoading, setIsLoading] = useState(false);
```

---

## Styling

All components follow the existing design system:

**Spacing:**

- `gap-(--gap-base)` - 1rem
- `gap-(--gap-lg)` - 2rem
- `gap-(--section-gap)` - 3rem

**Colors:**

- `text-heading-colour` - Headings
- `text-text-colour` - Body text
- `bg-gray-bg` - Background
- `bg-theme-green-dark` - Primary buttons

**Typography:**

- `font-ubuntu` - Headings
- `font-roboto-slab` - Body text

---

## Animations

All components use Framer Motion for smooth animations:

**Variants Used:**

- `FADE_IN_VARIANT` - Opacity fade
- `SLIDE_UP_VARIANT` - Slide from bottom
- `STAGGER_CONTAINER_VARIANT` - Staggered children

**Example:**

```typescript
<motion.div
  initial="hidden"
  animate="visible"
  variants={FADE_IN_VARIANT}
>
  Content
</motion.div>
```

---

## Type Safety

All components are fully typed with TypeScript:

```typescript
import type { FarmerProfile, FarmerProfileFormData } from "~/types";
```

No `any` types are used. All props are strictly typed.

---

## Reusability

These components can be adapted for other user roles:

### For Buyer Profile:

1. Create `BuyerProfileForm.tsx` using same structure
2. Replace `FarmerProfile` with `BuyerProfile` type
3. Adjust form fields for buyer-specific data
4. Reuse `ProfileAvatar` and `ProfileDetails` (with type adjustments)

### For Cluster Farmer:

1. Extend `FarmerProfileForm` with additional fields
2. Add business name, CAC number, warehouse location
3. Reuse all existing components

---

## API Integration

Replace mock data with actual API calls:

```typescript
// In profile page
const handleSubmit = async (data: FarmerProfileFormData) => {
  setIsLoading(true);
  try {
    const response = await fetch("/api/farmer/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to save profile");

    const updatedProfile = await response.json();
    setProfile(updatedProfile);
    setIsEditing(false);
  } catch (error) {
    throw error;
  } finally {
    setIsLoading(false);
  }
};
```

---

## Testing

Test scenarios:

1. **Profile Creation:**
   - Fill all required fields
   - Upload profile image
   - Submit form
   - Verify success message

2. **Profile Update:**
   - Load existing profile
   - Click edit button
   - Modify fields
   - Submit changes
   - Verify updates

3. **Validation:**
   - Submit empty form
   - Enter invalid phone number
   - Enter invalid email
   - Verify error messages

4. **Image Upload:**
   - Click avatar
   - Select image file
   - Verify preview
   - Submit form
   - Verify image saved

---

## Next Steps

1. Create Buyer profile components
2. Add Cluster Farmer application form
3. Implement profile API endpoints
4. Add image upload to cloud storage
5. Add profile completion progress indicator

---

## File Structure

```
src/components/profile/
├── ProfileAvatar.tsx       # Avatar component
├── ProfileDetails.tsx      # Details display
├── FarmerProfileForm.tsx   # Farmer form
└── README.md              # This file

src/app/(dasboards)/farmers-dashboard/
└── profile/
    └── page.tsx           # Profile page
```
