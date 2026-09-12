-- ============================================================
--  Treino App — schema + Row Level Security (RLS)
--  Rode isto no Supabase: SQL Editor -> New query -> cole -> Run.
--  Pode rodar de novo com segurança (usa IF NOT EXISTS / OR REPLACE).
-- ============================================================

-- ---------- PROFILES (1 por usuário do auth) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default 'Atleta',
  handle text unique,
  peso_atual numeric,
  peso_meta numeric,
  altura int,
  goal text not null default 'bulking',        -- bulking | cutting | manter
  meta_kcal int not null default 2500,
  xp int not null default 0,
  streak int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "perfis visíveis a autenticados" on public.profiles;
create policy "perfis visíveis a autenticados"
  on public.profiles for select to authenticated using (true);

drop policy if exists "edita o próprio perfil" on public.profiles;
create policy "edita o próprio perfil"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- cria o perfil automaticamente quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome, handle)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    split_part(new.email, '@', 1) || '_' || substr(md5(random()::text), 1, 4)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- DIETA ----------
create table if not exists public.diet_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data date not null default current_date,
  refeicao text,
  alimento text not null,
  kcal int not null default 0,
  prot int not null default 0,
  carb int not null default 0,
  gord int not null default 0,
  origem text not null default 'manual',        -- manual | texto | audio
  created_at timestamptz not null default now()
);
alter table public.diet_entries enable row level security;
drop policy if exists "dieta própria" on public.diet_entries;
create policy "dieta própria" on public.diet_entries
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- PESO ----------
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data date not null default current_date,
  peso numeric not null
);
alter table public.weight_logs enable row level security;
drop policy if exists "peso próprio" on public.weight_logs;
create policy "peso próprio" on public.weight_logs
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- TREINOS (templates) ----------
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  publico boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.workouts enable row level security;
drop policy if exists "vê treino próprio ou público" on public.workouts;
create policy "vê treino próprio ou público" on public.workouts
  for select to authenticated using (owner_id = auth.uid() or publico = true);
drop policy if exists "gerencia treino próprio" on public.workouts;
create policy "gerencia treino próprio" on public.workouts
  for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  nome text not null,
  series text,
  alvo text,
  ordem int not null default 0
);
alter table public.workout_exercises enable row level security;
drop policy if exists "exercícios do treino visível" on public.workout_exercises;
create policy "exercícios do treino visível" on public.workout_exercises
  for select to authenticated using (
    exists (select 1 from public.workouts w
            where w.id = workout_id and (w.owner_id = auth.uid() or w.publico = true)));
drop policy if exists "gerencia exercícios do treino próprio" on public.workout_exercises;
create policy "gerencia exercícios do treino próprio" on public.workout_exercises
  for all to authenticated using (
    exists (select 1 from public.workouts w where w.id = workout_id and w.owner_id = auth.uid()))
  with check (
    exists (select 1 from public.workouts w where w.id = workout_id and w.owner_id = auth.uid()));

-- ---------- SESSÕES DE TREINO EXECUTADAS ----------
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id uuid references public.workouts(id) on delete set null,
  nome text,
  data date not null default current_date,
  created_at timestamptz not null default now()
);
alter table public.workout_sessions enable row level security;
drop policy if exists "sessão própria" on public.workout_sessions;
create policy "sessão própria" on public.workout_sessions
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise text not null,
  reps int not null default 0,
  carga numeric not null default 0,
  ordem int not null default 0
);
alter table public.sets enable row level security;
drop policy if exists "séries da sessão própria" on public.sets;
create policy "séries da sessão própria" on public.sets
  for all to authenticated using (
    exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (
    exists (select 1 from public.workout_sessions s where s.id = session_id and s.user_id = auth.uid()));

-- ---------- AMIZADES ----------
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users(id) on delete cascade,   -- quem pediu
  user_b uuid not null references auth.users(id) on delete cascade,   -- quem recebe
  status text not null default 'pendente',                            -- pendente | aceito
  created_at timestamptz not null default now(),
  unique (user_a, user_b)
);
alter table public.friendships enable row level security;
drop policy if exists "vê amizades próprias" on public.friendships;
create policy "vê amizades próprias" on public.friendships
  for select to authenticated using (auth.uid() = user_a or auth.uid() = user_b);
drop policy if exists "cria pedido de amizade" on public.friendships;
create policy "cria pedido de amizade" on public.friendships
  for insert to authenticated with check (auth.uid() = user_a);
drop policy if exists "responde/gerencia amizade" on public.friendships;
create policy "responde/gerencia amizade" on public.friendships
  for update to authenticated using (auth.uid() = user_a or auth.uid() = user_b);
drop policy if exists "remove amizade própria" on public.friendships;
create policy "remove amizade própria" on public.friendships
  for delete to authenticated using (auth.uid() = user_a or auth.uid() = user_b);

-- ---------- COMPARTILHAMENTOS (mandar treino/dieta/receita) ----------
create table if not exists public.shared_items (
  id uuid primary key default gen_random_uuid(),
  de_id uuid not null references auth.users(id) on delete cascade,
  para_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null,                       -- treino | dieta | receita
  titulo text not null,
  detalhe text,
  payload jsonb,                            -- conteúdo copiável
  copiado boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.shared_items enable row level security;
drop policy if exists "vê compartilhamentos próprios" on public.shared_items;
create policy "vê compartilhamentos próprios" on public.shared_items
  for select to authenticated using (auth.uid() = de_id or auth.uid() = para_id);
drop policy if exists "envia compartilhamento" on public.shared_items;
create policy "envia compartilhamento" on public.shared_items
  for insert to authenticated with check (auth.uid() = de_id);
drop policy if exists "destinatário gerencia" on public.shared_items;
create policy "destinatário gerencia" on public.shared_items
  for update to authenticated using (auth.uid() = para_id);
drop policy if exists "apaga compartilhamento próprio" on public.shared_items;
create policy "apaga compartilhamento próprio" on public.shared_items
  for delete to authenticated using (auth.uid() = de_id or auth.uid() = para_id);
