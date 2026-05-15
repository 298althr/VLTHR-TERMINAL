import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.join(__dirname, '..', 'test-results', 'audit');
const APP_URL = process.env.APP_URL || 'https://vlthr-terminal.vercel.app';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function screenshot(page: Page, name: string) {
  const file = path.join(OUTPUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`[Audit] Screenshot: ${file}`);
}

async function captureConsole(page: Page, label: string) {
  const logs: string[] = [];
  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    logs.push(text);
  });
  page.on('pageerror', err => {
    logs.push(`[pageerror] ${err.message}`);
  });
  return {
    save: async () => {
      const file = path.join(OUTPUT_DIR, `console-${label}.txt`);
      fs.writeFileSync(file, logs.join('\n') || 'No console output');
      console.log(`[Audit] Console log: ${file}`);
    },
    getErrors: () => logs.filter(l => l.includes('error') || l.includes('Error') || l.includes('failed') || l.includes('Failed'))
  };
}

test.describe('VLTHR Terminal UI Audit', () => {
  test.beforeAll(() => {
    ensureDir(OUTPUT_DIR);
  });

  test('01 - Landing Page', async ({ page }) => {
    const consoleCapture = await captureConsole(page, 'landing');

    await page.goto(APP_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await screenshot(page, '01-landing-page');
    await consoleCapture.save();

    // Check key elements exist
    const hasLogo = await page.locator('img[alt="VLTHR"]').isVisible().catch(() => false);
    const hasLaunchBtn = await page.locator('button:has-text("Launch Terminal")').isVisible().catch(() => false);
    const hasHeadline = await page.locator('text=Terminal-grade').isVisible().catch(() => false);

    expect(hasLogo).toBe(true);
    expect(hasLaunchBtn).toBe(true);
    expect(hasHeadline).toBe(true);

    console.log('[Audit] Landing page loaded successfully');
  });

  test('02 - Login Flow (manual)', async ({ page }) => {
    // This test is designed to be run in headed mode
    // The user clicks "Launch Terminal" and enters the passcode manually
    // Then we continue the audit

    const consoleCapture = await captureConsole(page, 'login');

    await page.goto(APP_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Click Launch Terminal
    await page.locator('button:has-text("Launch Terminal")').click();
    await page.waitForTimeout(1000);

    await screenshot(page, '02-login-screen');
    await consoleCapture.save();

    console.log('[Audit] === MANUAL LOGIN REQUIRED ===');
    console.log('[Audit] Please enter the passcode and click unlock.');
    console.log('[Audit] Waiting 30 seconds for login...');

    // Wait for the user to log in (look for desktop to appear)
    try {
      await page.waitForSelector('[data-testid="desktop"] or [class*="desktop"] or text=Markets', { timeout: 30000 });
      console.log('[Audit] Login detected!');
    } catch {
      console.log('[Audit] Timeout - login not detected within 30s');
    }

    await screenshot(page, '03-after-login');
  });

  test('03 - Desktop & Navigation', async ({ page }) => {
    const consoleCapture = await captureConsole(page, 'desktop');

    // Screenshot desktop
    await page.waitForTimeout(2000);
    await screenshot(page, '04-desktop');

    // Test dock icons if present
    const dockIcons = await page.locator('[data-testid="dock-icon"], [class*="dock"]').count();
    console.log(`[Audit] Dock icons found: ${dockIcons}`);

    await consoleCapture.save();
  });

  test('04 - Crypto Page', async ({ page }) => {
    const consoleCapture = await captureConsole(page, 'crypto');

    // Navigate to crypto page
    await page.goto(`${APP_URL}?app=crypto`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await screenshot(page, '05-crypto-page');
    await consoleCapture.save();

    const errors = consoleCapture.getErrors();
    if (errors.length > 0) {
      console.log('[Audit] Crypto page errors:', errors);
    }
  });

  test('05 - Equities Page', async ({ page }) => {
    const consoleCapture = await captureConsole(page, 'equities');

    await page.goto(`${APP_URL}?app=equities`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await screenshot(page, '06-equities-page');
    await consoleCapture.save();

    const errors = consoleCapture.getErrors();
    if (errors.length > 0) {
      console.log('[Audit] Equities page errors:', errors);
    }
  });

  test('06 - Forex Page', async ({ page }) => {
    const consoleCapture = await captureConsole(page, 'forex');

    await page.goto(`${APP_URL}?app=forex`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await screenshot(page, '07-forex-page');
    await consoleCapture.save();
  });

  test('07 - News Page', async ({ page }) => {
    const consoleCapture = await captureConsole(page, 'news');

    await page.goto(`${APP_URL}?app=news`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await screenshot(page, '08-news-page');
    await consoleCapture.save();
  });

  test('08 - Macro Page', async ({ page }) => {
    const consoleCapture = await captureConsole(page, 'macro');

    await page.goto(`${APP_URL}?app=macro`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await screenshot(page, '09-macro-page');
    await consoleCapture.save();
  });

  test('09 - Network Requests Check', async ({ page }) => {
    const failedRequests: string[] = [];
    const apiResponses: { url: string; status: number; ok: boolean }[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      const status = response.status();
      if (url.includes('/api/')) {
        apiResponses.push({ url: url.split('?')[0], status, ok: response.ok() });
      }
      if (!response.ok() && url.includes('/api/')) {
        failedRequests.push(`${url} => ${status}`);
      }
    });

    // Visit pages that make API calls
    await page.goto(`${APP_URL}?app=crypto`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.goto(`${APP_URL}?app=equities`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.goto(`${APP_URL}?app=forex`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const report = {
      totalAPI: apiResponses.length,
      failed: failedRequests.length,
      failedRequests,
      apiCalls: apiResponses
    };

    const file = path.join(OUTPUT_DIR, 'network-report.json');
    fs.writeFileSync(file, JSON.stringify(report, null, 2));
    console.log(`[Audit] Network report: ${file}`);

    if (failedRequests.length > 0) {
      console.log('[Audit] FAILED API CALLS:', failedRequests);
    }
  });
});
