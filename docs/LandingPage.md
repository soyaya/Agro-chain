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
  section with `bg-heading-colour` or a near-black background
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
  return <span className="font-ubuntu text-theme-green-dark text-xl font-bold">Agro-chain</span>;
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
- Background: `bg-theme-green-dark` with a `bg-[url('/Home_Image_1/Home_1.webp')]` overlay
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
- Numbers in `font-ubuntu text-5xl font-bold text-theme-green-dark`
- Labels in `font-roboto-slab text-sm text-text-colour`
- Thin top/bottom border to separate from adjacent sections

---

### Section 3 - How It Works

**Visual reference:** `strategic.webp` numbered cards + `original-f86465469d037b98c639b280a5ce1b6d.webp` alternating rows

**Layout:** Dark section (`bg-heading-colour` or `#0f1f17`). Small-caps section label top-left.
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
- Number badge: `h-8 w-8 rounded-full bg-theme-green-dark text-white text-sm font-bold`
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

- Cards: `rounded-2xl border border-gray-border bg-(--white) p-6 shadow-sm`
- Icon container: `h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center`
- Icon: `text-theme-green-dark` at size 24
- Hover: `hover:shadow-md transition-shadow`

---

### Section 5 - Fish Types / Browse by Category

**Layout:** Light gray background (`bg-gray-bg`). Section label + H2. 6-card grid (3 on desktop,
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

**Layout:** Dark green background (`bg-theme-green-dark`). Section label + H2 centered.
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

Card style: `rounded-2xl border border-gray-border bg-(--white) p-6 text-center shadow-sm`

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
      <label className="font-roboto-slab text-heading-colour text-sm font-medium">I am a...</label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setSelectedRole("farmer")}
          className={`rounded-2xl border p-4 text-left transition ${
            selectedRole === "farmer"
              ? "border-theme-green-dark bg-green-50"
              : "border-gray-border hover:bg-gray-bg"
          }`}
        >
          <p className="font-ubuntu text-heading-colour font-semibold">Farmer</p>
          <p className="font-roboto-slab text-text-colour text-xs">I grow and sell catfish</p>
        </button>
        <button
          type="button"
          onClick={() => setSelectedRole("buyer")}
          className={`rounded-2xl border p-4 text-left transition ${
            selectedRole === "buyer"
              ? "border-theme-green-dark bg-green-50"
              : "border-gray-border hover:bg-gray-bg"
          }`}
        >
          <p className="font-ubuntu text-heading-colour font-semibold">Buyer</p>
          <p className="font-roboto-slab text-text-colour text-xs">I buy catfish in bulk</p>
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

---

## Developer Environment

### `.vscode/settings.json`

