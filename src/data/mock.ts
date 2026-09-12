import { levelForLift } from '@/lib/stats';
import { LevelDef } from '@/theme/tokens';

export interface Exercise {
  id: string;
  nome: string;
  grupo: string;
  referenceAvg: number; // population/friends average top set (kg)
  history: { date: string; topSet: number; volume: number }[];
}

export interface Friend {
  id: string;
  nome: string;
  handle: string;
  levelName: string;
  levelColor: string;
  online: boolean;
  streak: number;
  lastAction: string;
}

export interface SharedItem {
  id: string;
  from: string;
  handle: string;
  tipo: 'treino' | 'dieta' | 'receita';
  titulo: string;
  detalhe: string;
}

export interface DietEntry {
  id: string;
  refeicao: string;
  alimento: string;
  kcal: number;
  prot: number;
  carb: number;
  gord: number;
  origem: 'manual' | 'texto' | 'audio';
}

export const user = {
  nome: 'Ronaldo',
  handle: '@ronaldo',
  pesoAtual: 78.4,
  pesoMeta: 84,
  altura: 179,
  goal: 'bulking' as const,
  metaKcal: 2900,
  streak: 12,
  xp: 7420,
  xpToNext: 10000,
};

// 8 weeks of bench progression
const bench = [72.5, 75, 75, 77.5, 80, 80, 82.5, 85];
export const exercises: Exercise[] = [
  {
    id: 'supino',
    nome: 'Supino Reto',
    grupo: 'Peito',
    referenceAvg: 80,
    history: bench.map((topSet, i) => ({
      date: `2026-07-${String(1 + i * 5).padStart(2, '0')}`,
      topSet,
      volume: Math.round(topSet * 8 * 3 * (0.95 + i * 0.01)),
    })),
  },
  {
    id: 'agacho',
    nome: 'Agachamento',
    grupo: 'Perna',
    referenceAvg: 110,
    history: [95, 100, 100, 110, 115, 120, 125, 130].map((topSet, i) => ({
      date: `2026-07-${String(1 + i * 5).padStart(2, '0')}`,
      topSet,
      volume: Math.round(topSet * 6 * 4),
    })),
  },
  {
    id: 'terra',
    nome: 'Levantamento Terra',
    grupo: 'Costas',
    referenceAvg: 130,
    history: [120, 125, 130, 130, 140, 145, 150, 160].map((topSet, i) => ({
      date: `2026-07-${String(1 + i * 5).padStart(2, '0')}`,
      topSet,
      volume: Math.round(topSet * 5 * 3),
    })),
  },
];

export function exerciseLevel(ex: Exercise): LevelDef {
  const latest = ex.history[ex.history.length - 1].topSet;
  return levelForLift(latest, ex.referenceAvg);
}

/** Overall level = based on average ratio across exercises. */
export function overallLevel(): LevelDef {
  const ratios = exercises.map((e) => e.history[e.history.length - 1].topSet / e.referenceAvg);
  const avg = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  return levelForLift(avg, 1);
}

export const bodyweightHistory = [
  { date: '2026-07-01', kg: 75.8 },
  { date: '2026-07-08', kg: 76.2 },
  { date: '2026-07-15', kg: 76.9 },
  { date: '2026-07-22', kg: 77.1 },
  { date: '2026-07-29', kg: 77.8 },
  { date: '2026-08-05', kg: 78.0 },
  { date: '2026-08-12', kg: 78.4 },
];

export const kcalWeek = [
  { dia: 'S', kcal: 2980 },
  { dia: 'T', kcal: 3120 },
  { dia: 'Q', kcal: 2760 },
  { dia: 'Q', kcal: 3010 },
  { dia: 'S', kcal: 2890 },
  { dia: 'S', kcal: 3240 },
  { dia: 'D', kcal: 2650 },
];

export const todayDiet: DietEntry[] = [
  { id: 'd1', refeicao: 'Café', alimento: '5 pães de queijo', kcal: 300, prot: 6, carb: 30, gord: 18, origem: 'audio' },
  { id: 'd2', refeicao: 'Café', alimento: 'Café com açúcar', kcal: 40, prot: 0, carb: 10, gord: 0, origem: 'audio' },
  { id: 'd3', refeicao: 'Almoço', alimento: 'Arroz, feijão, frango 200g', kcal: 720, prot: 52, carb: 80, gord: 14, origem: 'texto' },
  { id: 'd4', refeicao: 'Lanche', alimento: 'Whey + banana', kcal: 260, prot: 28, carb: 30, gord: 3, origem: 'manual' },
];

export const friends: Friend[] = [
  { id: 'f1', nome: 'Léo', handle: '@leozin', levelName: 'MUTANTE', levelColor: '#FFC53D', online: true, streak: 21, lastAction: 'PR no terra: 180kg' },
  { id: 'f2', nome: 'Bia', handle: '@biamonstra', levelName: 'FERA', levelColor: '#A855F7', online: true, streak: 9, lastAction: 'Fechou treino de perna' },
  { id: 'f3', nome: 'Duda', handle: '@duda', levelName: 'ACIMA DA MÉDIA', levelColor: '#38BDF8', online: false, streak: 4, lastAction: 'Mandou uma dieta pra você' },
  { id: 'f4', nome: 'Rafa', handle: '@rafa', levelName: 'NA MÉDIA', levelColor: '#4ADE80', online: false, streak: 2, lastAction: 'Entrou no app' },
];

export const inbox: SharedItem[] = [
  { id: 's1', from: 'Duda', handle: '@duda', tipo: 'dieta', titulo: 'Dieta cutting 2400kcal', detalhe: 'Alta proteína · 5 refeições' },
  { id: 's2', from: 'Léo', handle: '@leozin', tipo: 'treino', titulo: 'Push Pesado A', detalhe: '6 exercícios · foco em peito' },
  { id: 's3', from: 'Bia', handle: '@biamonstra', tipo: 'receita', titulo: 'Panqueca proteica', detalhe: '32g prot · 310 kcal' },
];

// Post-workout podium from last live session
export interface PodiumRow {
  nome: string;
  color: string;
  volume: number;
  progresso: number; // % vs last session
  topSet: number;
}

export const lastLivePodium: PodiumRow[] = [
  { nome: 'Ronaldo', color: '#C6F542', volume: 9840, progresso: 6.2, topSet: 85 },
  { nome: 'Léo', color: '#FFC53D', volume: 11200, progresso: 3.1, topSet: 100 },
  { nome: 'Bia', color: '#A855F7', volume: 7600, progresso: 8.4, topSet: 70 },
];

export const todayWorkout = {
  nome: 'Push A — Peito & Ombro',
  exercicios: [
    { nome: 'Supino Reto', series: '4×8', alvo: '82,5 kg', done: true },
    { nome: 'Supino Inclinado Halter', series: '3×10', alvo: '30 kg', done: true },
    { nome: 'Desenv. Militar', series: '4×8', alvo: '45 kg', done: false },
    { nome: 'Elevação Lateral', series: '3×15', alvo: '12 kg', done: false },
    { nome: 'Tríceps Corda', series: '4×12', alvo: '25 kg', done: false },
  ],
};
