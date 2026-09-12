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

**Decisões em aberto (do usuário, não técnicas):**
- Nome definitivo do app (provisório: "treino-app").
- Repo público vs privado (subiu como público seguindo a convenção padrão).
- Média de referência dos níveis: só do próprio usuário, dos amigos, ou tabela padrão.
