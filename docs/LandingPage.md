# Landing Page Design & Implementation Guide

## Overview

This document is the complete spec for rebuilding the Agro-chain public-facing landing experience.
The current homepage (`/`) is an onboarding splash screen that auto-advances three steps and
redirects to `/authentication`. It has no navigation, no header, no footer, and gives visitors
zero information about the platform before forcing them to register.

The goal is to replace it with a full marketing site that converts three types of visitors:
individual farmers, cluster farmers, and bulk buyers.

---

## Reference Images & What to Take From Each

Three reference images are available in `public/Home_Image_1/`:

### `Home_1.webp` - AgriPrecision / Data-Driven Farming Site

**What it shows:** Full-page layout of an agri-tech company. Dark green hero with bold white
headline, trust badge row of partner logos, feature cards with icons, impact stats section
(40%, 22%, 30%, 95%), partner logo strip, product dashboard screenshots, and a clean footer.

**What to borrow for Agro-chain:**

- The dark green hero with a full-bleed background image and white headline - fits perfectly
  with `--theme-green-dark: #1b4332`
- The impact stats row (numbers + labels) - use for "500+ Farmers", "50+ Cluster Farmers",
  "10,000+ kg Traded", "6 States Covered"
- The partner/trust logo strip below the hero - use for payment partners (Paystack), logistics
  partners, or government/regulatory bodies
- Feature cards with icons in a 3-column grid - use for the "Why Agro-chain" section
- The product dashboard screenshot section - use to show the marketplace and farmer dashboard UI

### `original-f86465469d037b98c639b280a5ce1b6d.webp` - Inovasi Agriplot / Supply Chain Site

**What it shows:** Green-dominant site with a hero featuring a lush aerial farm photo, core
values section with alternating text-image rows, a large impact numbers section (81M+, 17.6K+,
1.8K+), an FAQ accordion, and a dark footer with newsletter signup.

**What to borrow for Agro-chain:**

- The alternating text-image layout for the "How It Works" section - one column text, one column
  screenshot or illustration, alternating per step
- The large bold impact numbers section with a dark green background - very strong visual break
- The FAQ accordion - reuse the existing one from `/support` or expand it here
- The dark footer with newsletter/subscribe CTA - the existing `Footer.tsx` already has this
  structure, just needs the subscribe section uncommented
- The aerial farm photography aesthetic for the hero background

### `strategic.webp` - Dark UI / Solution Overview Section

**What it shows:** Dark charcoal background, numbered feature cards (1, 2, 3) with illustrations,
section label in small caps, bold left-aligned headline, supporting paragraph on the right.

**What to borrow for Agro-chain:**

- The numbered card layout (1, 2, 3) for the three user journeys: Farmer, Cluster Farmer, Buyer
- The dark section as a visual contrast break - use it for the "How It Works" or "Our Solution"
  section with `bg-(--heading-colour)` or a near-black background
- The small-caps section label above the headline (e.g. "HOW IT WORKS" or "OUR PLATFORM")
- The two-column layout: headline left, supporting paragraph right - use this for section intros

---

## Site Structure

### Pages to Build

| Route           | Status                                      | Priority |
| --------------- | ------------------------------------------- | -------- |
| `/`             | Rebuild (currently onboarding splash)       | P0       |
| `/about`        | Create (nav link exists, page missing)      | P0       |
| `/how-it-works` | Create (side nav link exists, page missing) | P1       |
| `/contact`      | Create (nav link exists, page missing)      | P0       |
| `/marketplace`  | Exists - just needs homepage entry points   | -        |
| `/support`      | Exists - well built                         | -        |
| `/privacy`      | Exists                                      | -        |
| `/terms`        | Exists                                      | -        |

### Layout Changes

File: `src/app/(main-app)/layout.tsx`

Uncomment the Header and Footer imports. The components already exist at:

- `src/components/Header.tsx` - fully built, sticky, mobile sidebar, nav links, auth CTAs
- `src/components/Footer.tsx` - fully built, 4-column grid, social links, legal links

```tsx
// Change from:
{/* <Header /> */}
<main>{children}</main>
{/* <Footer /> */}

// Change to:
<Header />
<main>{children}</main>
<Footer />
```

Also fix `src/components/AppLogo.tsx` - the `<Image>` component is missing `width` and `height`
props which will cause a Next.js build error. Either add dimensions or replace with a text logo:

