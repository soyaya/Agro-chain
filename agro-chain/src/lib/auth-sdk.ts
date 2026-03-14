// src/lib/auth-sdk.ts  (temporary mock)
export async function verifyToken(token: string) {
  // In real life: call your shared SDK or JWT verify
  if (token === 'valid-demo-token') {
    return { userId: '123', role: 'buyer' };
  }
  throw new Error('Invalid token');
}

export async function createSessionToken(data: Record<string, unknown>) {
  return 'valid-demo-token'; // in real life → sign JWT
}