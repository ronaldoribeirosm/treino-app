# 💪 Projeto: App de Treino & Dieta Social (nome provisório)

> App mobile pra registrar treino e dieta com **camada social**, **gamificação com avatar que evolui**, **treino ao vivo sincronizado com amigos**, **player de música em grupo** e **IA que entende áudio pra registrar dieta**.
>
> **Regra de ouro do projeto:** tudo com ferramentas **100% gratuitas**, otimizando o uso dos free tiers.

**Status:** 🟡 Fase de arquitetura
**Última atualização:** 2026-09-12

---

## 📑 Índice

1. [Visão geral](#1-visão-geral)
2. [Funcionalidades](#2-funcionalidades)
3. [Stack & recursos gratuitos](#3-stack--recursos-gratuitos)
4. [Como burlar os limites dos planos free](#4-como-burlar-os-limites-dos-planos-free)
5. [Arquitetura](#5-arquitetura)
6. [Modelo de dados](#6-modelo-de-dados)
7. [Design & gamificação](#7-design--gamificação)
8. [Sistema de níveis](#8-sistema-de-níveis)
9. [Compartilhamento social](#9-compartilhamento-social)
10. [Treino ao vivo & comparativo](#10-treino-ao-vivo--comparativo)
11. [Player de música em grupo](#11-player-de-música-em-grupo)
12. [IA de dieta & previsão de objetivo](#12-ia-de-dieta--previsão-de-objetivo)
13. [Operação & custos](#13-operação--custos)
14. [Roadmap por fases](#14-roadmap-por-fases)
15. [Riscos & decisões em aberto](#15-riscos--decisões-em-aberto)

---

## 1. Visão geral

App de academia com o básico (registrar treino, dieta, peso, exercícios) **mais um pacote de diferenciais**:

- **Social real:** conectar amigos, mandar treino/dieta/receita, ou o amigo copiar vendo você usar.
- **Gamificação:** um personagem/avatar que evolui junto com sua carga; níveis com nome e cor.
- **Análise cruzada:** gráficos que cruzam treino × dieta × peso pra dizer se está indo bem.
- **Treino ao vivo:** treinar junto sincronizado, dividindo séries, com comparativo entre amigos.
- **Música em grupo:** todos na sessão ouvem a mesma música (YouTube) ao mesmo tempo.
- **IA por áudio:** falar "comi 5 pães de queijo" e a IA lançar as calorias no calendário.

### Público
Você e seus amigos primeiro. Escalável depois, mas o design de custo assume **grupo pequeno** (dezenas, não milhares).

---

## 2. Funcionalidades

### 2.1 Núcleo (fácil — base de tudo)
- [ ] Cadastro/login de usuário
- [ ] Catálogo de exercícios (por grupo muscular)
- [ ] Criar treinos (templates) com exercícios, séries, reps, carga
- [ ] Registrar sessão de treino executada
- [ ] Registrar dieta (refeições, kcal, macros)
- [ ] Registrar peso corporal
- [ ] Calendário de kcal

### 2.2 Progressão & análise (médio)
- [ ] Gráfico de progressão por exercício (carga × tempo)
- [ ] Gráfico de peso corporal × tempo
- [ ] Gráfico de kcal (consumido vs. meta)
- [ ] **Motor de status**: cruza treino + dieta + peso → "tudo indo bem" / alerta
- [ ] Cálculo de % de melhora vs. treino anterior

### 2.3 Gamificação (fácil — cliente)
- [ ] Avatar/personagem que troca de sprite conforme evolui
- [ ] Sistema de níveis por exercício (cor + nome)
- [ ] Nível geral do usuário
- [ ] Badges/conquistas

### 2.4 Social (fácil)
- [ ] Adicionar amigos
- [ ] Enviar treino para um amigo
- [ ] Enviar dieta/receita para um amigo
- [ ] "Copiar" treino/dieta de um amigo (importar pro seu perfil)
- [ ] Feed/atividade dos amigos (opcional)

### 2.5 Treino ao vivo (médio)
- [ ] Criar sala de treino ao vivo
- [ ] Amigos entram e recebem o mesmo treino
- [ ] Sincronização de séries/reps em tempo real
- [ ] % de melhora ao vivo (vs. sua última sessão)
- [ ] **Pódio comparativo** pós-treino entre os participantes

### 2.6 Música (difícil — fase posterior)
- [ ] Player YouTube embutido
- [ ] Fila compartilhada (todos escolhem)
- [ ] Sincronização de reprodução na sala

### 2.7 IA (médio)
- [ ] Registrar dieta por texto ("comi 5 pães de queijo")
- [ ] Registrar dieta por **áudio**
- [ ] Estimar kcal/macros automaticamente
- [ ] Previsão de objetivo (ganhar/perder peso e prazo)

---

## 3. Stack & recursos gratuitos

| Camada | Ferramenta grátis | O que faz |
|--------|-------------------|-----------|
| **App mobile** | **Expo (React Native)** | Um código pra iOS + Android; reaproveita React |
| **Backend / Banco** | **Supabase** | Postgres + Auth + Storage + Realtime, tudo integrado |
| **Tempo real** | **Supabase Realtime** | Salas de treino ao vivo e sincronização de música |
| **IA (texto + áudio)** | **Google Gemini API (Flash)** | Entende áudio nativo; estima kcal; gera narrativas |
| **Música** | **react-native-youtube-iframe** + YouTube Data API | Tocar (grátis) e buscar músicas |
| **Gráficos** | **victory-native** ou **react-native-gifted-charts** | Todos os gráficos de progressão |
| **Estado** | **Zustand** ou **React Query** | Gerência de estado/cache leve |
| **Sprites/arte** | Assets locais (pixel art) | Avatar e níveis |
| **Manter Supabase acordado** | **cron-job.org** | Ping periódico grátis |
| **Versionamento** | **GitHub** (repo privado grátis) | Código |

### Por que essas escolhas
- **Supabase > Firebase** aqui: os dados são **relacionais** (exercício → série → sessão → progressão). Cruzar treino × dieta vira **uma query SQL**; no Firestore vira leitura em excesso que estoura o free tier.
- **Gemini > Claude/GPT** *para este caso*: é o único com **free tier real** que ainda por cima **entende áudio nativo** — que é justo o requisito "IA tem que entender áudio". A arquitetura fica agnóstica (o "cérebro" é uma função isolada e trocável).
- **YouTube > Spotify**: o Spotify **não tem API pública de sessão em grupo**. O YouTube permite embutir e controlar o player de graça → sincronização real é possível.

---

## 4. Como burlar os limites dos planos free

| Ferramenta | Limite do free | Estratégia |
|-----------|----------------|-----------|
| **Supabase** | 500MB banco · 1GB storage · pausa após 7 dias sem uso | Cron (cron-job.org) pinga a cada ~5 dias e mantém acordado; dados de treino são leves (texto/números) → 500MB dura muito |
| **Supabase Realtime** | ~200 conexões simultâneas | Suficiente pra grupos de amigos |
| **Gemini Flash** | ~15 req/min · ~1500 req/dia | **Cachear** alimentos já reconhecidos (não repetir chamada pra "pão de queijo"); rodar previsão de objetivo **1x/dia**, não a cada abertura |
| **YouTube Data API** | 10.000 unidades/dia (busca custa 100) | **Tocar não gasta cota**; só a busca gasta → cachear resultados de busca; permitir colar link direto |
| **Expo EAS Build** | ~30 builds/mês | Usar **Expo Go** no desenvolvimento (builds ilimitados); só gerar build de verdade ao publicar |
| **Storage (fotos avatar)** | 1GB | Comprimir imagens; usar sprites locais no app (não sobem pro servidor) |

**Princípio geral:** empurrar o máximo de lógica pro **cliente** (níveis, sprites, cálculos de progressão) → menos chamadas ao servidor e à IA = free tier dura mais.

---

## 5. Arquitetura

```
┌─────────────────────────────────────────────┐
│                APP (Expo / RN)               │
│  ┌────────────┐  ┌───────────┐  ┌─────────┐  │
│  │  Telas UI  │  │  Estado   │  │ Lógica  │  │
│  │ (gráficos, │  │ (Zustand) │  │ níveis, │  │
│  │  avatar)   │  │           │  │ % melhora│ │
│  └────────────┘  └───────────┘  └─────────┘  │
└───────┬───────────────┬──────────────┬───────┘
        │               │              │
        │ SQL/Auth      │ Realtime     │ HTTP
        ▼               ▼              ▼
┌──────────────┐ ┌────────────┐ ┌────────────┐
│   Supabase   │ │  Supabase  │ │   Gemini   │
│ Postgres+Auth│ │  Realtime  │ │ (dieta/IA) │
│  + Storage   │ │ (salas)    │ └────────────┘
└──────────────┘ └────────────┘
                                 ┌────────────┐
                                 │  YouTube   │
                                 │  (player)  │
                                 └────────────┘
```

**Fluxos-chave:**
- **Registrar treino:** app → insere em `sets`/`workout_sessions` no Supabase → recalcula nível/avatar no cliente.
- **Treino ao vivo:** app entra em canal Realtime da `live_session` → estados de série trafegam entre participantes → ao fim, query gera o pódio.
- **Dieta por áudio:** app grava áudio → envia pro Gemini → recebe `{alimento, kcal, macros}` → grava em `diet_entries`.
- **Música:** host publica `{videoId, segundo, tocando?}` no canal → clientes dão seek no iframe.

---

## 6. Modelo de dados

```sql
-- Usuários
users(id, nome, avatar_nivel, peso_atual, altura, objetivo /* cutting|bulking|manter */, meta_kcal)

-- Catálogo compartilhado de exercícios
exercises(id, nome, grupo_muscular)

-- Treino (template reutilizável)
workouts(id, dono_id → users, nome, publico bool)
workout_exercises(id, workout_id → workouts, exercise_id → exercises, series_alvo, reps_alvo, ordem)

-- Sessão de treino EXECUTADA
workout_sessions(id, workout_id, user_id, data, live_session_id? → live_sessions)
sets(id, session_id → workout_sessions, exercise_id, reps, carga, ordem)  -- cada série feita

-- Dieta & peso
diet_entries(id, user_id, data, refeicao, alimento, kcal, prot, carb, gord, origem /* manual|texto|audio */)
weight_logs(id, user_id, data, peso)

-- Social
friendships(id, user_a → users, user_b → users, status /* pendente|aceito */)
shared_items(id, de_id → users, para_id → users, tipo /* treino|dieta|receita */, ref_id, copiado bool, data)
recipes(id, dono_id, nome, ingredientes jsonb, kcal_total, macros jsonb, publico bool)

-- Treino ao vivo
live_sessions(id, host_id → users, workout_id, iniciada_em, encerrada_em)
live_participants(id, live_session_id → live_sessions, user_id, entrou_em)

-- Música (efêmero — pode viver só no Realtime, não precisa persistir)
-- playback_state: { live_session_id, video_id, segundo, tocando, atualizado_em }
```

### Queries que este modelo torna triviais
- **Progressão de um exercício:** `sets` filtrado por `exercise_id` + `user_id`, ordenado por data.
- **% de melhora:** comparar carga da sessão atual vs. anterior no mesmo exercício.
- **Volume de treino:** `SUM(carga * reps)` por sessão.
- **Cruzamento treino × dieta:** join de `sets`, `diet_entries`, `weight_logs` por período.

---

## 7. Design & gamificação

### Estética
- **Pegada retrô / pixel art** (combina com projetos-irmãos de arcade).
- Paleta escura com cores de nível bem vivas (feedback visual forte).
- UI limpa: registrar uma série tem que ser rápido (poucos toques).

### Avatar / personagem
- Um **protagonista** que **troca de sprite** conforme a carga/nível sobe.
- "Fica ativo o tempo todo": recalculado a cada série registrada, sempre visível no perfil/home.
- A evolução visual reflete o **nível geral** (média dos níveis por exercício).

### Elementos de tela
- **Home:** avatar + nível atual + resumo do dia (kcal, próximo treino).
- **Treino:** lista de exercícios, registro rápido de série, % de melhora inline.
- **Progresso:** gráficos cruzados + status do motor.
- **Social:** amigos, itens recebidos, feed.
- **Ao vivo:** sala, sincronização, player de música, pódio no fim.

---

## 8. Sistema de níveis

Para cada exercício, compara-se a carga do usuário com uma **média de referência** (a dele mesmo ao longo do tempo e/ou a média dos amigos). O resultado cai num nível com **nome + cor**:

| Nível | Regra (ex.: supino, média 80 kg) | Cor |
|-------|----------------------------------|-----|
| 🩶 Iniciante | < 60% da média | Cinza |
| 💚 Na Média | ~80–110% (faz com 80) | Verde |
| 💙 Acima da Média | 110–125% (faz com 100) | Azul |
| 💜 Fera | 125–150% | Roxo |
| 🟡 **Mutante** | > 150% (faz com 120) | Dourado/Vermelho |

- **Nível por exercício** → soma num **nível geral** (média ponderada por volume).
- Sprites do avatar mudam por faixa de nível geral.
- Nomes/faixas são **configuráveis** (constante no código) → fácil ajustar depois.

---

## 9. Compartilhamento social

> ⭐ Funcionalidade central: mandar/copiar treino, dieta e receita.

Três formas de compartilhar:

1. **Enviar diretamente** — escolhe um amigo e manda um `workout`, `diet_entries` ou `recipe`. Vai pra `shared_items`; o amigo recebe uma notificação e pode **importar** (clona pro perfil dele com `dono_id` próprio).
2. **Copiar vendo você usar** — treinos/dietas marcados como `publico=true` aparecem no perfil/feed; o amigo clica em **"Copiar"** e importa.
3. **Receitas** — entidade própria (`recipes`) com ingredientes + macros; some ao registrar dieta ou compartilha igual treino.

**Regra de cópia:** importar **clona** o item (nunca referencia o original) → o amigo edita à vontade sem afetar você, e você mantém o crédito de "origem".

Fluxo:
```
Você  ──envia treino──►  shared_items(tipo=treino, copiado=false)
Amigo ──abre e "importa"──►  cria workout novo (dono=amigo) + marca copiado=true
```

---

## 10. Treino ao vivo & comparativo

### Sessão ao vivo
- Host cria `live_session` a partir de um `workout` → gera um canal Realtime.
- Amigos entram (`live_participants`) e recebem o **mesmo treino**.
- Ao registrar cada série, o estado trafega pelo canal (todos veem o progresso de todos).
- **% de melhora ao vivo:** cada série é comparada com a última sessão daquela pessoa no mesmo exercício.

### Pódio comparativo (pós-treino)
Ao encerrar, gera-se um ranking com métricas calculadas de `sets`:

| Métrica | Cálculo |
|---------|---------|
| 🏋️ **Maior volume** | `SUM(carga × reps)` da sessão |
| 📈 **Maior progresso %** | maior ganho vs. própria sessão anterior |
| 📊 **Progressão mais linear** | maior R² na reta de evolução histórica |
| 💪 **Maior carga absoluta** | maior `carga` levantada |

Ex.: *"Ronaldo teve o maior volume · Fulano pegou mais peso · Beltrano progrediu mais linearmente."*

---

## 11. Player de música em grupo

> ⚠️ **Feature de maior risco.** Recomendado para **fase posterior** (v3), depois de validar o resto.

- **Spotify não serve:** sem API pública de sessão em grupo (o "Jam" é fechado).
- **Solução com YouTube:** embutir `react-native-youtube-iframe`.
- **Sincronização:** o host publica no canal Realtime `{videoId, segundo, tocando?}`; cada cliente dá **seek** no próprio player pra igualar (fica ~±1–2s, aceitável).
- **Fila compartilhada:** todos adicionam vídeos; buscar usa YouTube Data API (cachear pra poupar cota) ou colar link direto.

---

## 12. IA de dieta & previsão de objetivo

### Registro por texto/áudio (Gemini Flash — grátis, entende áudio)
```
Usuário fala/digita: "comi 5 pães de queijo e um café com açúcar"
        │
        ▼
Gemini retorna JSON estruturado:
[
  { "alimento": "pão de queijo", "qtd": 5, "kcal": 300, "prot": 6, "carb": 30, "gord": 18 },
  { "alimento": "café com açúcar", "qtd": 1, "kcal": 40, ... }
]
        │
        ▼
Grava em diet_entries → aparece no calendário de kcal
```
- **Cache:** alimentos já reconhecidos não chamam a IA de novo.
- **origem** guarda se foi `texto`, `audio` ou `manual`.

### Previsão de objetivo
- Preferir **matemática pura** (déficit/superávit calórico) → confiável e sem gastar cota:
  - `saldo_diário = kcal_consumida − (TMB + gasto_treino_estimado)`
  - projeta variação de peso por semana → estima prazo pro objetivo.
- A IA entra só pra **narrar** em linguagem natural (1x/dia): *"No seu ritmo (~−0,4 kg/semana) você bate sua meta em ~6 semanas."*

---

## 13. Operação & custos

| Item | Custo |
|------|-------|
| Desenvolvimento (Expo Go) | R$ 0 |
| Supabase (free tier) | R$ 0 |
| Gemini API (free tier) | R$ 0 |
| YouTube player | R$ 0 |
| GitHub (repo privado) | R$ 0 |
| **Total mensal (uso entre amigos)** | **R$ 0** |

**Quando começaria a custar:** só ao escalar muito (banco > 500MB, > 1500 chamadas de IA/dia, ou publicar nas lojas — Google Play custa US$25 uma vez, Apple US$99/ano). Pra uso entre amigos, fica no zero.

**Monitorar:** tamanho do banco no Supabase, cota diária do Gemini e do YouTube.

---

## 14. Roadmap por fases

| Fase | Entregas | Módulos |
|------|----------|---------|
| **v0 — Setup** | Projeto Expo + Supabase + auth + esquema do banco | Infra |
| **v1 — Núcleo** | Registrar treino/dieta/peso · catálogo de exercícios · gráficos básicos | 2.1, 2.2 |
| **v1.5 — Gamificação** | Avatar + níveis por cor/nome + badges | 2.3 |
| **v2 — Social** | Amigos · enviar/copiar treino/dieta/receita · feed | 2.4, 9 |
| **v2.5 — IA** | Dieta por texto/áudio · previsão de objetivo | 2.7, 12 |
| **v3 — Ao vivo** | Sala sincronizada · % ao vivo · pódio comparativo | 2.5, 10 |
| **v4 — Música** | Player YouTube sincronizado · fila compartilhada | 2.6, 11 |

**Princípio:** cada fase entrega um app **usável por si só**. Não partir pra próxima antes da anterior funcionar.

---

## 15. Riscos & decisões em aberto

### Riscos
- 🔴 **Música sincronizada** — maior risco técnico; isolada na última fase de propósito.
- 🟡 **Cota da IA** — mitigada por cache + rodar previsão 1x/dia.
- 🟡 **Supabase pausar** — mitigado pelo cron de ping.
- 🟡 **Precisão de kcal da IA** — sempre permitir edição manual do valor estimado.

### Decisões em aberto
- [ ] **Nome do app** (provisório: "treino-app")
- [ ] **Objetivo:** uso real entre amigos vs. portfólio? (afeta prioridades)
- [ ] Média de referência dos níveis: só do próprio usuário, ou média dos amigos, ou tabela padrão?
- [ ] Feed social: entra na v2 ou fica pra depois?
- [ ] Publicar nas lojas ou distribuir via Expo/APK direto?

---

*Documento vivo — atualizar conforme o projeto evolui.*
