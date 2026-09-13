import { createClient } from '@supabase/supabase-js';

const URL = 'https://etnpurzrgpvoihdmwkeh.supabase.co';
const KEY = 'sb_publishable_4QTTo0QB2ajviC7oHeuXpw_l4Jav-Dk';
const mk = () => createClient(URL, KEY, { auth: { persistSession: false } });

const ok = (label, cond) => console.log(`${cond ? '✓' : '✗ FALHOU'}  ${label}`);
const stamp = Date.now();

// --- create two users ---
const A = mk();
const B = mk();
const { data: a } = await A.auth.signUp({ email: `alice_${stamp}@forja.app`, password: 'treino123', options: { data: { nome: 'Alice' } } });
const { data: b } = await B.auth.signUp({ email: `bob_${stamp}@forja.app`, password: 'treino123', options: { data: { nome: 'Bob' } } });
const aId = a.user.id;
const bId = b.user.id;
ok('cadastrou Alice e Bob', !!aId && !!bId);

// --- set memorable handles ---
const hA = `alice${stamp}`;
const hB = `bob${stamp}`;
await A.from('profiles').update({ handle: hA }).eq('id', aId);
await B.from('profiles').update({ handle: hB }).eq('id', bId);

// --- A finds B by handle and sends a request ---
const { data: found } = await A.from('profiles').select('id,nome').eq('handle', hB).maybeSingle();
ok('Alice acha o Bob pelo @handle', found?.id === bId);
const { error: reqErr } = await A.from('friendships').insert({ user_a: aId, user_b: bId, status: 'pendente' });
ok('Alice envia pedido de amizade', !reqErr);

// --- B sees the incoming request (RLS) and accepts ---
const { data: bReqs } = await B.from('friendships').select('*').eq('user_b', bId).eq('status', 'pendente');
ok('Bob vê o pedido recebido', (bReqs?.length ?? 0) === 1);
await B.from('friendships').update({ status: 'aceito' }).eq('id', bReqs[0].id);

// --- A sees they are now friends ---
const { data: aFriends } = await A.from('friendships').select('*').or(`user_a.eq.${aId},user_b.eq.${aId}`).eq('status', 'aceito');
ok('Alice vê a amizade aceita', (aFriends?.length ?? 0) === 1);

// --- A logs a meal, then shares her diet with B ---
await A.from('diet_entries').insert({ user_id: aId, alimento: 'Frango 200g', kcal: 330, prot: 62, carb: 0, gord: 8 });
const payload = [{ refeicao: 'Almoço', alimento: 'Frango 200g', kcal: 330, prot: 62, carb: 0, gord: 8, origem: 'manual' }];
const { error: shErr } = await A.from('shared_items').insert({ de_id: aId, para_id: bId, tipo: 'dieta', titulo: 'Dieta da Alice', detalhe: '330 kcal · 1 item', payload });
ok('Alice compartilha a dieta com o Bob', !shErr);

// --- B receives it in the inbox ---
const { data: bInbox } = await B.from('shared_items').select('*').eq('para_id', bId);
ok('Bob recebe o compartilhamento', (bInbox?.length ?? 0) === 1 && bInbox[0].titulo === 'Dieta da Alice');

// --- SECURITY: B cannot read A's private diet directly ---
const { data: bSeesAliceDiet } = await B.from('diet_entries').select('*').eq('user_id', aId);
ok('RLS: Bob NÃO vê a dieta privada da Alice', (bSeesAliceDiet?.length ?? 0) === 0);

// --- cleanup these two test users' data (best effort, RLS-scoped) ---
await A.from('shared_items').delete().eq('de_id', aId);
await A.from('friendships').delete().or(`user_a.eq.${aId},user_b.eq.${aId}`);

console.log('\nfim');
process.exit(0);
