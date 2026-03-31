# ENDPOINTS

## Auth routes

1. **Role**: This is to submit the role at the index page:
   - `/auth/role`: POST

```typescript
interface {
 role: string; // buyer or farmer 
}
```

2. **Login**: A 2-step form to submit the login **email-address + password** and a 6-digit OTP verification:
   - `/auth/login`: POST

```typescript
interface {
 emailAddress: string;
 password: string;
}
```

- `/auth/login/otp`: POST

```typescript
interface {
 emailAddress: string;
 loginOtp: number;
}
```

   - `/auth/login/otp/resend`: POST

```typescript
interface {
 emailAddress: string;
}
```

3. **Register**: A form to submit the register payload of the user and verify OTP before login:
   - `/auth/register`: POST

```typescript
interface {
  fullName: string;
  phone: string;
  email: string;
  location: string;
  password: string;
}
```

- `/auth/register/otp`: POST

```typescript
interface {
 emailAddress: string;
 registerOtp: number;
}
```

- `/auth/register/otp/resend`: POST

```typescript
interface {
 emailAddress: string;
}
```

4. **verify**: A form to verify the user&apos;s identity using their **bvn**:
   - `/auth/verify`: POST

```typescript
interface {
  bvn: string;
  creditConsent: boolean;
}
```

5. **Forgot-password**: Submit an email address to receive OTP
   - `/auth/forgot-password`: POST

```typescript
interface {
 emailAddress: string;
}
```

- `/auth/forgot-password/otp`: POST

```typescript
interface {
 emailAddress: string;
 resetOtp: number;
 newPassword: string;
}
```

- `/auth/forgot-password/otp/resend`: POST

```typescript
interface {
 emailAddress: string;
}
```

## Notes
- OTP length: 6 digits
- OTP expiry: 10 minutes
- Max resend attempts: 2 (after that, retry after 24 hours)
- Backend returns HTTP-only session cookie and a bearer token in responses.
