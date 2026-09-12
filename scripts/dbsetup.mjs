import { readFileSync } from 'node:fs';

const REF = 'etnpurzrgpvoihdmwkeh';
const TOKEN = process.env.SB_TOKEN;
const API = 'https://api.supabase.com/v1';

if (!TOKEN) {
  console.error('Faltou SB_TOKEN');
  process.exit(1);
}

const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

async function runSQL(query, label) {
  const res = await fetch(`${API}/projects/${REF}/database/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  console.log(`\n[${label}] HTTP ${res.status}`);
  if (!res.ok) {
    console.log(text.slice(0, 800));
    return null;
  }
  return text;
}

// 1) create schema
const sql = readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8');
await runSQL(sql, 'criar schema');

// 2) disable email confirmation (auto-confirm signups)
const authRes = await fetch(`${API}/projects/${REF}/config/auth`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify({ mailer_autoconfirm: true }),
});
console.log(`\n[config auth autoconfirm] HTTP ${authRes.status}`);
if (!authRes.ok) console.log((await authRes.text()).slice(0, 500));
else {
  const cfg = JSON.parse(await authRes.text());
  console.log('  mailer_autoconfirm =', cfg.mailer_autoconfirm);
}

// 3) verify tables
const tables = await runSQL(
  "select table_name from information_schema.tables where table_schema='public' order by table_name",
  'listar tabelas',
);
if (tables) {
  const rows = JSON.parse(tables);
  console.log('  tabelas:', rows.map((r) => r.table_name).join(', '));
}
