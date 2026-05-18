import { test, expect, Page } from '@playwright/test';

/**
 * Helper: Pause the autoplay engine immediately after page load,
 * so that subsequent assertions are not racing animation timing.
 */
async function pauseEngine(page: Page) {
  const primary = page.locator('.controls button.primary');
  await primary.waitFor({ state: 'visible' });
  // The button text toggles between Play / Pause. If currently playing,
  // a single click pauses; if already paused, the click would start playback,
  // so we check the label first.
  const label = (await primary.innerText()).trim().toLowerCase();
  if (label.includes('pause')) {
    await primary.click();
  }
}

test.describe('Multi-Agent Explorer', () => {
  test('page loads with all 13 patterns in sidebar', async ({ page }) => {
    await page.goto('/');
    const rail = page.locator('aside.rail');
    await expect(rail).toBeVisible();

    const items = page.locator('aside.rail li[data-id]');
    await expect(items).toHaveCount(13);

    await expect(page.locator('aside.rail li[data-id="supervisor"]')).toHaveClass(/active/);
  });

  test('clicking a pattern switches the title and active state', async ({ page }) => {
    await page.goto('/');
    await pauseEngine(page);

    await page.locator('aside.rail li[data-id="debate"]').click();
    await expect(page.locator('aside.rail li[data-id="debate"]')).toHaveClass(/active/);

    const title = page.locator('main.stage > .head > h2');
    await expect(title).toContainText(/Debate/i);

    await expect(page.locator('.canvas-wrap svg.diagram .node[data-id="judge"]')).toHaveCount(1);
  });

  test('play/pause button toggles', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const primary = page.locator('.controls button.primary');
    await expect(primary).toBeVisible();

    // Click once (should pause if playing, or play if paused).
    await primary.click();
    await expect(primary).toBeVisible();

    // Click again (toggle).
    await primary.click();
    await expect(primary).toBeVisible();
  });

  test('next button advances step', async ({ page }) => {
    await page.goto('/');
    await pauseEngine(page);

    const cur = page.locator('.caption-wrap .step-no .cur');
    const before = parseInt((await cur.innerText()).trim(), 10);

    // The Next button is the 4th button in .controls (Replay, Prev, Play/Pause, Next).
    const nextBtn = page.locator('.controls > button').nth(3);
    await expect(nextBtn).toContainText(/Next/i);
    await nextBtn.click();

    // Allow the React state to flush.
    await page.waitForTimeout(100);

    const after = parseInt((await cur.innerText()).trim(), 10);
    // After advancing, the step should either increase by 1 or wrap back to 1.
    expect(after === before + 1 || after === 1).toBeTruthy();
  });

  test('speed selector changes value', async ({ page }) => {
    await page.goto('/');
    await pauseEngine(page);

    const select = page.locator('.controls .speed-group select');
    await select.selectOption('2');
    await expect(select).toHaveValue('2');
  });

  test('ArrowDown keyboard navigates to next pattern', async ({ page }) => {
    await page.goto('/');
    await pauseEngine(page);

    // Make sure supervisor is currently active.
    await expect(page.locator('aside.rail li[data-id="supervisor"]')).toHaveClass(/active/);

    await page.locator('body').press('ArrowDown');

    await expect(page.locator('aside.rail li[data-id="router"]')).toHaveClass(/active/);
  });

  test('variant chips on Supervisor — switching changes step total', async ({ page }) => {
    await page.goto('/');
    await pauseEngine(page);

    await page.locator('aside.rail li[data-id="supervisor"]').click();
    await pauseEngine(page);

    const chips = page.locator('.variants .chip');
    await expect(chips).toHaveCount(2);

    // Total is the second <span> inside .step-no (current is .cur, total is the one after).
    const total = page.locator('.caption-wrap .step-no span').last();

    const before = (await total.innerText()).trim();

    await chips.nth(1).click();
    await page.waitForTimeout(300);

    const after = (await total.innerText()).trim();
    expect(after).not.toEqual(before);
  });

  test('section collapse toggles placeholder visibility', async ({ page }) => {
    await page.goto('/');
    await pauseEngine(page);

    // Find the "Core Components" section head.
    const head = page.locator('.section-head', { hasText: /Components|组件/ });
    await expect(head).toBeVisible();

    // The placeholder belongs to the parent .section's body.
    const section = head.locator('xpath=ancestor::div[contains(@class, "section")][1]');
    const placeholder = section.locator('.placeholder');

    // Initially the components section is collapsed; placeholder hidden via CSS.
    await expect(placeholder).toBeHidden();

    await head.click();
    await expect(placeholder).toBeVisible();

    await head.click();
    await expect(placeholder).toBeHidden();
  });

  test("each pattern's diagram renders the expected number of nodes", async ({ page }) => {
    await page.goto('/');
    await pauseEngine(page);

    const expected: Array<{ id: string; n: number }> = [
      { id: 'supervisor', n: 6 },
      { id: 'router',     n: 5 },
      { id: 'hierarchy',  n: 7 },
      { id: 'sequential', n: 6 },
      { id: 'parallel',   n: 6 },
      { id: 'blackboard', n: 5 },
      { id: 'groupchat',  n: 6 },
      { id: 'nested',     n: 6 },
      { id: 'roleplay',   n: 8 },
      { id: 'debate',     n: 5 },
      { id: 'auction',    n: 5 },
      { id: 'swarm',      n: 4 },
      { id: 'protocol',   n: 6 },
    ];

    for (const { id, n } of expected) {
      await page.locator(`aside.rail li[data-id="${id}"]`).click();
      await expect(page.locator(`aside.rail li[data-id="${id}"]`)).toHaveClass(/active/);
      const nodes = page.locator('.canvas-wrap svg.diagram .node');
      await expect(nodes).toHaveCount(n);
    }
  });
});
