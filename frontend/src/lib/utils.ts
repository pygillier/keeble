import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import type { Locale } from "@/i18n/dictionaries"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
]

const relativeTimeFormatters = new Map<Locale, Intl.RelativeTimeFormat>()

function getRelativeTimeFormatter(locale: Locale): Intl.RelativeTimeFormat {
  let formatter = relativeTimeFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(locale, { numeric: "always" })
    relativeTimeFormatters.set(locale, formatter)
  }
  return formatter
}

export function formatRelativeTime(iso: string, locale: Locale, justNow: string): string {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000

  for (const [unit, unitSeconds] of RELATIVE_UNITS) {
    if (seconds >= unitSeconds) {
      return getRelativeTimeFormatter(locale).format(-Math.floor(seconds / unitSeconds), unit)
    }
  }
  return justNow
}
