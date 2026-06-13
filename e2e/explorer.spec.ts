import { expect, test } from '@playwright/test';

test.describe('Multi-Agent Wiki', () => {
  test('home page renders with sidebar nav', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1', { hasText: 'Multi-Agent Wiki' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Taxonomy' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Decision Matrix' }).first()).toBeVisible();
  });

  test('navigating to taxonomy renders content', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Taxonomy' }).first().click();
    await expect(page).toHaveURL(/\/taxonomy$/);
    await expect(page.locator('h1', { hasText: /Taxonomy/ })).toBeVisible();
    await expect(page.locator('table').first()).toBeVisible();
  });

  test('pattern wiki page embeds the live visualization', async ({ page }) => {
    await page.goto('/patterns/supervisor-manager');
    await expect(page.locator('h1', { hasText: /Supervisor/ })).toBeVisible();
    // Live visualization widget mounted
    await expect(page.locator('.canvas-wrap svg.diagram')).toBeVisible();
    await expect(page.locator('.canvas-wrap svg.diagram .node').first()).toBeVisible();
    await expect(page.locator('.controls button.primary')).toBeVisible();
  });

  test('every pattern page mounts an animated live visualization', async ({ page }) => {
    // The 16 previously-static patterns now have full animation data too.
    for (const slug of ['marl-ctde', 'stigmergy-environment-mediated', 'voting-ensemble', 'composite-pattern']) {
      await page.goto(`/patterns/${slug}`);
      await expect(page.locator('.canvas-wrap svg.diagram')).toBeVisible();
      await expect(page.locator('.controls button.primary')).toBeVisible();
    }
  });

  test('sidebar nav is grouped by category for patterns', async ({ page }) => {
    await page.goto('/');
    // Sub-category headers inside the Patterns section
    await expect(page.locator('text=Control').first()).toBeVisible();
    await expect(page.locator('text=Information').first()).toBeVisible();
    await expect(page.locator('text=Decision').first()).toBeVisible();
  });

  test('right-side TOC appears on wide viewports', async ({ page }) => {
    await page.setViewportSize({ width: 1500, height: 900 });
    await page.goto('/patterns/supervisor-manager');
    await expect(page.locator('text=On this page')).toBeVisible();
  });

  test('top nav theme toggle is reachable', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('button[aria-label="Toggle theme"]');
    await expect(toggle).toBeVisible();
    await toggle.click();
  });

  test('play button on a pattern page toggles label', async ({ page }) => {
    await page.goto('/patterns/debate-judge');
    const primary = page.locator('.controls button.primary');
    await expect(primary).toBeVisible();
    const before = (await primary.innerText()).trim().toLowerCase();
    await primary.click();
    await page.waitForTimeout(150);
    const after = (await primary.innerText()).trim().toLowerCase();
    expect(after).not.toEqual(before);
  });

  test('Patterns category label navigates to /patterns overview', async ({ page }) => {
    await page.goto('/');
    // The category header itself is a link to the overview, distinct from the
    // chevron-toggle next to it.
    await page.getByRole('link', { name: /Patterns/ }).first().click();
    await expect(page).toHaveURL(/\/patterns$/);
    await expect(page.locator('h1', { hasText: /Patterns Overview/ })).toBeVisible();
  });

  test('sidebar scroll position is not reset to top on navigation', async ({ page }) => {
    // The original bug: clicking any sidebar link slammed the sidebar's
    // internal scroll back to 0. After the fix (sidebar lifted to the root
    // layout + sessionStorage restore in useLayoutEffect), the scroll
    // position is preserved across route changes.
    await page.setViewportSize({ width: 1400, height: 800 });
    await page.goto('/');
    const sidebar = page.locator('aside .sticky').first();
    await expect(sidebar).toBeVisible();

    await sidebar.evaluate(el => { el.scrollTop = 400; });
    const before = await sidebar.evaluate(el => el.scrollTop);
    expect(before).toBeGreaterThan(50);

    // Click a sidebar link — the click handler captures scroll into
    // sessionStorage; the useLayoutEffect on the new pathname restores it.
    await page.getByRole('link', { name: 'MARL / CTDE' }).first().click();
    await expect(page).toHaveURL(/marl-ctde/);
    await page.waitForTimeout(300);

    const after = await sidebar.evaluate(el => el.scrollTop);
    // The original bug landed at scrollTop=0. The fix keeps the scroll well
    // away from the top. Exact value depends on whether the active item was
    // scrolled into view by the click, so just assert "not at the top".
    expect(after).toBeGreaterThan(100);
  });

  test('social card endpoints are served', async ({ page }) => {
    for (const path of ['/sitemap.xml', '/robots.txt', '/manifest.webmanifest']) {
      const res = await page.request.get(path);
      expect(res.status(), `expected 200 for ${path}`).toBe(200);
    }
  });

  test('home page sets opengraph + twitter meta', async ({ page }) => {
    await page.goto('/');
    const ogTitle = await page.locator('meta[property="og:title"]').first().getAttribute('content');
    const ogImage = await page.locator('meta[property="og:image"]').first().getAttribute('content');
    const twCard = await page.locator('meta[name="twitter:card"]').first().getAttribute('content');
    expect(ogTitle).toContain('Multi-Agent Wiki');
    expect(ogImage).toMatch(/opengraph-image/);
    expect(twCard).toBe('summary_large_image');
  });

  test('code blocks get a lang header + copy button', async ({ page }) => {
    await page.goto('/implementation/observability');
    // TS code block has a "TypeScript" header label and a copy button.
    await expect(page.locator('text=TypeScript').first()).toBeVisible();
    await expect(page.locator('button[aria-label="Copy code"]').first()).toBeVisible();
  });

  test('bare flowchart fences render as mermaid diagrams', async ({ page }) => {
    // /taxonomy renders the global taxonomy mermaid; verify it became an SVG.
    await page.goto('/taxonomy');
    await expect(page.locator('svg').first()).toBeVisible();
  });

  test('diagrams render via React Flow with fullscreen viewer', async ({ page }) => {
    await page.goto('/implementation/production-runtime');
    // React Flow takes over for parseable mermaid → look for the RF root.
    await expect(page.locator('.react-flow').first()).toBeVisible();
    // Animated edges + custom nodes mean there is at least one Handle and edge path.
    await expect(page.locator('.react-flow__node').first()).toBeVisible();
    // Fullscreen viewer
    await page.locator('button[aria-label="Open diagram fullscreen"]').first().click({ force: true });
    await expect(page.locator('text=Diagram viewer')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Diagram viewer')).not.toBeVisible();
  });

  test('llms.txt endpoint is served', async ({ page }) => {
    const res = await page.goto('/llms.txt');
    expect(res?.status()).toBe(200);
    expect(res?.headers()['content-type']).toContain('text/markdown');
    const body = await page.content();
    expect(body).toContain('Multi-Agent Wiki');
  });

  test('wiki pages expose canonical markdown alternates', async ({ page }) => {
    await page.goto('/patterns/supervisor-manager');
    const markdownHref = await page
      .locator('link[rel="alternate"][type="text/markdown"]')
      .first()
      .getAttribute('href');
    expect(markdownHref).toBe('https://multi-agent.wiki/patterns/supervisor-manager.md');

    const md = await page.request.get('/patterns/supervisor-manager.md');
    expect(md.status()).toBe(200);
    expect(md.headers()['content-type']).toContain('text/markdown');
    expect(await md.text()).toContain('title: Supervisor / Manager');
  });

  test('accept header can negotiate wiki pages to markdown', async ({ page }) => {
    const md = await page.request.get('/patterns/supervisor-manager', {
      headers: { Accept: 'text/markdown' },
    });
    expect(md.status()).toBe(200);
    expect(md.headers()['content-type']).toContain('text/markdown');
    expect(await md.text()).toContain('# Supervisor / Manager');
  });

  test('robots separates search bots from training bots', async ({ page }) => {
    const res = await page.request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain('User-Agent: OAI-SearchBot');
    expect(text).toContain('User-Agent: GPTBot');
    expect(text).toContain('Disallow: /');
    expect(text).toContain('Sitemap: https://multi-agent.wiki/sitemap.xml');
  });
});