```tsx
// Option A - text logo (safe, no image dependency)
export default function AppLogo() {
  return (
    <span className="font-ubuntu text-xl font-bold text-(--theme-green-dark)">Agro-chain</span>
  );
}

// Option B - image with dimensions
export default function AppLogo() {
  return <Image src="/logo.png" alt="Agro-chain" width={120} height={40} />;
}
```

---

## Page 1: Homepage (`/`)

Replace the current onboarding splash entirely. The new homepage is a full marketing page.
The Header and Footer come from the layout - the page itself only needs the sections between them.

### Section 1 - Hero

**Visual reference:** `Home_1.webp` hero + `original-f86465469d037b98c639b280a5ce1b6d.webp` aerial farm photo

**Layout:** Full-viewport-height section. Dark green background (`--theme-green-dark: #1b4332`)
with a subtle overlay on a farm/catfish pond background image. White text. Two CTAs side by side.

**Content:**

```
[Small label - uppercase, green-tinted]
Nigeria's Catfish Marketplace

[H1 - large, white, Ubuntu font]
Connecting Verified Farmers
to Bulk Buyers, Seamlessly.

[Subheading - white/70, Roboto Slab]
Agro-chain digitises the catfish supply chain — from farm listing
to secure payment and coordinated delivery. No middlemen. No price
opacity. Just fresh fish, fair prices, and reliable logistics.

[Two CTAs side by side]
[Primary - white bg, green text]  Browse Marketplace →
[Secondary - white border, white text]  Join as a Farmer

[Trust badges row below CTAs]
✓ Paystack Secured  ✓ Verified Sellers  ✓ Admin-Set Pricing  ✓ Traceable Supply
```

**Implementation notes:**

- Use `min-h-screen` with `flex items-center`
- Background: `bg-(--theme-green-dark)` with a `bg-[url('/Home_Image_1/Home_1.webp')]` overlay
  at low opacity (10-15%) using `before:` pseudo-element or a positioned `<Image>` with `opacity-10`
- Animate headline in with `framer-motion` `FADE_IN_VARIANT` - already in `constants.ts`
- "Browse Marketplace" links to `/marketplace` (public, no login required)
- "Join as a Farmer" links to `/authentication`

---

### Section 2 - Impact Stats

**Visual reference:** `Home_1.webp` stats row + `original-f86465469d037b98c639b280a5ce1b6d.webp` large numbers

**Layout:** 4-column grid on desktop, 2x2 on mobile. White background. Each cell: large bold
number, small label below.

**Content:**

```
500+          50+           10,000kg+       6
Registered    Cluster       Fish Traded     States
Farmers       Farmers       Monthly         Covered
```

**Implementation notes:**

- Use `STAGGER_CONTAINER_VARIANT` + `SLIDE_UP_VARIANT` from `constants.ts` for staggered entrance
- Numbers in `font-ubuntu text-5xl font-bold text-(--theme-green-dark)`
- Labels in `font-roboto-slab text-sm text-(--text-colour)`
- Thin top/bottom border to separate from adjacent sections

---

### Section 3 - How It Works

**Visual reference:** `strategic.webp` numbered cards + `original-f86465469d037b98c639b280a5ce1b6d.webp` alternating rows

**Layout:** Dark section (`bg-(--heading-colour)` or `#0f1f17`). Small-caps section label top-left.
Bold white headline left, supporting paragraph right (two-column intro). Then three numbered cards
below in a row.

**Content:**

```
[Section label - small caps, green]
HOW IT WORKS

[H2 - white, left]              [Paragraph - white/60, right]
Three roles.                    Whether you grow fish, aggregate
One platform.                   supply, or buy in bulk — Agro-chain
                                has a dedicated flow built for you.

[Card 1]                [Card 2]                [Card 3]
  1                       2                       3
[Farm icon]             [Warehouse icon]        [Cart icon]

Farmer                  Cluster Farmer          Buyer
Register → List         Aggregate farmers →     Browse listings →
supply → Cluster        List on marketplace →   Add to cart →
approval → Earn         Fulfill orders →        Pay securely →
                        Get paid                Confirm delivery
```

**Implementation notes:**

- Dark background is the visual contrast break - matches `strategic.webp` aesthetic
- Cards use `rounded-2xl border border-white/10 bg-white/5 p-6` for the glassmorphism card look
- Number badge: `h-8 w-8 rounded-full bg-(--theme-green-dark) text-white text-sm font-bold`
- Each card links to the relevant registration path at the bottom

