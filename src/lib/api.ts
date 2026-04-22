export const BASE_BACKEND_URL =
  process.env.NEXT_PUBLIC_BASE_BACKEND_URL?.trim() ?? "";

const normalizeBase = (base: string) => base.replace(/\/+$/, "");

const normalizePath = (path: string) => (path.startsWith("/") ? path : `/${path}`);

export const buildApiUrl = (path: string) => {
  const base = normalizeBase(BASE_BACKEND_URL);
  const normalizedPath = normalizePath(path);
  return base ? `${base}${normalizedPath}` : normalizedPath;
};

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = buildApiUrl(path);
  const headers = new Headers(options.headers);

  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("auth_token");
    if (token && !headers.has("authorization")) {
      headers.set("authorization", `Bearer ${token}`);
    }
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && ("message" in data || "error" in data)
        ? (data.message || data.error)
        : null) ??
      (typeof data === "string" && data.length > 0 ? data : null) ??
      response.statusText;

    throw new ApiError(message, response.status);
  }

  return data as T;
}
