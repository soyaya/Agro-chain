type SessionPayload = {
  userId?: string;
  email?: string;
  role?: string;
  exp: number;
};

const FALLBACK_SECRET = "agro-chain-dev-secret";

function getSecret() {
  return process.env.AUTH_SESSION_SECRET || FALLBACK_SECRET;
}

function toBase64Url(input: string) {
  return btoa(input)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
}

async function sign(value: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(value),
  );
  const signatureText = Array.from(new Uint8Array(signature))
    .map((b) => String.fromCharCode(b))
    .join("");
  return toBase64Url(signatureText);
}

export async function createSessionToken(data: Record<string, unknown>) {
  const payload: SessionPayload = {
    userId: typeof data.userId === "string" ? data.userId : undefined,
    email: typeof data.email === "string" ? data.email : undefined,
    role: typeof data.role === "string" ? data.role : undefined,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };

  const encoded = toBase64Url(JSON.stringify(payload));
  const signature = await sign(encoded);
  return `${encoded}.${signature}`;
}

export async function verifyToken(token: string) {
  const [encoded, receivedSignature] = token.split(".");
  if (!encoded || !receivedSignature) {
    throw new Error("Invalid token format");
  }

  const expectedSignature = await sign(encoded);
  if (receivedSignature !== expectedSignature) {
    throw new Error("Invalid token signature");
  }

  const payload = JSON.parse(fromBase64Url(encoded)) as SessionPayload;
  if (!payload.exp || payload.exp < Date.now()) {
    throw new Error("Token expired");
  }

  return payload;
}
