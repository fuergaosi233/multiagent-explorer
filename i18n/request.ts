import { getRequestConfig } from 'next-intl/server';
import { getLocale, getMessages } from '@/lib/locale';

export default getRequestConfig(async () => {
  const locale = await getLocale();
  const messages = await getMessages(locale);
  return { locale, messages };
});