---

### Section 4 - Why Agro-chain (Features)

**Visual reference:** `Home_1.webp` feature cards section

**Layout:** White background. Section label + H2 centered. 3-column card grid (2 on tablet, 1 on mobile).

**Content (6 cards):**

```
[Shield icon]           [Tag icon]              [Truck icon]
Verified Sellers        Admin-Set Pricing       Coordinated Logistics
All cluster farmers     Prices are set          Cluster farmers handle
are KYC-verified        platform-wide by        warehousing and
and approved by         admin — no price        delivery. Buyers choose
admin before they       negotiation, no         pickup or delivery at
can list.               surprises.              checkout.

[Lock icon]             [FileText icon]         [Users icon]
Secure Escrow           Traceable Supply        Demand Matching
Payments via            Every listing is        Can't find what you
Paystack. Funds         tied to a verified      need? Submit a demand
held until buyer        farmer and cluster      and admin assigns the
confirms delivery.      farmer. Full chain      right cluster farmer
                        of custody.             to fulfill it.
```

**Implementation notes:**

- Cards: `rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm`
- Icon container: `h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center`
- Icon: `text-(--theme-green-dark)` at size 24
- Hover: `hover:shadow-md transition-shadow`

---

### Section 5 - Fish Types / Browse by Category

**Layout:** Light gray background (`bg-(--gray-bg)`). Section label + H2. 6-card grid (3 on desktop,
2 on tablet, 2 on mobile). Each card is a fish type with a name, short description, and a
"Browse" link to `/marketplace?fishType=X`.

**Content:**

```
Catfish          Fingerlings      Juveniles
Table Size       Jumbo            Parent Stocks
```

Each card:

```
[Fish emoji or icon - large]
[Fish type name - Ubuntu bold]
[One-line description - Roboto Slab, gray]
[Browse → link - green]
```

**Implementation notes:**

- Cards link to `/marketplace?fishType=catfish` etc.
- Use `FISH_TYPE_LABELS` from `constants.ts` for display names
- This section is a public entry point to the marketplace - no login required

---

### Section 6 - Marketplace Preview (Live Listings)

**Layout:** White background. Section label + H2 + subheading. 3-column listing card grid.
"View All Listings" CTA centered below.

**Content:**

```
[Section label]
LIVE MARKETPLACE

[H2]
Fresh Supply, Available Now.

[Subheading]
Browse verified listings from cluster farmers across Nigeria.

[3 listing cards - fetched from GET /marketplace?limit=3]

[CTA button]
View All Listings →  (links to /marketplace)
```

**Implementation notes:**

