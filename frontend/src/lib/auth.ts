import { cache } from "react";
import { cookies } from "next/headers";

import { API_URL } from "@/lib/config";

export type SessionUser = {
  id: string;
  email: string;
  display_name: string;
  role: "reader" | "editor";
  family_id: string;
};

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader) return null;

  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return response.json();
});
