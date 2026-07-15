"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { locales, type Locale } from "@/i18n/dictionaries";

const LANGUAGE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

export function LanguageSelect({ value }: { value: Locale }) {
  const router = useRouter();
  const [locale, setLocale] = useState(value);
  const [saving, setSaving] = useState(false);

  async function handleChange(nextLocale: Locale) {
    setLocale(nextLocale);
    setSaving(true);
    const response = await apiFetch("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify({ locale: nextLocale }),
    });
    setSaving(false);

    if (!response.ok) {
      setLocale(value);
      return;
    }

    router.refresh();
  }

  return (
    <select
      value={locale}
      disabled={saving}
      onChange={(event) => handleChange(event.target.value as Locale)}
      className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-slate outline-none focus-visible:border-ring disabled:opacity-50"
    >
      {locales.map((code) => (
        <option key={code} value={code}>
          {LANGUAGE_LABELS[code]}
        </option>
      ))}
    </select>
  );
}
