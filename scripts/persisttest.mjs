import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 402, height: 880 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));

const dietFromLS = () =>
  page.evaluate(() => {
    const raw = localStorage.getItem('treino-store-v1');
    if (!raw) return null;
    const s = JSON.parse(raw).state;
    return { count: s.diet.length, foods: s.diet.map((d) => d.alimento), kcal: s.diet.reduce((a, d) => a + d.kcal, 0) };
  });

await page.goto('http://localhost:8081/', { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(8000);
console.log('inicial   :', JSON.stringify(await dietFromLS()));

// add banana
await page.getByText('Registrar', { exact: true }).first().click();
await page.waitForTimeout(700);
await page.getByText('Banana', { exact: true }).first().click();
await page.waitForTimeout(700);
console.log('apos add  :', JSON.stringify(await dietFromLS()));

// reload the page — the real persistence test
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(8000);
console.log('pos reload:', JSON.stringify(await dietFromLS()));

console.log(errors.length ? errors.join('\n') : 'no page errors');
await browser.close();