Create this file at the root of the frontend project. It enforces consistent formatting and
TypeScript resolution across the team. Sourced from the Stayar-V2 project which already had this
pattern locked in.

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "typescript.autoClosingTags": false
}
```

File path: `frontend/.vscode/settings.json`

---

## Design System Foundations

### Why This Matters

The Stayar-V2 project established a clean token system where every color, spacing value, and layout
width is defined once as a CSS variable, mapped to Tailwind via `@theme inline`, and then usable
as a Tailwind utility class anywhere in the codebase. We adopt the same pattern for Agro-chain.

**The rule:** if you need to write an arbitrary value like `text-[#1b4332]` or `px-[6.25rem]`,
that value should instead be a named token. Use `text-theme-green-dark` and `px-section-py-lg`.

---

### Color Token System

All custom colors are defined in `src/app/globals.css` inside the `:root` block and then mapped
to Tailwind in the `@theme inline` block. This makes them available as `bg-*`, `text-*`,
`border-*`, and `ring-*` utilities.

**Full token table — defined in `:root`, usable in Tailwind:**

| CSS Variable          | Tailwind Class         | Value     | Use                                             |
| --------------------- | ---------------------- | --------- | ----------------------------------------------- |
| `--heading-colour`    | `text-heading-colour`  | `#090909` | All headings (H1–H4)                            |
| `--text-colour`       | `text-text-colour`     | `#6d6a6a` | Body copy, labels                               |
| `--text-colour-2`     | `text-text-colour-2`   | `#393939` | Slightly darker body, FAQ answers               |
| `--text-input`        | `text-text-input`      | `#b3b3b3` | Input placeholder text                          |
| `--gray-bg`           | `bg-gray-bg`           | `#f0faf4` | Alternating section backgrounds                 |
| `--light-gray`        | `bg-light-gray`        | `#e8f5ee` | Nested panels within gray-bg sections           |
| `--border-gray`       | `border-gray-border`   | `#e0e0e0` | Default card/section borders                    |
| `--border-black`      | `border-black-border`  | `#1b1b1b` | Strong emphasis borders                         |
| `--border-input`      | `border-input-border`  | `#d2d2d2` | Input field borders                             |
| `--theme-green-dark`  | `bg-theme-green-dark`  | `#1b4332` | Hero, dark accent sections, primary brand green |
| `--theme-green-light` | `bg-theme-green-light` | `#2d6a4f` | Hover states, secondary green accents           |
| `--section-dark-bg`   | `bg-section-dark`      | `#0f1f17` | How It Works section, near-black green          |
| `--error-red`         | `text-error-red`       | `#ff0000` | Form validation errors                          |
| `--bg-pink`           | `bg-pink`              | `#fff9f8` | Warm off-white for special panels               |
| `--input-field-green` | `bg-input-field-green` | `#1b4332` | Active/filled input state                       |

**How to use in JSX:**

```tsx
// Before (arbitrary value):
<h1 className="text-[#090909]">Title</h1>
<section className="bg-[#f0faf4]">...</section>

// After (named token):
<h1 className="text-heading-colour">Title</h1>
<section className="bg-gray-bg">...</section>
```

---

### Spacing Token System

Section-level spacing is defined as CSS variables and mapped to Tailwind spacing utilities via
`@theme inline`. This means you never write hardcoded padding values for page-level sections.

**Token definitions in `:root`:**

```css
--navbar-h: 5rem;
--dash-sidebar-width: 15rem;

--section-px: 1rem; /* mobile horizontal padding */
--section-px-sm: 1.5rem; /* tablet horizontal padding */
--section-px-lg: 2rem; /* desktop horizontal padding */

--section-py: 2rem; /* mobile vertical padding */
--section-py-sm: 2.5rem; /* tablet vertical padding */
--section-py-lg: 6.25rem; /* desktop vertical padding — DO NOT reduce, this is what gives sections air */
```

**Tailwind utilities generated:**

| CSS Variable           | Tailwind Utility                           | Use                                   |
| ---------------------- | ------------------------------------------ | ------------------------------------- |
| `--navbar-h`           | `h-navbar-h`, `mt-navbar-h`, `pt-navbar-h` | Offset content below the fixed header |
| `--section-px`         | `px-section-px`                            | Mobile section horizontal padding     |
| `--section-px-sm`      | `sm:px-section-px-sm`                      | Tablet breakpoint horizontal padding  |
| `--section-px-lg`      | `lg:px-section-px-lg`                      | Desktop horizontal padding            |
| `--section-py`         | `py-section-py`                            | Mobile section vertical padding       |
| `--section-py-sm`      | `sm:py-section-py-sm`                      | Tablet vertical padding               |
| `--section-py-lg`      | `lg:py-section-py-lg`                      | Desktop vertical padding              |
| `--dash-sidebar-width` | `w-dash-sidebar`, `ml-dash-sidebar`        | Dashboard sidebar width offset        |

**Standard section padding pattern:**

```tsx
<section>
  <div className="px-section-px py-section-py sm:px-section-px-sm sm:py-section-py-sm lg:px-section-px-lg lg:py-section-py-lg">
    {/* section content */}
  </div>
</section>
```

Or with hardcoded lg overrides where the design calls for it (Stayar also does this):

```tsx
<div className="px-4 py-10 lg:px-25 lg:py-25">
```

Both patterns are acceptable. Prefer the token-based one for new sections to keep spacing
consistent if the variables are ever adjusted.

---

### Layout Component Classes

Five width classes are defined in `src/app/globals.css` under `@layer components`. Use these
instead of writing `mx-auto max-w-[...]` on every container. They are always centered and
full-width up to their max.

| Class                     | Max Width         | Use                                                            |
| ------------------------- | ----------------- | -------------------------------------------------------------- |
| `.layout-max-width`       | 1440px            | Outermost page wrapper — wrap the entire layout in this        |
| `.content-width`          | 1200px            | Content area inside a layout (replaces `.container-max-width`) |
| `.container-max-width`    | 1200px            | Legacy alias for `.content-width` — kept for backwards compat  |
| `.form-width`             | 512px             | Auth pages, modal forms, standalone input forms                |
| `.card-width`             | 384px             | Individual cards, panels, confirmation modals                  |
| `.narrow-width`           | 320px             | Tight sidebars, minimal containers                             |
| `.default-page-max-width` | 400px (max-w-100) | Legacy — kept for existing dashboard pages                     |

**Usage pattern in a page layout:**

```tsx
<div className="layout-max-width">
  <Header />
  <main>
    {/* each section's inner div gets content-width or the section-px utilities */}
    <section className="bg-gray-bg">
      <div className="content-width px-4 py-10 lg:px-25 lg:py-25">{/* content */}</div>
    </section>
  </main>
  <Footer />
</div>
```

---

### Background Color & Section Rhythm

**Why `--gray-bg` is `#f0faf4` and not `#f7f7f7`:**

The original gray (`#f7f7f7`) is generic neutral — it creates alternating sections but doesn't
feel intentionally agricultural. The new value `#f0faf4` is a very faint green tint. Visitors
won't consciously register it as green, but it subconsciously ties every section to the brand
color. The dark hero sections are explicitly green. The light alternating sections are barely-green.
Nothing on the page is "neutral" — the whole visual system breathes the brand.

`--light-gray: #e8f5ee` is slightly deeper — use it for panels or cards nested inside a
`bg-gray-bg` section, so there's still a hierarchy without going all the way to white.

**Section color rotation pattern for the homepage:**

```
Section 1 - Hero:                bg-theme-green-dark (dark green, full bleed image)
Section 2 - Impact Stats:        bg-white
Section 3 - How It Works:        bg-section-dark (near-black green)
Section 4 - Why Agro-chain:      bg-white
Section 5 - Browse by Category:  bg-gray-bg (#f0faf4 green tint)
Section 6 - Marketplace Preview: bg-white
Section 7 - Testimonials:        bg-theme-green-dark (dark green)
Section 8 - Final CTA Banner:    gradient from --theme-green-dark to --theme-green-light
```

This creates a rhythmic alternation: dark → white → near-black → white → tinted → white →
dark → gradient. No section looks like the one before it.

---

### Dark Mode Decision

**Decision: No dark/light toggle. Not now.**

Reasons:

- The brand green (`#1b4332`) is already a dark color. On a dark background it disappears —
  you'd need a completely different green token set for dark mode.
- Marketplace/agri platforms work best on white. Product images and listing cards pop on white
  backgrounds, not dark ones.
- The design already has built-in dark-light rhythm through the intentional dark sections
  (hero, how-it-works, testimonials). This IS the contrast — it's layout-level, not a user toggle.
- Nigerian reference platforms (Paystack, Flutterwave, Farmcrowdy) are all light-mode. Users
  are not expecting a dark toggle here.

**Dashboard dark mode — future consideration:**
Dashboard users (admin, cluster farmers) stare at the UI for hours. Dark mode makes more sense
there. This is deferred to a future phase and should NOT influence landing page decisions.

The `.dark` class block in `globals.css` comes from the shadcn preset and is kept in place but
is not actively used. Do not wire it to a toggle on the landing page or marketplace.

---

### Section Anatomy Standard

Every section on the marketing pages follows this structure. Not every field is required, but
the order is fixed when fields are present:

```
[Section label]      — small caps, text-theme-green-dark, optional (not every section needs it)
[H2]                 — always present, font-ubuntu
[Subheading]         — 1–2 sentences, font-roboto-slab, text-text-colour, always present
[Content block]      — cards / grid / timeline / listing preview
[CTA]                — optional but explicit — state the label and destination in the spec
```

**Sections missing CTAs that should have them:**

| Section                    | Suggested CTA        | Destination     |
| -------------------------- | -------------------- | --------------- |
| Section 2 — Impact Stats   | "See how it works →" | `/how-it-works` |
| Section 4 — Why Agro-chain | "Get Started Free →" | `/register`     |
| Section 7 — Testimonials   | "Join them →"        | `/register`     |

Section 6 (Marketplace Preview) already has "View All Listings →" → `/marketplace`. This is the
correct pattern — every section that sells a feature should have an exit.

---

## SectionFAQ Component

### Pattern Overview

The FAQ section is a fully dynamic, reusable component. It accepts a typed array of FAQ objects
and renders an animated accordion. Place it on any page by importing the component and passing
the relevant array. No hardcoded questions inside the component.

This pattern is adapted from the Stayar-V2 `SectionFAQ.tsx` component (stored in `docs/FAQ.md`
as the reference implementation).

---

### The FAQ Type

Define in `src/models/models.ts` (or wherever the page data arrays live):

```typescript
export type FAQ = {
  question: string;
  answer: string;
};
```

---

### FAQ Arrays

Each page gets its own named array. These live in `src/models/models.ts` alongside `navLinks`,
`socialLinks`, etc.

```typescript
// Homepage FAQs - general platform questions
export const homeFaqs: FAQ[] = [
  {
    question: 'Do I need an account to browse the marketplace?',
    answer:
      'No. The marketplace is fully public. You can browse all listings, view prices, and read seller details without logging in. An account is only needed when you add to cart or checkout.',
  },
  {
    question: 'How are prices set on Agro-chain?',
    answer:
      'All prices are set platform-wide by admin — not by individual sellers. This means no price negotiation, no hidden costs, and the same fair price for every buyer.',
  },
  {
    question: 'How do I know a seller is genuine?',
    answer:
      'All cluster farmers are KYC-verified and admin-approved before they can list. Every listing is tied to a verified farmer and their cluster farmer. Full chain of custody is visible.',
  },
  {
    question: 'What payment methods are accepted?',
    answer:
      'Payments are processed via Paystack — card and bank transfer. Funds are held in escrow until you confirm delivery, so your money is protected.',
  },
  {
    question: 'How long does delivery take?',
    answer:
      'Delivery timelines depend on the cluster farmer and your location. Each listing shows the seller's state and warehouse location. Contact details are available after checkout.',
  },
];

// How It Works page — role-specific FAQs
export const farmerFaqs: FAQ[] = [
  {
    question: 'How long does cluster approval take?',
    answer: 'Cluster farmers are expected to review listings within 24–48 hours of submission.',
  },
  {
    question: 'What happens if my listing is rejected?',
    answer:
      'Your cluster farmer will include a reason with the rejection. Fix the issue and resubmit — common reasons are inaccurate weight, wrong fish type, or missing harvest date.',
  },
  {
    question: 'Can I list multiple fish types?',
    answer:
      'Yes. You can create separate listings for each fish type you have available. Each listing is reviewed independently.',
  },
  {
    question: 'When do I get paid?',
    answer:
      'After a buyer confirms delivery, the payout is released from escrow to your cluster farmer, who distributes to you based on your agreed terms.',
  },
];

export const clusterFarmerFaqs: FAQ[] = [
  {
    question: 'How do I apply for cluster farmer status?',
    answer:
      'Submit your CAC certificate, BVN, and warehouse location through the registration flow. Admin reviews applications and approves within 3–5 business days.',
  },
  {
    question: 'How are farmers assigned to me?',
    answer:
      'Farmers in your geographic area are automatically assigned to your cluster. You can see and manage all your assigned farmers from your dashboard.',
  },
  {
    question: 'When do I receive my payout?',
    answer:
      'Payouts are released after a buyer confirms delivery. The exact timing depends on the escrow delay window selected at listing creation.',
  },
];

export const buyerFaqs: FAQ[] = [
  {
    question: 'Do I need an account to browse?',
    answer:
      'No. Browsing, filtering, and viewing listings is fully public. You only need an account to add to cart or checkout.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'Paystack — card or bank transfer. Funds are held in escrow until you confirm delivery.',
  },
  {
    question: 'What if my order doesn\'t arrive?',
    answer:
      'Do not confirm delivery until your order actually arrives and you are satisfied. Escrow funds are only released after your confirmation. Contact support if there is a dispute.',
  },
  {
    question: 'Can I order from multiple sellers in one cart?',
    answer:
      'Currently each order is tied to one cluster farmer. For multi-seller orders, place separate orders per seller.',
  },
];

// About page FAQs — company, mission, platform background
export const aboutFaqs: FAQ[] = [
  {
    question: 'What is Agro-chain?',
    answer:
      'Agro-chain is a digital marketplace that connects verified catfish farmers and cluster aggregators with bulk buyers across Nigeria — bringing transparency, fair pricing, and secure payments to a ₦500B+ informal industry.',
  },
  {
    question: 'Who is behind Agro-chain?',
    answer:
      'Agro-chain was built by a team that saw how informal catfish trading was hurting both farmers and buyers — opaque prices, unreliable logistics, and unverified sellers. We built the platform to change that.',
  },
  {
    question: 'What states does Agro-chain cover?',
    answer:
      'We currently cover 6 states across Nigeria with verified cluster farmers on the ground. We are expanding based on demand — submit a demand request if your state isn\'t listed yet.',
  },
  {
    question: 'Is Agro-chain only for catfish?',
    answer:
      'Currently yes — catfish, fingerlings, juveniles, table size, jumbo, and parent stocks. We chose to go deep on one protein before expanding. Other fish types may follow based on platform growth.',
  },
  {
    question: 'How does Agro-chain make money?',
    answer:
      'A small platform fee is applied at checkout. This is included in the admin-set pricing — there are no hidden fees added at payment time.',
  },
];

// Contact page FAQs — support, partnership, response times
export const contactFaqs: FAQ[] = [
  {
    question: 'How quickly will you respond to my message?',
    answer:
      'We respond to all inquiries within 24 hours on business days (Monday–Friday, 9am–5pm WAT). WhatsApp messages are typically faster.',
  },
  {
    question: 'I\'m a buyer and my order has a problem. Who do I contact?',
    answer:
      'Contact us via WhatsApp (+234 701 228 8798) for the fastest response on order issues. Include your order ID and a brief description of the problem.',
  },
  {
    question: 'I\'m a farmer and want to join the platform. What do I do?',
    answer:
      'Register at /register?role=farmer. After registration you\'ll be assigned to a cluster farmer in your area. They will guide you through your first listing.',
  },
  {
    question: 'I want to partner with Agro-chain as an organisation or logistics provider.',
    answer:
      'Send a partnership inquiry through the contact form selecting "Partnership" as the subject. Our team will review and respond within 2–3 business days.',
  },
  {
    question: 'Is there a phone number I can call?',
    answer:
      'Yes — +234 701 228 8798, available Monday–Friday, 9am–5pm WAT. WhatsApp is preferred for faster support.',
  },
];

// Support page FAQs — mixed general
export const supportFaqs: FAQ[] = [
  ...homeFaqs,
  ...farmerFaqs.slice(0, 2),
  ...buyerFaqs.slice(0, 2),
];
```

---

### The SectionFAQ Component

File: `src/components/SectionFAQ.tsx`

This is a direct adaptation of the Stayar-V2 `SectionFAQ.tsx`. Key differences for Agro-chain:

- Uses `font-ubuntu` and `font-roboto-slab` instead of `font-outfit`
- Uses Agro-chain brand tokens (`text-heading-colour`, `bg-gray-bg`, `border-gray-border`)
- The left column heading/subtext/CTA is configurable via props (not hardcoded)
- `usePathname` from `next/navigation` instead of `useLocation` from `react-router`

---

### Usage in Pages

```tsx
// Homepage (src/app/(main-app)/page.tsx)
import SectionFAQ from '@/components/SectionFAQ';
import { homeFaqs } from '@/models/models';

// Inside the page JSX:
<SectionFAQ
  faqs={homeFaqs}
  heading="Simplifying complex farming questions."
  subtext="Can't find your answer? Reach us directly and we'll respond within 24 hours."
  ctaLabel="Contact Support"
  ctaHref="/contact"
/>

// How It Works page (src/app/(main-app)/how-it-works/page.tsx)
import SectionFAQ from '@/components/SectionFAQ';
import { farmerFaqs } from '@/models/models';

// With role tabs — render conditionally based on active tab:
<SectionFAQ faqs={activeRole === 'farmer' ? farmerFaqs : activeRole === 'cluster' ? clusterFarmerFaqs : buyerFaqs} />

// Support page — already has an FAQ section, swap arrays:
<SectionFAQ faqs={supportFaqs} heading="How can we help?" />
```

---

### SectionFAQ Placement Rule

**SectionFAQ is always the last section before the Footer on every marketing page.**

No exceptions. This means:

| Page            | SectionFAQ array                       | Left column CTA                               |
| --------------- | -------------------------------------- | --------------------------------------------- |
| `/` homepage    | `homeFaqs`                             | "Contact Support" → `/contact`                |
| `/about`        | `aboutFaqs`                            | "Learn more about us" → `/contact`            |
| `/how-it-works` | role-specific array (tabbed or single) | "Get Started" → `/register`                   |
| `/contact`      | `contactFaqs`                          | "WhatsApp us" → `https://wa.me/2347012288798` |
| `/support`      | `supportFaqs`                          | "Contact Us" → `/contact`                     |

The Footer follows immediately after `<SectionFAQ />` in every page's JSX — nothing between them.

---

### Design Decisions in the FAQ Component

1. **Shows 5 items by default, "Show All" button if more** — avoids an overwhelming wall of
   questions on first load. Same as Stayar.

2. **First item opens on mount (`openIndex: 0`)** — gives the visitor immediate visual affordance
   that the items are interactive. Resets to `null` on route change.

3. **Left column is not hardcoded** — `heading`, `subtext`, `ctaLabel`, `ctaHref` are all props
   with sensible defaults. This lets you put the same component on 4 different pages without
   forking the code.

4. **`grid-rows-[0fr] → grid-rows-[1fr]` animation** — the CSS grid row trick for smooth
   height transitions without JavaScript measurements. More performant than `height: auto`
   animation via JS.

5. **The left column CTA** — links to `/contact` by default but can be overridden. On the
   how-it-works page it should link to `/register`. On the support page it can link to WhatsApp.

---

## Complete Implementation Order (All Phases)

This is the canonical top-to-bottom build order for the full landing page project, including
the design system foundations, FAQ component, and all pages.

### Phase 1 — Foundation (do these before any page work)

1. Create `.vscode/settings.json` with the settings above
2. Verify `globals.css` has all Tailwind tokens in `@theme inline` (should be done)
3. Verify `--section-py-lg: 6.25rem` is set (should be done)
4. Verify `--gray-bg: #f0faf4` is set (should be done)
5. Verify layout component classes exist in `@layer components` (should be done)
6. Update `navLinks` and `sideNavLinks` in `models.ts`
7. Add `FAQ` type and all FAQ arrays to `models.ts`
8. Fix `AppLogo.tsx` (add width/height to Image)
9. Uncomment Header and Footer in `(main-app)/layout.tsx`
10. Fix Header auth CTA hrefs (`/signin` → `/login`, `/signup` → `/register`)

### Phase 2 — Shared Components

11. Build `SectionFAQ.tsx` component
12. Test `SectionFAQ` in isolation with `homeFaqs`
13. Confirm Framer Motion is installed (`framer-motion` — already in the project)
14. Confirm animation variants (`FADE_IN_VARIANT`, `SLIDE_UP_VARIANT`, `STAGGER_CONTAINER_VARIANT`)
    are in `constants.ts`

### Phase 3 — Pages (in priority order)

15. Build `/` homepage — all 8 sections
16. Build `/about` — all 6 sections
17. Build `/contact` — all 5 sections
18. Build `/how-it-works` — all 4 sections

### Phase 4 — Auth Restructure

19. Update `register/page.tsx` — inline role selector, remove role cookie call
20. Delete or redirect `/authentication/page.tsx`
21. Delete `/api/auth/role/route.ts` (after backend confirmation)
22. Add `?redirect=` handling to `login/page.tsx`
23. Add "Already have an account? Log in" to `register/page.tsx`
24. Add Agro-chain logo link to `(auth)/layout.tsx`

### Phase 5 — Marketplace Auth Gate

25. Add "Log in to buy" gate to `Add to Cart` in marketplace
26. Implement `/login?redirect=/marketplace/[id]` redirect and return flow

---

## Token Reference Card

Quick lookup for the most-used tokens during landing page development.

**Colors:**

```tsx
// Backgrounds
bg - white; // pure white sections
bg - gray - bg; // #f0faf4 green-tinted alternating sections
bg - theme - green - dark; // #1b4332 hero, testimonials, CTA banner
bg - section - dark; // #0f1f17 how-it-works near-black section

// Text
text - heading - colour; // #090909 all headings
text - text - colour; // #6d6a6a body copy
text - text - colour - 2; // #393939 darker body, FAQ answers
text - white; // white text on dark sections

// Borders
border - gray - border; // #e0e0e0 default borders
border - input - border; // #d2d2d2 form inputs

// Brand accent
text - theme - green - dark; // green text links, section labels
border - theme - green - dark; // active input/card borders
```

**Spacing:**

```tsx
// Section padding (always use all three breakpoints)
px-section-px py-section-py
sm:px-section-px-sm sm:py-section-py-sm
lg:px-section-px-lg lg:py-section-py-lg

// Or the hardcoded equivalent Stayar also uses:
px-4 py-10 lg:px-25 lg:py-25

// Height offset for fixed header
mt-navbar-h   // push content below the navbar
pt-navbar-h   // pad top of first section
```

**Layout widths:**

```tsx
layout - max - width; // 1440px — outermost page wrapper
content - width; // 1200px — section inner container
form - width; // 512px  — auth forms
card - width; // 384px  — cards and modals
```

**Fonts:**

```tsx
font - ubuntu; // headings, labels, buttons, nav links
font - roboto - slab; // body copy, descriptions, FAQ answers
```

---

## What Else — Gaps Not Covered in the Main Spec

These are real items that need handling during or after implementation. None of them are blocking
for the initial build, but all of them affect production readiness or user experience.

---

### 1. Page Metadata / SEO

Every page in Next.js App Router needs an `export const metadata: Metadata` block. Without it,
all pages share the same default title and no OG tags — bad for sharing and search.

Add to each page file:

```tsx
// src/app/(main-app)/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agro-chain | Nigeria's Catfish Marketplace",
  description:
    "Connecting verified catfish farmers to bulk buyers. Secure payments, fair admin-set pricing, and coordinated delivery across Nigeria.",
  openGraph: {
    type: "website",
    url: "https://agro-chain.com",
    title: "Agro-chain | Nigeria's Catfish Marketplace",
    description: "Connecting verified catfish farmers to bulk buyers across Nigeria.",
    images: [{ url: "https://agro-chain.com/images/og-hero.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agro-chain | Nigeria's Catfish Marketplace",
    description: "Connecting verified catfish farmers to bulk buyers across Nigeria.",
    images: ["https://agro-chain.com/images/og-hero.png"],
  },
};
```

Do the same for `/about`, `/how-it-works`, `/contact` — each with unique title and description.

---

### 2. `not-found.tsx` for Marketing Pages

When users land on a broken URL on the marketing site, they should see a branded 404 with CTAs
back to the homepage and marketplace — not Next.js's default white page.

File to create: `src/app/(main-app)/not-found.tsx`

Simple implementation:

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <h1 className="font-ubuntu text-heading-colour text-5xl font-bold">404</h1>
      <p className="font-roboto-slab text-text-colour text-lg">
        This page doesn't exist. Back to safety?
      </p>
      <div className="flex gap-4">
        <Link href="/" className="font-ubuntu text-theme-green-dark text-sm font-medium underline">
          Go Home
        </Link>
        <Link
          href="/marketplace"
          className="font-ubuntu text-theme-green-dark text-sm font-medium underline"
        >
          Browse Marketplace
        </Link>
      </div>
    </div>
  );
}
```

---

### 3. Footer Newsletter/Subscribe Section

The existing `Footer.tsx` has a subscribe section that's currently commented out (mentioned in the
spec as "just needs the subscribe section uncommented"). Add this to the Phase 1 implementation
order — the footer is rendered on every page so it's high impact.

When uncommenting, wire the email input to a console.log or a Formspree endpoint for now, same
pattern as the contact form.

---

### 4. `aria-label` on Every Section

Stayar adds `aria-label` to every `<section>` element for accessibility and screen readers.
Apply the same pattern to every section on every landing page:

```tsx
<section aria-label="Hero Section">
<section aria-label="Impact Stats">
<section aria-label="How It Works">
<section aria-label="Why Agro-chain">
<section aria-label="Browse by Category">
<section aria-label="Marketplace Preview">
<section aria-label="Testimonials">
<section aria-label="Call to Action">
<section aria-label="FAQ Section">  ← already in SectionFAQ component
```

---

### 5. `whileInView` Scroll Animations — Which Sections Get What

The doc mentions using `whileInView` for scroll animations. Here's the explicit plan:

| Section                   | Animation                                     | Variant                                          |
| ------------------------- | --------------------------------------------- | ------------------------------------------------ |
| Hero                      | `animate` (not whileInView — already visible) | `FADE_IN_VARIANT`                                |
| Impact Stats              | `whileInView` stagger                         | `STAGGER_CONTAINER_VARIANT` + `SLIDE_UP_VARIANT` |
| How It Works cards        | `whileInView` stagger                         | `STAGGER_CONTAINER_VARIANT`                      |
| Why Agro-chain cards      | `whileInView` stagger                         | `STAGGER_CONTAINER_VARIANT`                      |
| Browse by Category        | `whileInView` stagger                         | `STAGGER_CONTAINER_VARIANT`                      |
| Marketplace Preview cards | `whileInView` stagger                         | `STAGGER_CONTAINER_VARIANT`                      |
| Testimonials              | `whileInView` stagger                         | `STAGGER_CONTAINER_VARIANT`                      |
| Final CTA                 | `whileInView`                                 | `FADE_IN_VARIANT`                                |

All `whileInView` sections use:

```tsx
viewport={{ once: true, margin: '-100px' }}
```

The `once: true` means the animation fires once and stays — no re-animation on scroll back up.

---

### 6. OG Image Asset

The metadata blocks reference `/images/og-hero.png`. This image needs to exist in `public/images/`.
Recommended: a 1200×630px crop of the hero farm/catfish pond image with the Agro-chain logotype
overlaid. Create this before deploying the landing page publicly.

---

### 7. `robots.txt` and `sitemap.xml`

Next.js App Router has built-in support for both. Create these files:

**`src/app/robots.ts`:**

```ts
import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://agro-chain.com/sitemap.xml",
  };
}
```

**`src/app/sitemap.ts`:**

```ts
import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://agro-chain.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://agro-chain.com/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://agro-chain.com/how-it-works",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://agro-chain.com/contact",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://agro-chain.com/marketplace",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
```

---

### 8. `/register?role=farmer` vs Cluster Farmer CTA

The "How It Works" section has a Card 2 for Cluster Farmers that currently links to
`/register?role=farmer`. This is correct — cluster status is applied for after registration,
not at signup. But the card copy must make this clear:

```
"Start as a Farmer → Apply for Cluster Status after registration"
```

Not confusing if worded right, but easy to miss if not explicitly stated on the card.

---

### 9. `.vscode` — Already Ahead of Stayar

Agro-chain's `.vscode` is already more complete than Stayar's:

- `settings.json` — all Stayar settings + more (auto-save, rulers, sticky scroll, git integration, file nesting)
- `extensions.json` — full recommended extension list (Stayar has none)
- `launch.json` — Next.js debug configs (Stayar has none)
- Added `cSpell.words` for project-specific terms (Stayar has `["STAYAR"]`, ours has 19 terms)
- Tailwind class regex was already in the updated settings (includes `cn()`, `cva()`, `cx()`)

No action needed on `.vscode` beyond what was added above.
