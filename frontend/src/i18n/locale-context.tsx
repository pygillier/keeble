"use client";

import { createContext, useContext } from "react";

import { getDictionary, type Dictionary, type Locale } from "./dictionaries";

const LocaleContext = createContext<Locale | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  const locale = useContext(LocaleContext);
  if (!locale) {
    throw new Error("useLocale/useDictionary must be used within a LocaleProvider");
  }
  return locale;
}

export function useDictionary(): Dictionary {
  return getDictionary(useLocale());
}
