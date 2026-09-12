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

**Decisões em aberto (do usuário, não técnicas):**
- Nome definitivo do app (provisório: "treino-app").
- Repo público vs privado (subiu como público seguindo a convenção padrão).
- Média de referência dos níveis: só do próprio usuário, dos amigos, ou tabela padrão.
