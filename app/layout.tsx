import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from '@/components/theme-provider';
import { TopNav } from '@/components/top-nav';
import { WikiSidebar } from '@/components/wiki/sidebar';
import { getNav } from '@/lib/wiki-nav';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'multi-agent', 'agent', 'LLM', 'orchestration', 'supervisor', 'handoff',
    'multi-agent system', 'agent pattern', 'AI engineering', 'MCP', 'A2A',
  ],
  authors: [{ name: 'fuergaosi233', url: 'https://github.com/fuergaosi233' }],
  creator: 'fuergaosi233',
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    creator: '@fuergaosi233',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: '/',
    types: { 'text/markdown': '/llms.txt' },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#1a1d23' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Sidebar lives here in the root layout so it persists across navigation —
  // preserving scroll position and avoiding a flash of re-render.
  const nav = getNav();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="font-sans antialiased">
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
      </body>
    </html>
  );
}
