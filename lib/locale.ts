import { cookies } from 'next/headers';
import { defaultLocale, locales, type Locale } from '@/i18n/routing';

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value ?? defaultLocale;
  return locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
}

export async function getMessages(locale?: Locale) {
  const resolved = locale ?? (await getLocale());
  return (await import(`@/messages/${resolved}.json`)).default;
}
