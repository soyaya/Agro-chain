# Auth Endpoints

All auth endpoints are public unless marked as requiring authentication.
OTP length is 6 digits. OTP expires after 10 minutes. Maximum resend attempts is 2 per OTP session. After 2 resends, the user must wait 24 hours before trying again.

---

## Role Selection

The user selects their role before registering. This sets a short-lived cookie on the backend that is read during registration.

**POST /auth/role**

The frontend sends the selected role before navigating to the registration form.

```typescript
// Request body
{
  role: "farmer" | "buyer"
}

// Response
{
  status: "success",
  data: {
    role: "farmer" | "buyer"
  }
}
```

---

## Registration

Registration is a two-step process. The user fills the form and submits, then verifies their email with a 6-digit OTP. After OTP verification, a session is created automatically and the user is redirected to their dashboard without needing to log in again.

**POST /auth/register**

```typescript
// Request body
{
  fullName: string,
  phone: string,       // Nigerian format: 08012345678 or +2348012345678
  email: string,
  location: string,    // Delivery or farm address
  password: string     // Minimum 8 characters
}

// Response
{
  status: "success",
  message: "Registration successful. Please verify your account with the OTP sent to your phone.",
  data: {
    emailAddress: string
  }
}
```

**POST /auth/register/otp**

After the user enters the 6-digit OTP sent to their email, this endpoint verifies it, activates the account, creates a session, and returns the user object with tokens. The frontend uses the role in the response to redirect to the correct dashboard.

```typescript
// Request body
{
  emailAddress: string,
  registerOtp: number  // 6-digit integer
}

// Response
{
  status: "success",
  message: "Account verified successfully.",
  data: {
    user: {
      id: string,
      full_name: string,
      email: string,
      phone_number: string,
      role: "farmer" | "buyer" | "cluster" | "admin" | "pending",
      verification_status: "unverified" | "pending" | "verified" | "rejected",
      profile_completed: boolean,
      is_cluster_farmer: boolean,
      cluster_approved: boolean,
      location_state: string,
      location_lga: string,
      location_address: string,
      profile_photo_url: string | null,
      farm_name: string | null,
      business_name: string | null,
      fish_type_preference: string | null,
      farming_capacity_kg: number | null,
      years_of_experience: number | null,
      cac_number: string | null,
      warehouse_location: string | null,
      distribution_capacity: number | null,
      is_active: boolean,
      last_login: string | null,
      created_at: string,
      updated_at: string
    },
    access_token: string,
    refresh_token: string,
    expires_at: string
  }
}
```

**POST /auth/register/otp/resend**

```typescript
// Request body
{
  emailAddress: string
}

// Response
{
  status: "success",
  message: "OTP resent successfully.",
  data: {
    attemptsRemaining: number  // How many resends are left before lockout
  }
}
```

---

## Login

Login is also a two-step process. The user submits their email and password, receives an OTP on their email, then verifies it to get a session.

**POST /auth/login**

```typescript
// Request body
{
  emailAddress: string,
  password: string
}

// Response
{
  status: "success",
  message: "OTP sent to your email address.",
  data: {
    emailAddress: string,
    role: "farmer" | "buyer" | "cluster" | "admin" | "pending"
  }
}
```

**POST /auth/login/otp**

After OTP verification, the backend creates a session and returns the full user object. The frontend reads the role from the response to redirect to the correct dashboard.

```typescript
// Request body
{
  emailAddress: string,
  loginOtp: number  // 6-digit integer
}

// Response — same shape as register/otp response
{
  status: "success",
  message: "Login successful.",
  data: {
    user: {
      id: string,
      full_name: string,
      email: string,
      phone_number: string,
      role: "farmer" | "buyer" | "cluster" | "admin" | "pending",
      verification_status: "unverified" | "pending" | "verified" | "rejected",
      profile_completed: boolean,
      is_cluster_farmer: boolean,
      cluster_approved: boolean,
      location_state: string,
      location_lga: string,
      location_address: string,
      profile_photo_url: string | null,
      farm_name: string | null,
      business_name: string | null,
      fish_type_preference: string | null,
      farming_capacity_kg: number | null,
      years_of_experience: number | null,
      cac_number: string | null,
      warehouse_location: string | null,
      distribution_capacity: number | null,
      is_active: boolean,
      last_login: string | null,
      created_at: string,
      updated_at: string
    },
    access_token: string,
    refresh_token: string,
    expires_at: string
  }
}
```

