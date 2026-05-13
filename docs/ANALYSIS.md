# AgroChain — Remaining Work

> What has already been implemented is removed. This document covers only what still needs to be built.

---

## 1. Login Flow — Email + OTP Only

**What needs to change:**

The current login flow requires email + password, then an OTP. It needs to be simplified to email only, then a 6-digit OTP to that email. No password step.

**Backend (`auth.controller.ts`):**

- `POST /auth/login` currently validates `emailAddress + password` and checks `password_hash`. Change it to accept only `emailAddress`, skip the password check, and immediately send an OTP to the email
- The `password_hash` field on User stays untouched — it can be used for admin login later if needed

**Frontend (`/login/page.tsx`):**

- Remove the password field entirely
- Form is just: email input → submit → OTP step (same 6-digit OTP UI as register)
- After OTP verified, redirect by role:

| Role      | Redirect             |
| --------- | -------------------- |
| `farmer`  | `/farmers-dashboard` |
| `cluster` | `/cluster-dashboard` |
| `buyer`   | `/buyers-dashboard`  |
| `admin`   | `/admin-dashboard`   |
| `pending` | `/authentication`    |

**Frontend (`/api/auth/login/otp/route.ts`):**

- Already uses `forwardAuthAndSetCookies` — no change needed there

---

## 2. Farmer Profile — Cluster Farmer Application

### Frontend (`/farmers-dashboard/profile/page.tsx`)

**Trigger checkbox:**

- Single checkbox: "Apply to become a Cluster Farmer"
- Default: unchecked, cluster section hidden
- When checked: cluster section animates in via `motion.div`
- If `is_cluster_farmer: true` from API → pre-expand and pre-check

**Document upload fields:**

- Replace the 5 boolean checkboxes with real file upload fields:
  - BVN Verification Document → `bvn_doc_url`
  - Proof of Address → `proof_of_address_url`
  - CAC Registration Certificate → `cac_registration_url`
  - Business License → `business_license_url`
  - Tax Clearance Certificate → `tax_clearance_url`
- Upload to Cloudinary, store `secure_url`, show filename after upload
- "Logistics Available" stays as a checkbox

**Status banner:**

- `is_cluster_farmer: true` + `cluster_approved: false` → yellow: "Application under review"
- `cluster_approved: true` → green: "Approved — you are a Cluster Farmer"
- 6-month restriction: show "You can reapply after [date]" if within window

**Submit button:** only enabled when all 5 doc URLs present + text fields filled

### Backend (`admin.controller.ts`)

`approveClusterApplication` must also update `user.role` to `"cluster"` — currently it only sets `cluster_approved: true`. Without this, approved farmers still land on `/farmers-dashboard` on next login.

### Cloudinary Upload Route

`POST /api/upload` needs to exist — accepts a file, uploads to Cloudinary, returns `{ secure_url }`. Check if it exists for listing images first; if so, reuse it.

---

## 3. Admin Dashboard — Wire Existing Pages + Backend Endpoints

### Missing Backend Endpoints (need to be created)

| Endpoint                           | Method | Purpose                             |
| ---------------------------------- | ------ | ----------------------------------- |
| `/admin/demands`                   | GET    | All demands (filter: status, state) |
| `/admin/demands/:id`               | GET    | Demand detail                       |
| `/admin/demands/:id/assign`        | PATCH  | Assign to cluster farmer            |
| `/admin/orders`                    | GET    | All orders (filter: status, type)   |
| `/admin/orders/:id`                | GET    | Order detail                        |
| `/admin/farmers`                   | GET    | All users with filters              |
| `/admin/farmers/:id`               | GET    | Single user detail                  |
| `/admin/farmers/:id/toggle-active` | PATCH  | Activate/deactivate account         |
| `/admin/listings`                  | GET    | All listings with filters           |
| `/admin/listings/:id/flag`         | PATCH  | Flag a listing                      |

### Frontend pages already built — just need endpoints

All admin pages are built and wired to the service layer. Once the backend endpoints above are created, they will work automatically:

- `/admin-dashboard` — metrics + charts + activity feed
- `/admin-dashboard/applications` — cluster applications (approve/reject)
- `/admin-dashboard/demands` — demand queue with assign modal
- `/admin-dashboard/orders` — order management table
- `/admin-dashboard/farmers` — user management
- `/admin-dashboard/listings` — listing oversight
- `/admin-dashboard/settings` — admin profile + config

---

## 4. Summary Table

| Item                                                       | Where                           | Priority |
| ---------------------------------------------------------- | ------------------------------- | -------- |
| Login → email-only + OTP (remove password)                 | Backend + Frontend              | High     |
| Farmer profile — cluster application UI overhaul           | Frontend                        | High     |
| Admin approveClusterApplication → update role to "cluster" | Backend                         | High     |
| Cloudinary upload route for documents                      | Backend/Frontend                | High     |
| Login redirect by role (cluster + admin cases)             | Frontend                        | High     |
| All missing admin backend endpoints                        | Backend                         | High     |
| Admin dashboard pages wired to real data                   | Frontend (ready, needs backend) | Medium   |
