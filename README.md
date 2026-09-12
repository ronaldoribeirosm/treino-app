# Treino App (nome provisório)

App mobile de treino & dieta com camada social, gamificação (avatar + níveis),
treino ao vivo, player de música e IA de dieta. Feito em **Expo + React Native**.

> Documento de arquitetura completo em [`docs/PROJETO.md`](docs/PROJETO.md).

## Rodar

```bash
npm install

# no navegador (preview rápido)
npm run web

# no celular: instala o app "Expo Go" (Play Store / App Store),
# roda o comando abaixo e escaneia o QR code
npx expo start
```

## O que já está pronto (v0.1 — front-end com dados de exemplo)

- **Design system** dark "arcade gym": tokens, tipografia (Bebas + Inter + Space Mono),
  componentes (Text, Button, Card, Badge, PressableScale com mola + háptico).
- **5 telas** navegáveis por uma tab bar flutuante custom:
  - **Home** — avatar PowerCore animado, nível, motor de status (cruza treino×dieta),
    KPIs, treino do dia, anel de kcal, evolução do supino, prévia do squad.
  - **Treino** — sessão ao vivo, checklist de exercícios, pódio comparativo do grupo.
  - **Stats** — previsão de objetivo, gráficos animados (peso, calorias, por exercício).
  - **Squad** — caixa de entrada de treinos/dietas/receitas compartilhados (importar/ver),
    lista de amigos com níveis.
  - **Perfil** — dados, objetivo, níveis por exercício, ajustes.
- **Gráficos** custom em SVG animados (linha com área/glow, anel de progresso, barras).
- **Avatar PowerCore** — SVG animado que muda de cor/intensidade conforme o nível.
- Lógica de **stats** (níveis, % de melhora, volume, regressão linear, previsão de meta).

## Próximas fases

Ver roadmap em `docs/PROJETO.md`. Resumo: wiring do **Supabase** (auth + banco),
registro real de treino/dieta, **IA de dieta** (Gemini, entende áudio),
**treino ao vivo** (realtime), **player YouTube** sincronizado.

## Estrutura

```
src/
  app/            rotas (expo-router): index, treino, progresso, social, perfil
  components/     PowerCore, charts/, app-tabs, common
  ui/             design system (Text, Button, Card, Badge, Screen, PressableScale)
  theme/          tokens, fontes
  lib/            stats (níveis, progressão, previsão)
  data/           mock (dados de exemplo)
```
