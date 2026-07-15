import en from "./locales/en";
import fr from "./locales/fr";
import type { Dictionary } from "./locales/en";

export type { Dictionary };

export type Locale = "en" | "fr";

export const locales: Locale[] = ["en", "fr"];
export const defaultLocale: Locale = "en";

export const hasLocale = (locale: string): locale is Locale =>
  (locales as string[]).includes(locale);

const dictionaries: Record<Locale, Dictionary> = { en, fr };

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];
