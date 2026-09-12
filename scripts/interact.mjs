import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'C:/Users/mksbd/AppData/Local/Temp/claude/C--Users-mksbd/670dddf7-ed81-4c84-be39-09d0c834f590/scratchpad/shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newContext({ viewport: { width: 402, height: 880 }, deviceScaleFactor: 2 }).then((c) => c.newPage());
const errors = [];
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));

await page.goto('http://localhost:8081/', { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(8000);

// open meal sheet
await page.getByText('Registrar', { exact: true }).first().click();
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/act-sheet.png` });

// add a preset
await page.getByText('Pão de queijo', { exact: true }).first().click();
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/act-toast.png` });

// go to treino and toggle an exercise
await page.goto('http://localhost:8081/treino', { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(3500);
await page.getByText('Desenv. Militar', { exact: true }).first().click();
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/act-toggle.png` });

console.log(errors.length ? errors.join('\n') : 'no page errors');
await browser.close();
