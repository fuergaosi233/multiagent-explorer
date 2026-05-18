import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

const BASE = 'http://localhost:3025';

async function shot(page, url, file, waitMs = 800) {
  await page.goto(BASE + url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(waitMs);
  // Pause any autoplay
  const playBtn = page.locator('.controls button.primary');
  if (await playBtn.count() > 0) {
    const label = (await playBtn.innerText()).trim().toLowerCase();
    if (label.includes('pause')) await playBtn.click();
  }
  await page.screenshot({ path: file, fullPage: false });
}

const page = await ctx.newPage();

await shot(page, '/', '/tmp/wiki-home-light.png');
await shot(page, '/taxonomy', '/tmp/wiki-taxonomy-light.png');
await shot(page, '/patterns/supervisor-manager', '/tmp/wiki-pattern-light.png', 1500);
await shot(page, '/implementation/production-runtime', '/tmp/wiki-impl-light.png');

// Dark mode
const toggle = page.locator('button[aria-label="Toggle theme"]');
await page.goto(BASE + '/');
await page.waitForTimeout(400);
await toggle.click();
await page.waitForTimeout(400);

await shot(page, '/', '/tmp/wiki-home-dark.png');
await shot(page, '/patterns/debate-judge', '/tmp/wiki-pattern-dark.png', 1500);
await shot(page, '/decision-matrix', '/tmp/wiki-decision-dark.png');

await browser.close();
console.log('OK');
