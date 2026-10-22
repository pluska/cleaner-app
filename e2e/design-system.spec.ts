import { test, expect } from '@playwright/test';
import catalog from '../design/sparkclean/source-copy-catalog.json';

const landingCopy = [...new Map(catalog.translations
  .filter(entry => entry.source.startsWith('src/components/home/') || entry.source === 'src/app/page.tsx')
  .map(entry => [entry.key, entry])).values()];

test('original landing copy, local design assets and interactive XP survive the redesign', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  expect(landingCopy).toHaveLength(39);
  for (const entry of landingCopy) await expect(page.locator('body')).toContainText(entry.en);

  await page.locator('.landing-footer').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.landing img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  const assets = await page.locator('.landing img').evaluateAll(images => images.map(image => {
    const img = image as HTMLImageElement;
    const box = img.getBoundingClientRect();
    return { src: img.getAttribute('src'), loaded: img.complete && img.naturalWidth > 0, width: box.width, height: box.height };
  }));
  expect(assets.length).toBeGreaterThan(10);
  for (const asset of assets) {
    expect(asset.src).not.toContain('figma.com');
    expect(asset.loaded).toBe(true);
    expect(asset.width).toBeGreaterThan(0);
    if (asset.src?.endsWith('.svg')) expect([16, 24]).toContain(asset.width);
    else expect(Math.abs(asset.width / asset.height - 2048 / 682)).toBeLessThan(0.01);
  }

  const subtask = page.getByRole('button', { name: /Dust tables and surfaces/ });
  await subtask.click();
  await expect(subtask).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.preview-stats')).toContainText('20 XP');
  await subtask.click();
  await expect(page.locator('.preview-stats')).toContainText('0 XP');

  await page.locator('.landing-header select:visible').selectOption('es');
  for (const entry of landingCopy) await expect(page.locator('body')).toContainText(entry.es);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('landing-es.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('responsive navigation reaches the existing authentication form', async ({ page }, testInfo) => {
  await page.goto('/');
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Menu', exact: true })).toHaveAttribute('aria-expanded', 'true');
    await page.locator('#landing-mobile-menu').getByRole('button', { name: 'Sign In', exact: true }).click();
  } else {
    await page.locator('.landing-nav-desktop').getByRole('button', { name: 'Sign In', exact: true }).click();
  }
  await expect(page).toHaveURL(/\/auth\/login/);
  await expect(page.getByRole('heading', { name: 'Welcome Back, Hero' })).toBeVisible();
  await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('auth.png'), fullPage: true });
});
