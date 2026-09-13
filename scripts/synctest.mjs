import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'C:/Users/mksbd/AppData/Local/Temp/claude/C--Users-mksbd/670dddf7-ed81-4c84-be39-09d0c834f590/scratchpad/shots';
mkdirSync(OUT, { recursive: true });
const base = 'http://localhost:8081';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 402, height: 880 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));

// signup
await page.goto(base + '/', { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(8000);
await page.getByText('Cadastre-se', { exact: true }).click();
await page.waitForTimeout(500);
await page.getByPlaceholder('Seu nome').fill('Joao Squad');
await page.getByPlaceholder('Email').fill(`sync_${Date.now()}@forja.app`);
await page.getByPlaceholder('Senha').fill('treino123');
await page.getByText('Criar conta', { exact: true }).last().click();
await page.waitForTimeout(7000);
await page.screenshot({ path: `${OUT}/sync-home.png` });

const nomeHome = await page.evaluate(() => document.body.innerText.match(/JOAO SQUAD/i)?.[0] || 'NAO ACHOU');
const hasSession = await page.evaluate(() => Object.keys(localStorage).some((k) => k.includes('auth-token')));
console.log('nome na home (perfil da nuvem):', nomeHome);
console.log('sessao no localStorage apos signup:', hasSession);
console.log('erros ate aqui:', errors.length ? [...new Set(errors)].join(' | ') : 'nenhum');

// go to diet — should be empty (new user)
await page.goto(base + '/dieta', { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(3500);
await page.screenshot({ path: `${OUT}/sync-empty.png` });

// add a meal
await page.getByText('Registrar refeição', { exact: true }).first().click();
await page.waitForTimeout(700);
await page.getByText('Banana', { exact: true }).first().click();
await page.waitForTimeout(1500); // let the cloud insert happen
await page.screenshot({ path: `${OUT}/sync-added.png` });

// wipe LOCAL cache (keep auth), reload -> must come back from CLOUD
await page.evaluate(() => localStorage.removeItem('treino-store-v1'));
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(9000);
await page.goto(base + '/dieta', { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(3500);
await page.screenshot({ path: `${OUT}/sync-fromcloud.png` });

const bananaAfter = await page.evaluate(() => /Banana/.test(document.body.innerText));
console.log('banana veio da nuvem apos limpar cache:', bananaAfter);
console.log(errors.length ? [...new Set(errors)].join('\n') : 'no page errors');
await browser.close();