**POST /auth/login/otp/resend**

```typescript
// Request body
{
  emailAddress: string
}

// Response
{
  status: "success",
  message: "OTP resent successfully.",
  data: {
    attemptsRemaining: number
  }
}
```

---

## Identity Verification

Requires authentication. The farmer submits their BVN for admin review. This sets verification_status to "pending" until admin approves.

**POST /auth/verify**

```typescript
// Request body
{
  bvn: string,
  creditConsent: boolean
}

// Response
{
  status: "success",
  message: "Identity verification submitted. Admin will review shortly.",
  data: {
    verificationStatus: "pending"
  }
}
```

---

## Forgot Password

**POST /auth/forgot-password**

The backend always returns success even if the email does not exist, to prevent email enumeration.

```typescript
// Request body
{
  emailAddress: string
}

// Response
{
  status: "success",
  message: "OTP sent to your email address."
}
```

**POST /auth/forgot-password/otp**

```typescript
// Request body
{
  emailAddress: string,
  resetOtp: number,    // 6-digit integer
  newPassword: string  // Minimum 8 characters
}

// Response
{
  status: "success",
  message: "Password reset successfully. Please login with your new password."
}
```

**POST /auth/forgot-password/otp/resend**

```typescript
// Request body
{
  emailAddress: string
}

// Response
{
  status: "success",
  message: "OTP resent successfully.",
  data: {
    attemptsRemaining: number
  }
}
```

---

## Session Management

**GET /auth/me**

Requires authentication. Returns the currently logged-in user's full profile. Used on every dashboard load to hydrate the UI.

```typescript
// Response
{
  status: "success",
  data: {
    user: {
      id: string,
      full_name: string,
      email: string,
      phone_number: string,
      role: "farmer" | "buyer" | "cluster" | "admin" | "pending",
      verification_status: "unverified" | "pending" | "verified" | "rejected",
      profile_completed: boolean,
      is_cluster_farmer: boolean,
      cluster_approved: boolean,
      cluster_application_updated_at: string | null,  // Used to enforce 6-month reapplication window
      location_state: string,
      location_lga: string,
      location_address: string,
      profile_photo_url: string | null,
      farm_name: string | null,
      business_name: string | null,
      fish_type_preference: string | null,
      farming_capacity_kg: number | null,
      years_of_experience: number | null,
      cac_number: string | null,
      warehouse_location: string | null,
      distribution_capacity: number | null,
      logistics_available: boolean,
      bvn_doc_url: string | null,
      proof_of_address_url: string | null,
      cac_registration_url: string | null,
      business_license_url: string | null,
      tax_clearance_url: string | null,
      is_active: boolean,
      last_login: string | null,
      created_at: string,
      updated_at: string
    }
  }
}
```

Note: The current backend getMe response does not include `cluster_application_updated_at`, `logistics_available`, `bvn_doc_url`, `proof_of_address_url`, `cac_registration_url`, `business_license_url`, or `tax_clearance_url` in the select. These fields need to be added to the Prisma select in the getMe controller so the farmer profile page can display the correct application status and existing document URLs.

**POST /auth/refresh**

```typescript
// Request body
{
  refresh_token: string
}

// Response
{
  status: "success",
  data: {
    access_token: string,
    refresh_token: string
  }
}
```

**POST /auth/logout**

Requires authentication. Clears the session cookie and invalidates the refresh token.

```typescript
// Request body (optional)
{
  refresh_token: string
}

// Response
{
  status: "success",
  message: "Logged out successfully."
}
```

**POST /auth/logout/all**

Requires authentication. Invalidates all sessions across all devices.

```typescript
// Response
{
  status: "success",
  message: "Logged out of all devices successfully."
}
```
