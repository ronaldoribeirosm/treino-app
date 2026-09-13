# Progresso

Log honesto do que foi realmente construído e validado a cada etapa.

## Etapa 1 — Fundação + front-end visual (v0.1)

**Validado de verdade (rodou no navegador via Playwright, sem erros de console):**
- Projeto Expo (SDK 57) + expo-router criado e rodando (`npx expo start --web`).
- Design system completo: tokens, 3 fontes (Bebas Neue, Inter, Space Mono), componentes
  (Text, Button, Card, Badge, Screen, PressableScale com mola + háptico).
- 5 telas navegáveis pela tab bar flutuante custom: Home, Treino, Stats, Squad, Perfil.
- Gráficos custom em SVG animados (linha com área/glow, anel de progresso, barras).
- Avatar PowerCore (SVG animado que muda de cor/intensidade pelo nível).
- Lógica de stats: níveis por exercício, % de melhora, volume, regressão linear, previsão de meta.
- **Bug de scroll no web corrigido** (wrapper do expo-router não limitava a altura;
  fix com `height: 100dvh` só no web). Confirmado com teste de wheel real (0 → 656px).

**Ainda NÃO existe (próximas etapas):**
- Persistência / backend (Supabase) — os dados são mock (`src/data/mock.ts`).
- Ações reais: registrar série, adicionar refeição, importar treino, iniciar sessão ao vivo — botões ainda visuais.
- IA de dieta (Gemini), treino ao vivo (realtime), player de música (YouTube).
- Nunca rodou num device físico ainda (só web headless via Playwright).

## Etapa 2 — Ações locais funcionando (estado real na sessão)

**Validado de verdade (testado com Playwright clicando de verdade, sem erros):**
- Store global com **Zustand** (`src/store/useStore.ts`) — prepara o terreno pro Supabase.
- **Marcar exercício** no Treino: alterna concluído, atualiza contador (2/5 → 3/5) e reflete na Home (store compartilhado). Toast de confirmação.
- **Registrar refeição** (bottom sheet animado): atalhos de alimentos + entrada manual; atualiza kcal, macros e o anel na Home ao vivo. Toast "+X kcal".
- **Importar / limpar** caixa de entrada no Squad, com empty state. Toast.
- **Toast global** animado (entra do topo, some sozinho) e feedback em todos os botões (os de fases futuras avisam "em breve").
- Navegação entre abas pelos botões de ação (Continuar treino, Abrir squad, etc.).

**Ainda NÃO existe:** persistência (fecha o app e volta ao mock), backend, IA real, treino ao vivo, música. Segue igual à Etapa 1.

## Etapa 3 (A) — Persistência local

**Validado de verdade (testado com Playwright, recarregando a página):**
- Estado salvo no aparelho com `zustand/persist` + AsyncStorage (localStorage no web).
- Teste: adicionar comida (4→5 itens, 1320→1410 kcal) → recarregar → **continua salvo**. Sem erros.
- Reset automático quando vira o dia: zera a dieta e desmarca o treino (`rolloverDay`).
- App só renderiza depois de hidratar o estado salvo (sem "piscar" o dado de exemplo).

**Agora o app lembra os dados ao fechar/reabrir** (uso solo já funciona de verdade no seu celular).

**Ainda NÃO existe:** backend/nuvem (dados ficam só no aparelho, sem sincronizar entre amigos), IA real, treino ao vivo, música. Próximo: **B — Supabase**.

## Etapa 4 (B) — Backend Supabase [em andamento]

**Feito e validado:**
- Projeto Supabase criado (região SP). Cliente configurado (`src/lib/supabase.ts`) lendo `.env`
  (`EXPO_PUBLIC_SUPABASE_URL` / `_KEY` com a chave publishable). Conexão testada (auth health 200).
- **Schema completo** em `supabase/schema.sql` (profiles, dieta, peso, treinos, sessões, séries,
  amizades, compartilhamentos) com **RLS** e trigger que cria o perfil no cadastro.
- **Login / cadastro** (`AuthScreen`) com a marca "FORJA"; portão de auth no `_layout`
  (sem sessão → login; com sessão → app). Tela renderiza sem erros.
- `.env` fora do Git; `.env.example` versionado.

**Concluído e validado (parte 1+2 — perfil/dieta):**
- Cadastro cria perfil (trigger); app carrega perfil + dieta do dia da nuvem no login.
- Registrar/remover refeição grava no Supabase por usuário. Provado limpando cache e recarregando.

**Concluído e validado (parte 3 — social, teste com 2-3 contas reais):**
- Editar @handle (Perfil); adicionar amigo por @; pedidos recebidos + aceitar; lista de amigos real.
- Enviar treino/dieta pra um amigo; caixa de entrada real; importar (dieta recebida entra na sua).
- **Segurança RLS validada:** um amigo NÃO vê a dieta privada do outro, só o que foi compartilhado.
- Aba de Dieta dedicada + navegação reorganizada (5 abas; Perfil no avatar da Home).

**Etapa B concluída.** App usável de verdade entre amigos.

**Pendências pós-B:** sincronizar treino/sessões e stats (ainda mock), cron anti-pausa do Supabase,
limpar contas de teste criadas durante o desenvolvimento.

**Nome do app:** provisório "FORJA" (trocável).

**Decisões em aberto (do usuário, não técnicas):**
- Nome definitivo do app (provisório: "treino-app").
- Repo público vs privado (subiu como público seguindo a convenção padrão).
- Média de referência dos níveis: só do próprio usuário, dos amigos, ou tabela padrão.
