import "server-only";

import { cache } from "react";
import { headers } from "next/headers";

import { getSessionUser, type SessionUser } from "@/lib/auth";
import { defaultLocale, getDictionary, hasLocale, type Locale } from "./dictionaries";

async function localeFromAcceptLanguage(): Promise<Locale> {
  const acceptLanguage = (await headers()).get("accept-language") ?? "";
  const preferred = acceptLanguage.split(",")[0]?.split("-")[0]?.trim();
  return preferred && hasLocale(preferred) ? preferred : defaultLocale;
}

async function resolveLocale(user: SessionUser | null): Promise<Locale> {
  if (user) return user.locale;
  return localeFromAcceptLanguage();
}

/**
 * Resolves the session user, locale, and dictionary once per request.
 * Cached so every server component in the tree can call this without
 * re-parsing headers or re-deriving the locale.
 */
export const getIntl = cache(async () => {
  const user = await getSessionUser();
  const locale = await resolveLocale(user);
  const dict = getDictionary(locale);
  return { user, locale, dict };
});
