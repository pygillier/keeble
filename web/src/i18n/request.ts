import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const SUPPORTED_LOCALES = ['en', 'fr', 'de', 'es'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const messageLoaders: Record<Locale, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import('../lib/i18n/en.json'),
  fr: () => import('../lib/i18n/fr.json'),
  de: () => import('../lib/i18n/de.json'),
  es: () => import('../lib/i18n/es.json'),
};

export default getRequestConfig(async () => {
  const cookieLocale = cookies().get('keeble_locale')?.value;
  const locale: Locale =
    cookieLocale && (SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale)
      ? (cookieLocale as Locale)
      : 'en';

  return {
    locale,
    messages: (await messageLoaders[locale]()).default,
  };
});
