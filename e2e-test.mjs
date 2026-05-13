import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { resolve } from 'path';

const MEDIA = resolve('media');
mkdirSync(MEDIA, { recursive: true });

const BASE = 'http://localhost:3000';
const results = [];

function log(name, pass, detail = '') {
  const icon = pass ? 'PASS' : 'FAIL';
  console.log(`[${icon}] ${name}${detail ? ' — ' + detail : ''}`);
  results.push({ name, pass, detail });
}

async function run() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages()[0] || await context.newPage();

  // --- Test 1: Homepage loads ---
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  const title = await page.textContent('h1').catch(() => null);
  log('Homepage loads', !!title, `h1 = "${title}"`);
  await page.screenshot({ path: resolve(MEDIA, '01-homepage-full.png'), fullPage: true });
  console.log('  Screenshot: media/01-homepage-full.png');

  // --- Test 2: Live indicator ---
  const live = await page.locator('text=Live').first().isVisible().catch(() => false);
  log('Live indicator visible', live);

  // --- Test 3: Header branding ---
  const brand = await page.textContent('body').then(t => t.includes('Contoso Bank')).catch(() => false);
  log('Contoso Bank branding', brand);

  const cmdCenter = await page.textContent('body').then(t => t.includes('Command Center')).catch(() => false);
  log('Command Center subtitle', cmdCenter);

  // --- Test 4: Radial gauges ---
  const gaugeLabels = ['First Call Resolution', 'Service Level', 'CSAT', 'Net Promoter', 'Abandon Health'];
  for (const label of gaugeLabels) {
    const visible = await page.locator(`text=${label}`).first().isVisible().catch(() => false);
    log(`Gauge: ${label}`, visible);
  }

  // --- Test 5: Metric cards ---
  const metricCards = ['Active Agents', 'In Queue', 'Avg Handle', 'Abandon Rate'];
  for (const card of metricCards) {
    const visible = await page.locator(`text=${card}`).first().isVisible().catch(() => false);
    log(`Metric card: ${card}`, visible);
  }

  // --- Test 6: Stat pills in header ---
  const pills = ['Handled', 'Wait', 'Sites', 'Online'];
  for (const pill of pills) {
    const visible = await page.locator(`text=${pill}`).first().isVisible().catch(() => false);
    log(`Stat pill: ${pill}`, visible);
  }

  // --- Test 7: Overview tab (default) ---
  const overviewActive = await page.locator('[data-state="active"]').filter({ hasText: 'Overview' }).isVisible().catch(() => false);
  log('Overview tab active by default', overviewActive);
  await page.screenshot({ path: resolve(MEDIA, '02-overview-tab.png'), fullPage: true });
  console.log('  Screenshot: media/02-overview-tab.png');

  // --- Test 8: Agents tab ---
  await page.locator('button', { hasText: 'Agents' }).click();
  await page.waitForTimeout(1500);
  const agentsContent = await page.textContent('body').then(t =>
    t.includes('on-call') || t.includes('available') || t.includes('offline') || t.includes('break')
  ).catch(() => false);
  log('Agents tab shows agent grid', agentsContent);
  await page.screenshot({ path: resolve(MEDIA, '03-agents-tab.png'), fullPage: true });
  console.log('  Screenshot: media/03-agents-tab.png');

  // --- Test 9: Queues tab ---
  await page.locator('button', { hasText: 'Queues' }).click();
  await page.waitForTimeout(1500);
  const queuesContent = await page.textContent('body').then(t =>
    t.includes('Queue') || t.includes('queue') || t.includes('Wait') || t.includes('Calls Needing')
  ).catch(() => false);
  log('Queues tab shows queue status', queuesContent);
  await page.screenshot({ path: resolve(MEDIA, '04-queues-tab.png'), fullPage: true });
  console.log('  Screenshot: media/04-queues-tab.png');

  // --- Test 10: Insights tab ---
  await page.locator('button', { hasText: 'Insights' }).click();
  await page.waitForTimeout(1500);
  const insightsContent = await page.textContent('body').then(t =>
    t.includes('Performance Trends') || t.includes('Topic')
  ).catch(() => false);
  log('Insights tab shows trends', insightsContent);
  await page.screenshot({ path: resolve(MEDIA, '05-insights-tab.png'), fullPage: true });
  console.log('  Screenshot: media/05-insights-tab.png');

  // --- Test 11: Footer ---
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  const footer = await page.textContent('body').then(t => t.includes('AI-Enhanced Contact Center Platform')).catch(() => false);
  log('Footer text present', footer);
  await page.screenshot({ path: resolve(MEDIA, '06-footer.png'), fullPage: true });
  console.log('  Screenshot: media/06-footer.png');

  // --- Test 12: Auto-refresh indicator ---
  const autoRefresh = await page.textContent('body').then(t => t.includes('Auto-refreshing')).catch(() => false);
  log('Auto-refresh indicator', autoRefresh);

  // --- Test 13: Real-time Operations badge ---
  const rtOps = await page.textContent('body').then(t => t.includes('Real-time Operations')).catch(() => false);
  log('Real-time Operations badge', rtOps);

  // --- Summary ---
  console.log('\n' + '='.repeat(50));
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`TOTAL: ${passed} passed, ${failed} failed out of ${results.length} tests`);
  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.pass).forEach(r => console.log(`  - ${r.name}: ${r.detail}`));
  }
  console.log('='.repeat(50));

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