- Fetch from `GET /marketplace?limit=3` using `useEffect` on mount
- Use the existing `MarketplaceCard` component from `src/components/marketplace/MarketplaceCard.tsx`
- Show a skeleton loader while fetching (3 gray placeholder cards)
- If fetch fails, hide the section entirely (don't show an error on the homepage)
- This is the strongest conversion section - real listings prove the platform is live

---

### Section 7 - Testimonials

**Layout:** Dark green background (`bg-(--theme-green-dark)`). Section label + H2 centered.
3 quote cards in a row.

**Content (placeholder - replace with real quotes):**

```
"Agro-chain made it easy to list my catfish and get approved
within 24 hours. My cluster farmer handles everything after that."
- Musa A., Catfish Farmer, Kaduna

"I used to spend days sourcing catfish for my restaurant. Now I
order directly from verified cluster farmers and pay securely."
- Chioma O., Restaurant Owner, Lagos

"Managing 12 farmers under me was chaotic. Agro-chain gives me
one dashboard to approve listings, track orders, and get paid."
- Ibrahim K., Cluster Farmer, Kano
```

**Implementation notes:**

- Cards: `rounded-2xl bg-white/10 border border-white/20 p-6`
- Quote text: `font-roboto-slab text-white/90 italic`
- Attribution: `font-ubuntu text-sm text-white/60 mt-4`
- Large quotation mark decoration: `text-6xl text-white/20 font-serif leading-none`

---

### Section 8 - Final CTA Banner

**Visual reference:** `original-f86465469d037b98c639b280a5ce1b6d.webp` bottom CTA section

**Layout:** Full-width. Gradient from `--theme-green-dark` to a slightly lighter green.
Centered text. Two CTAs.

**Content:**

```
[H2 - white]
Ready to trade smarter?

[Subheading - white/70]
Join hundreds of farmers and buyers already using Agro-chain
to source and sell fresh catfish across Nigeria.

[Two CTAs]
[Primary - white bg, green text]  Get Started Free
[Secondary - white border]        Browse Marketplace
```

---

## Page 2: About (`/about`)

File: `src/app/(main-app)/about/page.tsx`

### Section 1 - Hero

```
[H1]
We're Building the Infrastructure
for Nigeria's Catfish Industry.

[Subheading]
Agro-chain is a digital marketplace that connects verified catfish
farmers and cluster aggregators with bulk buyers — bringing
transparency, security, and efficiency to a ₦500B+ industry.
```

Background: light green tint (`bg-green-50`) or white with a green left border accent.

### Section 2 - Our Story

Two-column layout. Left: text. Right: farm image (use `Home_1.webp` cropped).

```
[Section label] OUR STORY

[H2] Built to solve a real problem.

[Body text]
Nigeria produces over 300,000 metric tonnes of catfish annually,
yet most transactions happen informally — through phone calls,
cash payments, and unverified middlemen. Prices are opaque.
Logistics are unreliable. Farmers get underpaid. Buyers get
inconsistent quality.

Agro-chain was built to change that. We created a three-sided
marketplace where individual farmers list their supply, cluster
farmers aggregate and verify it, and buyers purchase with
confidence — backed by Paystack escrow and full order tracking.
```

### Section 3 - Our Values

**Visual reference:** `original-f86465469d037b98c639b280a5ce1b6d.webp` core values section
(alternating text-image rows)

Four values, each as an alternating row (text left/image right, then image left/text right):

```
1. Transparency
   Every price is set by admin. Every listing is tied to a
   verified farmer. No hidden fees, no price manipulation.
   [Image: marketplace screenshot]

2. Trust
   Cluster farmers are KYC-verified and admin-approved before
   they can list. Buyers pay into escrow, not directly to sellers.
   [Image: admin dashboard screenshot]

3. Traceability
   Every order has a full chain of custody — from the individual
   farmer who grew the fish to the cluster farmer who shipped it.
   [Image: order tracking screenshot]

4. Fair Pricing
   Admin sets platform-wide prices per fish type. Farmers don't
   compete on price — they compete on quality and availability.
   [Image: settings/pricing screenshot]
```

### Section 4 - Impact Numbers

Dark green background. Same layout as homepage stats but with different numbers:

```
₦500B+          300K MT         6 Fish          3 User
Industry Size   Annual Output   Types           Roles Served
```

### Section 5 - Meet the Team

Grid of team member cards. 3 per row on desktop, 2 on tablet, 1 on mobile.

Each card:

```
[Circular photo - 80x80px]
[Name - Ubuntu bold]
[Role - Roboto Slab, gray]
[One-line bio - small, gray]
[LinkedIn icon link]
```

Placement: After values, before the CTA. This is the natural position - visitors who've read
the mission and values are primed to connect with the people behind it.

Card style: `rounded-2xl border border-(--border-gray) bg-(--white) p-6 text-center shadow-sm`

### Section 6 - CTA

```
[H2] Want to be part of this?
[Subheading] Join as a farmer, cluster farmer, or buyer today.
[CTA] Get Started →
```

---

## Page 3: How It Works (`/how-it-works`)

File: `src/app/(main-app)/how-it-works/page.tsx`

### Section 1 - Hero

```
[H1] How Agro-chain Works
[Subheading] A simple, transparent process for every role on the platform.
```

### Section 2 - Role Tabs

Three tabs: Farmer | Cluster Farmer | Buyer

Each tab shows a step-by-step vertical timeline:

**Farmer tab:**

```
Step 1 - Register
Create an account and select "Farmer" as your role. Complete
your profile with farm details, location, and fish type.

Step 2 - Create a Listing
Enter your fish type, harvest date, total available kg, and
weight per fish. Price is set automatically by the platform.

Step 3 - Await Cluster Approval
Your listing is sent to your assigned cluster farmer for review.
They approve or reject with a reason within 24-48 hours.

Step 4 - Listing Goes Live
Once approved, your supply appears on the marketplace under
your cluster farmer's name. Buyers can now order.

Step 5 - Get Paid
When a buyer confirms delivery, your payout is released to
your cluster farmer who distributes to you.
```

**Cluster Farmer tab:**

```
Step 1 - Apply for Cluster Status
Submit your business documents (CAC, BVN, warehouse location).
Admin reviews and approves your application.

Step 2 - Manage Your Farmers
Farmers in your area are automatically assigned to you. Review
their listings and approve or reject with feedback.

Step 3 - Create Your Own Listings
List your aggregated supply directly on the marketplace with
your warehouse location and delivery options.

Step 4 - Fulfill Orders
When buyers order, you process, pack, and ship. Update order
status in your dashboard as it progresses.

Step 5 - Receive Payout
After buyer confirms delivery, funds are released from escrow
to your account after the selected delay window.
```

**Buyer tab:**

```
Step 1 - Browse the Marketplace
No account needed to browse. Filter by fish type, state, or
price range. View full listing details including seller info.

Step 2 - Add to Cart
Select your packaging size, variant (dried, jumbo, table size,
broodstock), and quantity. Add to cart.

Step 3 - Checkout
Choose pickup or delivery. Enter delivery address if needed.
Review your order total including delivery fee.

Step 4 - Pay Securely
Pay via Paystack (card or bank transfer). Funds are held in
escrow until you confirm delivery.

Step 5 - Confirm Delivery
When your order arrives, confirm delivery in your dashboard.
This releases payment to the cluster farmer.
```

### Section 3 - FAQ

Expand the existing FAQ from `/support`. Add role-specific questions:

```
For Farmers:
- How long does cluster approval take?
- What happens if my listing is rejected?
- Can I list multiple fish types?

For Cluster Farmers:
- How do I apply for cluster farmer status?
- How are farmers assigned to me?
- When do I receive my payout?

For Buyers:
- Do I need an account to browse?
- What payment methods are accepted?
- What if my order doesn't arrive?
```

### Section 4 - CTA

```
[H2] Ready to get started?
[Three buttons side by side]
I'm a Farmer  |  I'm a Cluster Farmer  |  I'm a Buyer
```

All three link to `/authentication` with a role pre-selected via query param if possible.

---

## Page 4: Contact (`/contact`)

File: `src/app/(main-app)/contact/page.tsx`

### Section 1 - Hero

```
[H1] Get in Touch
[Subheading] Have a question, partnership inquiry, or need support?
We're here to help.
```

### Section 2 - Contact Options (3 cards)

Reuse the same card layout from `/support`:

- WhatsApp: `https://wa.me/2347012288798`
- Email: `shownzy001@gmail.com`
- Phone: `+234 701 228 8798` (Mon-Fri, 9am-5pm WAT)

### Section 3 - Contact Form

```
[Full Name]
[Email Address]
[Subject - dropdown: General Inquiry / Partnership / Farmer Support / Buyer Support / Technical Issue]
[Message - textarea]
[Send Message button]
```

Form submission: POST to a backend endpoint or use a third-party service (Formspree, EmailJS).
For now, show a success toast on submit and log to console.

### Section 4 - Office Info

```
[MapPin icon] Kaduna, Nigeria
[Clock icon] Monday - Friday, 9:00 AM - 5:00 PM WAT
[Globe icon] agro-chain.com
```

### Section 5 - Social Links

Row of social icons linking to the `socialLinks` array from `models.ts`.

---

## Navigation Updates

### Header (`src/components/Header.tsx`)

The nav links in `models.ts` already include About and Contact. The Header component already
reads from `navLinks`. No changes needed to the Header component itself.

Current `navLinks` in `models.ts`:

```typescript
{ label: "Home", href: "/" },
{ label: "Products", href: "/products" },   // rename to "Marketplace", href: "/marketplace"
{ label: "About Us", href: "/about" },
{ label: "Contact Us", href: "/contact" },
```

Update `models.ts`:

```typescript
export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
```

Also update `sideNavLinks` to match.

### Header Auth CTAs

The Header currently shows "Log In" → `/signin` and "Sign Up" → `/signup`. These routes don't
exist - the auth flow uses `/authentication`. Update:

```typescript
// In Header.tsx
<SecondaryLink href="/authentication" label="Log In" />
<PrimaryLink href="/authentication" label="Get Started" />
```

---

## CSS Variables to Add

Add to `:root` in `globals.css` for landing page use:

```css
/* Landing page specific */
--hero-overlay: rgba(27, 67, 50, 0.85); /* dark green overlay for hero */
--section-dark-bg: #0f1f17; /* near-black green for dark sections */
--card-hover-shadow: 0 8px 30px rgba(27, 67, 50, 0.12);
--stat-number-size: clamp(2.5rem, 5vw, 4rem); /* responsive stat numbers */
```

---

## Animation Strategy

All sections use the existing animation variants from `constants.ts`:

- `FADE_IN_VARIANT` - for text content and cards
- `SLIDE_UP_VARIANT` - for cards entering from below
- `STAGGER_CONTAINER_VARIANT` - for grids of cards (staggered entrance)

Trigger animations on scroll using `whileInView` instead of `animate` for sections below the fold:

```tsx
<motion.div
  variants={STAGGER_CONTAINER_VARIANT}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-100px" }}
>
```

---

## Implementation Order

1. Fix `AppLogo.tsx` (add width/height to Image or use text fallback)
2. Uncomment Header and Footer in `(main-app)/layout.tsx`
3. Update `navLinks` and `sideNavLinks` in `models.ts`
4. Fix Header auth CTA hrefs
5. Build `/` homepage (all 8 sections)
6. Build `/about` (all 6 sections including Meet the Team)
7. Build `/contact`
8. Build `/how-it-works`
9. Write the `LandingPage.md` doc (this file) - done

---

## Files to Create / Modify

| File                                       | Action                          |
| ------------------------------------------ | ------------------------------- |
| `src/app/(main-app)/layout.tsx`            | Uncomment Header + Footer       |
| `src/components/AppLogo.tsx`               | Fix missing Image dimensions    |
| `src/models/models.ts`                     | Update navLinks, fix auth hrefs |
| `src/components/Header.tsx`                | Fix auth CTA hrefs              |
| `src/app/(main-app)/page.tsx`              | Full rebuild - 8 sections       |
| `src/app/(main-app)/about/page.tsx`        | Create - 6 sections             |
| `src/app/(main-app)/how-it-works/page.tsx` | Create - 4 sections             |
| `src/app/(main-app)/contact/page.tsx`      | Create - 5 sections             |
| `src/app/globals.css`                      | Add 4 landing page CSS vars     |

---

## Assets Needed

| Asset                                 | Source                           | Used In                           |
| ------------------------------------- | -------------------------------- | --------------------------------- |
| `public/Home_Image_1/Home_1.webp`     | Already in repo                  | Hero background overlay           |
| `public/Home_Image_1/original-*.webp` | Already in repo                  | About page Our Story section      |
| `public/Home_Image_1/strategic.webp`  | Already in repo                  | How It Works dark section         |
| Farm/catfish pond photo               | Need to source (Unsplash/Pexels) | Hero background                   |
| Team member photos                    | Need from team                   | About - Meet the Team             |
| Fish type icons/illustrations         | Need to source or use emoji      | Browse by Category section        |
| Dashboard screenshots                 | Take from running app            | Marketplace Preview, About Values |

---

## Auth Flow Restructure

### Current State - What Exists and What's Wrong

The current auth flow has four pages:

```
/authentication  - role picker (farmer or buyer), calls /api/auth/role, then redirects to /login or /register?role=X
/login           - email + password → OTP → verify → dashboard redirect
/register        - reads ?role= from URL, submits with role in body, OTP → verify → dashboard
/forgot-password - email → OTP → reset password
/verify          - BVN verification (post-registration)
```

The `/authentication` page exists because the original design wanted to capture role before
splitting into login vs register. It does two things:

1. Calls `POST /api/auth/role` which forwards to `POST /api/backend/auth/role` - this sets a
   `pending_role` cookie on the backend
2. Redirects to `/login?role=X` or `/register?role=X`

**The problems:**

- It's an extra step that adds friction before the user even gets to sign up
- The role cookie call is redundant - `register/page.tsx` already sends `role` in the POST body
  to `/api/auth/register` (line: `body: JSON.stringify({ ..., role })`)
- The backend already receives role in the register payload - the cookie is belt-and-suspenders
  that isn't needed
- `/login` doesn't use role at all - login is role-agnostic, the backend returns the user's role
  after OTP verification and the frontend redirects accordingly
- From the marketing homepage, CTAs like "Join as a Farmer" and "Join as a Buyer" need to go
  directly to a register page with the role pre-selected, not through an intermediate picker

---

### Recommended New Auth Structure

**Remove `/authentication` entirely.** Replace it with direct links that carry role as a query
param to `/register`.

```
/login           - unchanged, works fine as-is
/register        - add a role selector at the top if ?role= is not in the URL
/forgot-password - unchanged
/verify          - unchanged
```

**New entry points from the marketing site:**

| CTA                        | Destination                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------- |
| "Join as a Farmer"         | `/register?role=farmer`                                                            |
| "Join as a Cluster Farmer" | `/register?role=farmer` (cluster status is applied for later, not at registration) |
| "Start Buying"             | `/register?role=buyer`                                                             |
| "Get Started" (generic)    | `/register` (role selector shown inline)                                           |
| "Log In"                   | `/login`                                                                           |
| "Browse Marketplace"       | `/marketplace` (no auth required)                                                  |

---

### What Changes in `/register`

The register page already reads `?role=` from the URL via `useSearchParams`. The only change
needed is handling the case where no role is in the URL - show a role selector at the top of
the form instead of redirecting to `/authentication`.

**Current behavior:**

```typescript
const role = (searchParams.get("role")?.toLowerCase() || "") as Role;
// If role is empty string, the form still renders but role is never sent
```

**New behavior - add role selector when no ?role= param:**

```tsx
// At the top of the form, before the fields:
{
  !role && (
    <div className="flex flex-col gap-2">
      <label className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
        I am a...
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setSelectedRole("farmer")}
          className={`rounded-2xl border p-4 text-left transition ${
            selectedRole === "farmer"
              ? "border-(--theme-green-dark) bg-green-50"
              : "border-(--border-gray) hover:bg-(--gray-bg)"
          }`}
        >
          <p className="font-ubuntu font-semibold text-(--heading-colour)">Farmer</p>
          <p className="font-roboto-slab text-xs text-(--text-colour)">I grow and sell catfish</p>
        </button>
        <button
          type="button"
          onClick={() => setSelectedRole("buyer")}
          className={`rounded-2xl border p-4 text-left transition ${
            selectedRole === "buyer"
              ? "border-(--theme-green-dark) bg-green-50"
              : "border-(--border-gray) hover:bg-(--gray-bg)"
          }`}
        >
          <p className="font-ubuntu font-semibold text-(--heading-colour)">Buyer</p>
          <p className="font-roboto-slab text-xs text-(--text-colour)">I buy catfish in bulk</p>
        </button>
      </div>
    </div>
  );
}
```

Add `selectedRole` state that falls back to the URL param:

```typescript
const [selectedRole, setSelectedRole] = useState<Role>(
  (searchParams.get("role")?.toLowerCase() as Role) || "",
);
```

Use `selectedRole` everywhere `role` was used. The form submit already sends role in the body -
no other changes needed.

---

### What to Do With `/authentication`

**Option A (recommended): Delete it.** It serves no purpose once `/register` handles the inline
role selector. Update all links that point to `/authentication` to point to `/register` instead.

**Option B: Keep it as a redirect.** If you want to preserve the URL for any existing links or
bookmarks, turn it into a simple redirect:

```typescript
// src/app/(auth)/authentication/page.tsx
import { redirect } from "next/navigation";
export default function AuthenticationPage() {
  redirect("/register");
}
```

---

### What to Do With `POST /api/auth/role`

The `/api/auth/role` proxy route forwards to the backend's `POST /auth/role` endpoint which sets
a `pending_role` cookie. This was used to tell the backend what role to assign during registration.

Since `register/page.tsx` already sends `role` in the request body directly to `/api/auth/register`,
the role cookie is redundant. The backend should use the `role` field from the register body, not
the cookie.

**Frontend change:** Remove the `POST /api/auth/role` call from `register/page.tsx`:

```typescript
// Remove this block from onSubmit in register/page.tsx:
await fetch("/api/auth/role", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ role }),
});
```

The register payload already includes `role` - the backend just needs to use it.

**Backend note:** Confirm that `POST /auth/register` reads `role` from the request body and
assigns it to the user. If it currently relies on the `pending_role` cookie, update it to read
from the body instead. The body already has it.

**After confirming the backend uses body role:** Delete `src/app/api/auth/role/route.ts`.

---

### Complete Auth Page Inventory After Restructure

| Route                       | Status             | Notes                                                               |
| --------------------------- | ------------------ | ------------------------------------------------------------------- |
| `/login`                    | Keep as-is         | Works correctly                                                     |
| `/register`                 | Update             | Add inline role selector for no-param case; remove role cookie call |
| `/forgot-password`          | Keep as-is         | Works correctly                                                     |
| `/verify`                   | Keep as-is         | BVN verification post-registration                                  |
| `/authentication`           | Delete or redirect | Replaced by inline role selector on /register                       |
| `/api/auth/role`            | Delete             | Redundant once register body sends role                             |
| `/api/auth/login`           | Keep               | Proxy works                                                         |
| `/api/auth/login/otp`       | Keep               | Sets httpOnly cookies correctly                                     |
| `/api/auth/register`        | Keep               | Proxy works                                                         |
| `/api/auth/register/otp`    | Keep               | Sets httpOnly cookies correctly                                     |
| `/api/auth/logout`          | Keep               | Clears cookies correctly                                            |
| `/api/auth/me`              | Keep               | Used by auth context                                                |
| `/api/auth/forgot-password` | Keep               | Works                                                               |
| `/api/auth/verify`          | Keep               | BVN verification                                                    |

---

### Header Auth CTA Updates

The existing `Header.tsx` has:

```tsx
<SecondaryLink href="/signin" label="Log In" />
<PrimaryLink href="/signup" label="Sign Up" />
```

`/signin` and `/signup` don't exist. Update to:

```tsx
<SecondaryLink href="/login" label="Log In" />
<PrimaryLink href="/register" label="Get Started" />
```

---

### What You're Not Missing - Full Checklist

Going through everything systematically:

**Auth pages:**

- [x] Login - exists, works
- [x] Register - exists, needs inline role selector
- [x] Forgot password - exists, works
- [x] OTP verify (login) - exists, works
- [x] OTP verify (register) - exists, works
- [x] BVN verify - exists at `/verify`
- [ ] Reset password - `/forgot-password` handles this in step 2 (OTP → new password)
- [ ] Logout - handled via `authService.logout()` in the dashboard nav, no dedicated page needed

**Marketing pages:**

- [ ] `/` - needs full rebuild
- [ ] `/about` - needs to be created
- [ ] `/how-it-works` - needs to be created
- [ ] `/contact` - needs to be created
- [x] `/marketplace` - exists, public
- [x] `/support` - exists
- [x] `/privacy` - exists
- [x] `/terms` - exists

**Things that are missing that you haven't mentioned:**

1. **`/register/success` or post-registration flow** - after OTP verification, the user lands
   directly on their dashboard. There's no welcome/onboarding screen. Consider a one-time
   "Welcome to Agro-chain" modal or page that explains what to do next (complete profile,
   create first listing, etc.). This is optional but improves activation.

2. **Auth layout header** - `src/app/(auth)/layout.tsx` likely has no header or a minimal one.
   The auth pages should show the Agro-chain logo that links back to `/` so users can escape
   back to the marketing site if they landed on login/register by mistake.

3. **`/marketplace` needs a "Log in to buy" prompt** - currently the marketplace is fully public
   but adding to cart requires auth. When an unauthenticated user clicks "Add to Cart", they
   should be redirected to `/login?redirect=/marketplace/[id]` and after login, returned to
   where they were. The `redirect` query param handling needs to be added to the login page.

4. **`/register` title** - currently shows `Create Account farmer` (with the raw role value).
   Should be `Create Account` with a subtitle like "Joining as a Farmer" or "Joining as a Buyer".

5. **`/login` has no link to `/register`** - it does actually (line: "Don't have an account?
   Register"). But the register link goes to `/register` without a role param, which currently
   renders with an empty role. This will be fixed by the inline role selector.

6. **`/register` has no link to `/login`** - add "Already have an account? Log in" below the
   submit button.

7. **Social login** - not in scope for now, but worth noting as a future addition (Google OAuth
   is common for B2B platforms in Nigeria).

8. **Email confirmation resend** - if a user registers but closes the tab before verifying OTP,
   there's no way to re-trigger the OTP without starting registration again. Consider a
   `/verify-email?email=X` page that just shows the OTP input and resend button.

---

### Implementation Order for Auth Restructure

1. Update `register/page.tsx` - add inline role selector, remove role cookie call, fix title
2. Update `Header.tsx` - fix auth CTA hrefs (`/signin` → `/login`, `/signup` → `/register`)
3. Delete or redirect `/authentication/page.tsx`
4. Delete `/api/auth/role/route.ts` (after confirming backend uses body role)
5. Add `?redirect=` handling to `login/page.tsx` for post-login redirect
6. Add "Already have an account? Log in" link to `register/page.tsx`
7. Add Agro-chain logo link to `(auth)/layout.tsx`
