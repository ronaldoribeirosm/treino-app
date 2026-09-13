# 📍 STATUS — FORJA (treino-app)

Onde paramos, o que já foi feito e o que ainda falta. Atualizado em **2026-09-13**.

- **Repo:** https://github.com/ronaldoribeirosm/treino-app (público, branch `main`)
- **App:** mobile de treino & dieta social — Expo (React Native), roda no celular (Expo Go) e no navegador
- **Nome:** "FORJA" (provisório, trocável)
- **Backend:** Supabase (projeto `etnpurzrgpvoihdmwkeh`), plano grátis
- **Docs:** este arquivo · `README.md` · `PROGRESSO.md` (log honesto) · `docs/PROJETO.md` (arquitetura completa)

---

## ✅ O QUE JÁ ESTÁ PRONTO

### v0.1 — Base + design system (commit `56ff1e0`)
- Projeto Expo SDK 57 + expo-router, roda no web e no Expo Go.
- **Design system** dark "arcade gym" (neon lime/magenta/cyan): tokens, fontes (Bebas + Inter + Space Mono),
  componentes (`Text`, `Button`, `Card`, `Badge`, `Screen`, `PressableScale` com mola + háptico).
- **5 telas** + tab bar flutuante custom.
- **Avatar PowerCore** (SVG animado que muda de cor/intensidade pelo nível).
- **Gráficos custom** animados em SVG (linha com glow, anel, barras).
- Lógica de stats (`src/lib/stats.ts`): níveis, % de melhora, volume, regressão linear, previsão de meta.

### Etapa "ações locais" (commit `3602738`)
- Estado global com **Zustand** (`src/store/useStore.ts`).
- Marcar exercício, registrar refeição (bottom sheet), importar/limpar — com toast global + háptico.

### Etapa A — Persistência local (commit `b2916d1`)
- `zustand/persist` + AsyncStorage: dados sobrevivem a fechar/reabrir o app.
- Reset automático ao virar o dia. Gate de hidratação (não pisca dados de exemplo).

### Aba de Dieta + navegação (commit `e80f172`)
- Tela **Dieta** dedicada (anel de kcal, macros, refeições agrupadas, gráfico semanal, teaser de voz).
- 5 abas: **Home · Treino · Dieta · Stats · Squad**. Perfil acessível pelo avatar no topo da Home.

### Etapa B — Backend Supabase (commits `0b0b1b9`, `89d6ad9`, `af6b764`, `a87c93b`) ✅ COMPLETA
- **Banco:** 9 tabelas + RLS + trigger de perfil (`supabase/schema.sql`), criado via Management API.
- **Auth:** cadastro/login (marca FORJA), confirmação de email desligada, portão no `_layout`.
- **Sync perfil + dieta:** carrega do banco no login; registrar/remover refeição grava na nuvem por usuário.
- **Social real:** @handle editável, adicionar amigo por @, pedidos + aceitar, lista de amigos,
  mandar treino/dieta, caixa de entrada, importar.
- **Segurança:** validado com 2-3 contas reais que um amigo **não vê** a dieta privada do outro (só o compartilhado).

**→ Resultado: o app já é usável de verdade entre amigos.** Cada um se cadastra e escolhe um @ no Perfil.

---

## 🔜 O QUE FALTA

### Etapa C — IA de dieta (PRÓXIMA) — *bloqueada: precisa da chave do Gemini*
- Falar/digitar "comi 5 pães de queijo" → IA calcula kcal/macros e lança no dia.
- **Google Gemini Flash** (free tier, entende texto e áudio). **Preciso da chave grátis do usuário**
  (https://aistudio.google.com/apikey → `AIza...`) pra colocar no `.env`.
- Decisão pendente: texto primeiro e depois áudio, ou os dois juntos.
- Previsão de objetivo com narrativa da IA (o cálculo já existe em `stats.ts`; a IA só "narra").

### Backlog pós-C (do roadmap em `docs/PROJETO.md`)
1. **Sincronizar treino/sessões e stats** — hoje o treino, o histórico de exercícios, o peso e o
   gráfico semanal de kcal ainda são **dados de exemplo** (`src/data/mock.ts`). Falta gravar sessões
   de treino, séries e peso no banco (tabelas `workout_sessions`, `sets`, `weight_logs` já existem).
2. **Treino ao vivo** (v3) — sala sincronizada via Supabase Realtime + pódio comparativo com dados reais.
3. **Player de música** (v4) — YouTube sincronizado na sala (maior risco, deixado por último).
4. **Cron anti-pausa** do Supabase (cron-job.org pingando a cada ~5 dias) pra nunca pausar de graça.
5. **Editar perfil completo** (peso, meta, altura, objetivo) — hoje só o @handle é editável; o resto
   usa defaults até o usuário poder mudar.
6. **Publicar** — gerar APK/build (Expo EAS) pra instalar no celular sem Expo Go.

### Limpeza técnica (dívidas pequenas)
- **Contas de teste** criadas no Supabase durante o dev (`alice_`, `bob_`, `caio_`, `teste_`, `sync_`,
  `shot_`, `sdk_` @forja.app) — apagar em Authentication → Users (ou via Management API).
- **Arquivos leftover do template** não usados: `src/components/{animated-icon*,themed-text,themed-view,
  external-link,hint-row,web-badge,ui/collapsible}`, `src/constants/theme.ts`, `src/hooks/*`,
  `src/global.css`. Podem ser removidos.
- Rotacionar a **chave secreta** do Supabase (vazou no chat no início) e revogar o **token de setup**
  da Management API, se ainda não fez.

---

## 🎯 DECISÕES EM ABERTO (do usuário)
- Nome definitivo do app (provisório: **FORJA**).
- IA de dieta: **texto primeiro** ou **texto + áudio juntos**.
- Média de referência dos níveis: só do próprio usuário, dos amigos, ou tabela padrão.
- Média de manutenção calórica (hoje fixa em 2600 na previsão de objetivo) — ideal calcular por TMB.

---

## ▶️ COMO RODAR / CONTINUAR

```bash
cd C:\Users\mksbd\Projetos_Claude\treino-app
npm install

# navegador (preview rápido)
npx expo start --web --port 8081

# celular: instale o app "Expo Go", rode e escaneie o QR
npx expo start
```

- **`.env`** (não vai pro Git) precisa ter `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_KEY`
  (modelo em `.env.example`). Já está configurado nesta máquina.
- **Testar logado no navegador:** o Chrome da extensão não alcança o localhost desta máquina;
  usa-se **Playwright** local (`scripts/ashot.mjs`, `synctest.mjs`, `socialtest.mjs`, etc.).
- **Convenção:** commit + push a cada etapa; **nunca mencionar IA/Claude** em commits/docs.

---

## 🗂️ ESTRUTURA DO CÓDIGO
```
src/
  app/            rotas: index(Home), treino, dieta, progresso(Stats), social(Squad), perfil, _layout
  components/     PowerCore, AuthScreen, AddMealSheet, charts/, app-tabs, common
  ui/             design system: Text, Button, Card, Badge, Screen, PressableScale, Toast, BottomSheet
  theme/          tokens, fontes
  lib/            supabase (cliente), useAuth (sessão), stats (cálculos)
  store/          useStore (Zustand + persist + sync Supabase)
  data/           mock (dados de exemplo do que ainda não sincroniza)
supabase/         schema.sql (tabelas + RLS + trigger)
scripts/          ferramentas de teste (Playwright + setup do banco)
```
