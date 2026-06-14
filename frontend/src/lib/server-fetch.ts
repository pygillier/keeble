import { cookies } from "next/headers";

import { API_URL } from "@/lib/config";

/**
 * Server-side GET against the backend API, forwarding the current request's
 * cookies for auth. Returns null if unauthenticated or the request fails.
 */
export async function serverApiGet<T>(path: string): Promise<T | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader) return null;

  const response = await fetch(`${API_URL}/api${path}`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return response.json();
}
