import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'C:/Users/mksbd/AppData/Local/Temp/claude/C--Users-mksbd/670dddf7-ed81-4c84-be39-09d0c834f590/scratchpad/shots';
mkdirSync(OUT, { recursive: true });

const slugs = process.argv[2] ? process.argv[2].split(',') : ['home'];
const routes = slugs.map((s) => (s === 'home' || s === '' ? '/' : '/' + s));
const base = 'http://localhost:8081';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 402, height: 880 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('[console] ' + m.text());
});
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));

function slug(r) {
  return r === '/' ? 'home' : r.replace(/\//g, '');
}

for (const r of routes) {
  await page.goto(base + r, { waitUntil: 'load', timeout: 90000 });
  // wait for React content to mount + fonts + entrance animations to settle
  await page.waitForTimeout(r === routes[0] ? 9000 : 4500);
  const s = slug(r);
  await page.screenshot({ path: `${OUT}/${s}-1.png` });

  // find the element with the most scrollable overflow (RN-web ScrollView)
  const findScroller = () => {
    const all = [document.scrollingElement, ...document.querySelectorAll('*')];
    let best = null;
    let bestDelta = 40;
    for (const e of all) {
      if (!e) continue;
      const d = e.scrollHeight - e.clientHeight;
      if (d > bestDelta) {
        bestDelta = d;
        best = e;
      }
    }
    return best;
  };

  const total = await page.evaluate(() => {
    const fs = (window.__fs = () => {
      const all = [document.scrollingElement, ...document.querySelectorAll('*')];
      let best = null,
        bd = 40;
      for (const e of all) {
        if (!e) continue;
        const d = e.scrollHeight - e.clientHeight;
        if (d > bd) {
          bd = d;
          best = e;
        }
      }
      return best;
    });
    const sc = fs();
    if (sc) {
      sc.scrollTop = Math.min(760, sc.scrollHeight);
      return sc.scrollHeight;
    }
    return -1;
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/${s}-2.png` });

  await page.evaluate(() => {
    const sc = window.__fs();
    if (sc) sc.scrollTop = sc.scrollHeight;
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/${s}-3.png` });

  console.log(`shot ${s} (scrollHeight=${total})`);
}

if (errors.length) {
  console.log('\n=== PAGE ERRORS ===');
  console.log([...new Set(errors)].slice(0, 30).join('\n'));
} else {
  console.log('\nno console/page errors');
}

await browser.close();
console.log('OUT=' + OUT);
