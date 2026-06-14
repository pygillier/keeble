/**
 * Client-side fetch wrapper. Uses relative paths so requests stay
 * same-origin (proxied to the backend via Next.js rewrites), which
 * keeps the auth cookies scoped to the frontend's origin.
 */
export async function apiFetch(path: string, init?: RequestInit) {
  return fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}
