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

  test('pattern without animation still shows a static topology hero', async ({ page }) => {
    await page.goto('/patterns/marl-ctde');
    await expect(page.locator('h1', { hasText: /MARL/ })).toBeVisible();
    // No animated diagram canvas
    await expect(page.locator('.canvas-wrap')).toHaveCount(0);
    // But the static mermaid hero is present
    await expect(page.locator('text=Topology').first()).toBeVisible();
    await expect(page.locator('svg').first()).toBeVisible();
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

  test('llms.txt endpoint is served', async ({ page }) => {
    const res = await page.goto('/llms.txt');
    expect(res?.status()).toBe(200);
    expect(res?.headers()['content-type']).toContain('text/plain');
    const body = await page.content();
    expect(body).toContain('Multi-Agent Wiki');
  });
});
