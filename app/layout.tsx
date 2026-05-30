import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/components/theme-provider';
import { TopNav } from '@/components/top-nav';
import { WikiSidebar } from '@/components/wiki/sidebar';
import { getNav } from '@/lib/wiki-nav';
import { getLocale, getMessages } from '@/lib/locale';
import { SITE_URL } from '@/lib/site';
import './globals.css';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#1a1d23' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const messages = await getMessages(locale);
  const site = messages.site;

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: site.name, template: `%s · ${site.name}` },
    description: site.description,
    applicationName: site.name,
    keywords: site.keywords,
    authors: [{ name: 'fuergaosi233', url: 'https://github.com/fuergaosi233' }],
    creator: 'fuergaosi233',
    openGraph: {
      type: 'website',
      siteName: site.name,
      title: site.name,
      description: site.description,
      url: SITE_URL,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: site.name,
      description: site.description,
      creator: '@fuergaosi233',
    },
    robots: { index: true, follow: true },
    alternates: {
      canonical: '/',
      types: { 'text/markdown': '/llms.txt' },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages(locale);
  const nav = getNav(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-dvh bg-background text-foreground">
              <TopNav />

              <div className="mx-auto flex max-w-[1400px] gap-0 px-4 lg:px-6">
                <aside className="hidden w-[240px] shrink-0 border-r border-border lg:block">
                  <WikiSidebar nav={nav} />
                </aside>

                <div className="flex min-w-0 flex-1">{children}</div>
              </div>
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
