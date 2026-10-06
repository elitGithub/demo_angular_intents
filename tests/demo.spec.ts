import { test, expect } from '@playwright/test';

const exit = async (page: import('@playwright/test').Page, y = 0) => {
  await page.locator('html').dispatchEvent('mouseleave', { clientY: y, relatedTarget: null });
};

test.beforeEach(async ({ page }) => { await page.goto('/contact'); });

test('keeps an unfinished draft across routes and records departure only when pending', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Good conversations start here.' })).toBeVisible();
  await page.getByRole('link', { name: 'About', exact: true }).click();
  await expect(page.getByLabel('Recent events').getByText('Form left unfinished', { exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Contact', exact: true }).click();
  await page.getByLabel('Full name').fill('Demo Person');
  await page.getByRole('link', { name: 'About', exact: true }).click();
  await expect(page.getByLabel('Recent events').getByText('Form left unfinished', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Contact', exact: true }).click();
  await expect(page.getByLabel('Full name')).toHaveValue('Demo Person');
});

test('validates the form and completes locally without a pending departure', async ({ page }) => {
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Please enter your name.')).toBeVisible();
  await page.getByLabel('Full name').fill('Demo Person');
  await page.getByLabel('Email address').fill('invalid');
  await page.getByLabel('Your message').fill('A demo message.');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await page.getByLabel('Email address').fill('demo@example.com');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('heading', { name: 'Message received. Demo complete.' })).toBeVisible();
  await page.getByRole('link', { name: 'About', exact: true }).click();
  await expect(page.getByLabel('Recent events').getByText('Form left unfinished', { exact: true })).toHaveCount(0);
});

test('ignores side exits, deduplicates top exits and dismisses recovery with Escape', async ({ page }) => {
  await page.getByLabel('Full name').fill('Demo Person');
  await exit(page, 150);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await exit(page);
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByLabel('Full name')).toBeFocused();
  await exit(page);
  await expect(page.getByLabel('Recent events').getByText('Exit intent detected', { exact: true })).toHaveCount(1);
});

test('idle fires once and re-arms when the visitor returns', async ({ page }) => {
  await page.clock.install();
  await page.getByLabel('Full name').click();
  await page.clock.fastForward(16000);
  await expect(page.getByLabel('Recent events').getByText('Inactivity detected', { exact: true })).toHaveCount(1);
  await page.clock.fastForward(30000);
  await expect(page.getByLabel('Recent events').getByText('Inactivity detected', { exact: true })).toHaveCount(1);
  await page.getByLabel('Full name').fill('Back');
  await expect(page.getByLabel('Recent events').getByText('Activity resumed', { exact: true })).toBeVisible();
  await page.clock.fastForward(16000);
  await expect(page.getByLabel('Recent events').getByText('Inactivity detected', { exact: true })).toHaveCount(2);
});

test('pause stops collection, resume re-arms it, reset preserves the draft', async ({ page }) => {
  await page.getByLabel('Full name').fill('Keep this draft');
  await page.getByRole('button', { name: 'Pause tracking' }).click();
  await exit(page);
  await expect(page.getByLabel('Recent events').getByText('Exit intent detected', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Resume tracking' }).click();
  await exit(page);
  await page.getByRole('button', { name: 'Keep writing' }).click();
  await expect(page.getByLabel('Recent events').getByText('Exit intent detected', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset events' }).click();
  await expect(page.getByLabel('Recent events').getByText('Exit intent detected', { exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Full name')).toHaveValue('Keep this draft');
});

test('simulation is labeled and export contains metadata without form contents', async ({ page }) => {
  await page.getByLabel('Full name').fill('Private Name Canary');
  await page.getByLabel('Email address').fill('private-canary@example.com');
  await page.getByLabel('Your message').fill('Private message canary');
  await page.getByRole('button', { name: 'Simulate idle' }).click();
  await expect(page.getByText('Simulated', { exact: true })).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export events' }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  let data = '';
  for await (const chunk of stream!) data += chunk.toString();
  expect(data).not.toContain('Canary');
  expect(data).not.toContain('private-canary');
  expect(data).not.toContain('Private message');
  expect(JSON.parse(data).events.some((event: { source: string }) => event.source === 'simulated')).toBe(true);
});

test('observes visibility changes without treating hidden time as idle', async ({ page }) => {
  await page.clock.install();
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.fastForward(30000);
  await expect(page.getByLabel('Recent events').getByText('Tab hidden', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Recent events').getByText('Inactivity detected', { exact: true })).toHaveCount(0);
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.getByLabel('Recent events').getByText('Tab visible again', { exact: true })).toBeVisible();
});

test('mobile pages fit the viewport and direct About route works', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/about');
  await expect(page.getByRole('heading', { name: 'The moment before goodbye.' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Contact', exact: true }).click();
  await expect(page.getByLabel('Full name')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
