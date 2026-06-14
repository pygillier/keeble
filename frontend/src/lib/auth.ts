import { cache } from "react";

import { serverApiGet } from "@/lib/server-fetch";

export type SessionUser = {
  id: string;
  email: string;
  display_name: string;
  role: "reader" | "editor";
  family_id: string;
};

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  return serverApiGet<SessionUser>("/auth/me");
});
