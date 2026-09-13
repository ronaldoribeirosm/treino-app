import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const URL = 'https://etnpurzrgpvoihdmwkeh.supabase.co';
const KEY = 'sb_publishable_4QTTo0QB2ajviC7oHeuXpw_l4Jav-Dk';
const OUT = 'C:/Users/mksbd/AppData/Local/Temp/claude/C--Users-mksbd/670dddf7-ed81-4c84-be39-09d0c834f590/scratchpad/shots';
mkdirSync(OUT, { recursive: true });
const mk = () => createClient(URL, KEY, { auth: { persistSession: false } });
const stamp = Date.now();

// setup: Alice + Bob, friends, Alice shares diet with Bob
const A = mk();
const B = mk();
const bobEmail = `bob_${stamp}@forja.app`;
const { data: a } = await A.auth.signUp({ email: `alice_${stamp}@forja.app`, password: 'treino123', options: { data: { nome: 'Alice Monstra' } } });
const { data: b } = await B.auth.signUp({ email: bobEmail, password: 'treino123', options: { data: { nome: 'Bob' } } });
await A.from('profiles').update({ handle: `alice${stamp}`, streak: 15 }).eq('id', a.user.id);
await B.from('profiles').update({ handle: `bob${stamp}` }).eq('id', b.user.id);
const { data: fr } = await A.from('friendships').insert({ user_a: a.user.id, user_b: b.user.id, status: 'aceito' }).select().single();
await A.from('shared_items').insert({ de_id: a.user.id, para_id: b.user.id, tipo: 'dieta', titulo: 'Cutting da Alice', detalhe: '2100 kcal · alta proteína', payload: [{ refeicao: 'Almoço', alimento: 'Frango + batata doce', kcal: 420, prot: 50, carb: 40, gord: 8, origem: 'manual' }] });
// also a pending request TO bob from a third person
const C = mk();
const { data: c } = await C.auth.signUp({ email: `caio_${stamp}@forja.app`, password: 'treino123', options: { data: { nome: 'Caio' } } });
await C.from('profiles').update({ handle: `caio${stamp}` }).eq('id', c.user.id);
await C.from('friendships').insert({ user_a: c.user.id, user_b: b.user.id, status: 'pendente' });
console.log('setup pronto; logando como Bob no app...');

// login as Bob in the app, screenshot social
const browser = await chromium.launch();
const page = await browser.newContext({ viewport: { width: 402, height: 880 }, deviceScaleFactor: 2 }).then((c) => c.newPage());
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://localhost:8081/', { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(8000);
await page.getByPlaceholder('Email').fill(bobEmail);
await page.getByPlaceholder('Senha').fill('treino123');
await page.getByText('Entrar', { exact: true }).last().click();
await page.getByText('TREINO DE HOJE', { exact: false }).first().waitFor({ timeout: 20000 });
await page.waitForTimeout(2500);
await page.goto('http://localhost:8081/social', { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(4000);
await page.screenshot({ path: `${OUT}/socialui.png` });
console.log(errors.length ? errors.join('\n') : 'no page errors');

// cleanup
await A.from('shared_items').delete().eq('de_id', a.user.id);
await A.from('friendships').delete().eq('id', fr.id);
await C.from('friendships').delete().eq('user_a', c.user.id);
await browser.close();
process.exit(0);
