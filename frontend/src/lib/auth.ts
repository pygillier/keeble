import { cache } from "react";

import { serverApiGet } from "@/lib/server-fetch";
import type { Locale } from "@/i18n/dictionaries";

export type SessionUser = {
  id: string;
  email: string;
  display_name: string;
  role: "reader" | "editor";
  family_id: string;
  locale: Locale;
};

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  return serverApiGet<SessionUser>("/auth/me");
});
