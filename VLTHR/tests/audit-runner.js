const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const APP_URL = process.env.APP_URL || 'https://vlthr-terminal.vercel.app';
const OUTPUT_DIR = path.join(__dirname, '..', 'test-results', 'audit');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function screenshot(page, name) {
  const file = path.join(OUTPUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`[Audit] Screenshot: ${file}`);
}

async function runAudit() {
  console.log('[Audit] Launching browser...');
  console.log(`[Audit] Target: ${APP_URL}`);

  // Use msedge which is already installed on Windows
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: false,
    args: ['--window-size=1440,900']
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const logs = [];
  const errors = [];
  const apiCalls = [];

  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    logs.push(text);
    if (msg.type() === 'error') errors.push(text);
  });

  page.on('pageerror', err => {
    errors.push(`[pageerror] ${err.message}`);
  });

  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/') || url.includes('railway')) {
      apiCalls.push({ url: url.split('?')[0], status: response.status(), ok: response.ok() });
    }
  });

  // ── Step 1: Landing Page ──
  console.log('[Audit] === Step 1: Landing Page ===');
  await page.goto(APP_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await screenshot(page, '01-landing');

  const hasLaunchBtn = await page.locator('button:has-text("Launch")').isVisible().catch(() => false);
  console.log(`[Audit] Launch button visible: ${hasLaunchBtn}`);

  // ── Step 2: Manual Login (user does this) ──
  console.log('[Audit] === Step 2: Click Launch Terminal ===');
  if (hasLaunchBtn) {
    await page.locator('button:has-text("Launch")').click();
    await page.waitForTimeout(1500);
    await screenshot(page, '02-lockscreen');
  }

  console.log('[Audit] ===========================================');
  console.log('[Audit] PLEASE LOG IN NOW (enter passcode + unlock)');
  console.log('[Audit] Waiting 60 seconds for manual login...');
  console.log('[Audit] ===========================================');

  // Wait for desktop to appear (or timeout)
  let loggedIn = false;
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(1000);
    const url = page.url();
    // Check if we're past the landing/lock screen
    const bodyText = await page.locator('body').textContent().catch(() => '');
    if (bodyText.includes('Markets') || bodyText.includes('Crypto') || bodyText.includes('Portfolio') || !bodyText.includes('Launch Terminal')) {
      loggedIn = true;
      console.log(`[Audit] Login detected after ${i}s`);
      break;
    }
  }

  if (!loggedIn) {
    console.log('[Audit] Login not detected. Continuing anyway...');
  }

  await screenshot(page, '03-post-login');

  // ── Step 3: Audit all pages ──
  const pages = [
    { name: 'crypto', url: `${APP_URL}?app=crypto` },
    { name: 'equities', url: `${APP_URL}?app=equities` },
    { name: 'forex', url: `${APP_URL}?app=forex` },
    { name: 'news', url: `${APP_URL}?app=news` },
    { name: 'macro', url: `${APP_URL}?app=macro` },
    { name: 'portfolio', url: `${APP_URL}?app=portfolio` },
    { name: 'screener', url: `${APP_URL}?app=screener` },
    { name: 'signals', url: `${APP_URL}?app=signals` },
  ];

  for (const p of pages) {
    console.log(`[Audit] === Checking ${p.name} ===`);
    try {
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);
      await screenshot(page, `04-${p.name}`);
      console.log(`[Audit] ${p.name}: OK`);
    } catch (e) {
      console.log(`[Audit] ${p.name}: ERROR - ${e.message}`);
      await screenshot(page, `04-${p.name}-error`);
    }
  }

  // ── Save reports ──
  fs.writeFileSync(path.join(OUTPUT_DIR, 'console-logs.txt'), logs.join('\n') || 'No console output');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'errors.txt'), errors.join('\n') || 'No errors');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'api-calls.json'), JSON.stringify(apiCalls, null, 2));

  const failedAPI = apiCalls.filter(c => !c.ok && c.status >= 400);
  if (failedAPI.length > 0) {
    console.log('[Audit] === FAILED API CALLS ===');
    failedAPI.forEach(c => console.log(`  ${c.url} => ${c.status}`));
  }

  console.log('[Audit] === AUDIT COMPLETE ===');
  console.log(`[Audit] Screenshots saved to: ${OUTPUT_DIR}`);
  console.log(`[Audit] Console logs: ${path.join(OUTPUT_DIR, 'console-logs.txt')}`);
  console.log(`[Audit] Errors: ${path.join(OUTPUT_DIR, 'errors.txt')}`);
  console.log(`[Audit] API calls: ${path.join(OUTPUT_DIR, 'api-calls.json')}`);

  // Keep browser open so user can inspect
  console.log('[Audit] Browser will stay open. Press Enter in terminal to close...');
  process.stdin.once('data', async () => {
    await browser.close();
    process.exit(0);
  });
}

runAudit().catch(err => {
  console.error('[Audit] Fatal error:', err);
  process.exit(1);
});
