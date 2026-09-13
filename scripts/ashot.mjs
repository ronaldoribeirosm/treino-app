import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'C:/Users/mksbd/AppData/Local/Temp/claude/C--Users-mksbd/670dddf7-ed81-4c84-be39-09d0c834f590/scratchpad/shots';
mkdirSync(OUT, { recursive: true });

const slugs = (process.argv[2] || 'home').split(',');
const routes = slugs.map((s) => (s === 'home' || s === '' ? '/' : '/' + s));
const base = 'http://localhost:8081';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 402, height: 880 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));

// sign up a throwaway account to pass the auth gate
await page.goto(base + '/', { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(8000);
await page.getByText('Cadastre-se', { exact: true }).click();
await page.waitForTimeout(500);
await page.getByPlaceholder('Seu nome').fill('Ronaldo');
await page.getByPlaceholder('Email').fill(`shot_${Date.now()}@forja.app`);
await page.getByPlaceholder('Senha').fill('treino123');
await page.getByText('Criar conta', { exact: true }).last().click();
// wait until we're actually logged in (home content present) before navigating
await page.getByText('TREINO DE HOJE', { exact: false }).first().waitFor({ timeout: 20000 });
await page.waitForTimeout(2500);

async function scrollAndShot(name) {
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${OUT}/${name}-1.png` });
  await page.evaluate(() => {
    const all = [document.scrollingElement, ...document.querySelectorAll('*')];
    let best = null, bd = 40;
    for (const e of all) { if (!e) continue; const d = e.scrollHeight - e.clientHeight; if (d > bd) { bd = d; best = e; } }
    window.__sc = best;
    if (best) best.scrollTop = 760;
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${name}-2.png` });
  await page.evaluate(() => { if (window.__sc) window.__sc.scrollTop = window.__sc.scrollHeight; });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${name}-3.png` });
}

for (const r of routes) {
  await page.goto(base + r, { waitUntil: 'load', timeout: 90000 });
  await scrollAndShot(r === '/' ? 'home' : r.slice(1));
  console.log('shot', r);
}

console.log(errors.length ? [...new Set(errors)].join('\n') : 'no page errors');
await browser.close();
