export const BASE_BACKEND_URL =
  process.env.BASE_BACKEND_URL?.trim() ?? process.env.NEXT_PUBLIC_BASE_BACKEND_URL?.trim() ?? "";

const normalizeBase = (base: string) => base.replace(/\/+$/, "");
const normalizePath = (path: string) => (path.startsWith("/") ? path : `/${path}`);

export const buildApiUrl = (path: string) => {
  const base = normalizeBase(BASE_BACKEND_URL).replace(/\/api$/, "");
  const normalizedPath = normalizePath(path);
  return base ? `${base}/api${normalizedPath}` : normalizedPath;
};

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// The access token JWT is short-lived (hours), but its cookie and the paired
// refresh-token cookie live for days — without this, any request made after
// the JWT itself expires surfaces as a hard "Invalid or expired session"
// even though the user never logged out. On a 401, silently try /auth/refresh
// once (which rotates both cookies) and retry the original request before
// giving up. Concurrent 401s share one in-flight refresh instead of each
// racing their own.
let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(buildApiUrl("/auth/refresh"), {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function doFetch(url: string, options: RequestInit, headers: Headers): Promise<Response> {
  try {
    return await fetch(url, { ...options, headers, credentials: "include" });
  } catch (networkError) {
    // Network failure (backend down, no connection, CORS preflight blocked, etc.)
    throw new ApiError("Unable to reach the server. Please check your connection or try again later.", 0);
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = buildApiUrl(path);
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response = await doFetch(url, options, headers);

  const isAuthRoute = path.startsWith("/auth/");
  if (response.status === 401 && !isAuthRoute) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      response = await doFetch(url, options, headers);
    }
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && ("message" in data || "error" in data)
        ? (data as Record<string, string>).message || (data as Record<string, string>).error
        : null) ??
      (typeof data === "string" && data.length > 0 ? data : null) ??
      response.statusText;

    throw new ApiError(message, response.status);
  }

  return data as T;
}
