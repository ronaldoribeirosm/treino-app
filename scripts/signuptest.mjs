import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'C:/Users/mksbd/AppData/Local/Temp/claude/C--Users-mksbd/670dddf7-ed81-4c84-be39-09d0c834f590/scratchpad/shots';
mkdirSync(OUT, { recursive: true });

const email = `teste_${Date.now()}@forja.app`;
const browser = await chromium.launch();
const page = await browser.newContext({ viewport: { width: 402, height: 880 } }).then((c) => c.newPage());
const errors = [];
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));

await page.goto('http://localhost:8081/', { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(8000);

// switch to signup
await page.getByText('Cadastre-se', { exact: true }).click();
await page.waitForTimeout(600);
await page.getByPlaceholder('Seu nome').fill('Ronaldo Teste');
await page.getByPlaceholder('Email').fill(email);
await page.getByPlaceholder('Senha').fill('treino123');
await page.getByText('Criar conta', { exact: true }).last().click();
await page.waitForTimeout(6000);
await page.screenshot({ path: `${OUT}/signup-result.png` });

// is there a session token in storage?
const hasSession = await page.evaluate(() => {
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.includes('auth-token')) return true;
  }
  return false;
});

console.log('email teste:', email);
console.log('sessão criada:', hasSession);
console.log(errors.length ? errors.join('\n') : 'no page errors');
await browser.close();
