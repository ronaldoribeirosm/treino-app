import { levelFromRatio, LevelDef } from '@/theme/tokens';

export interface SetEntry {
  reps: number;
  carga: number; // kg
}

export interface SessionPoint {
  date: string; // ISO
  topSet: number; // heaviest working set (kg)
  volume: number; // sum(carga*reps)
}

/** 1RM estimate (Epley) from a working set. */
export function estimate1RM(carga: number, reps: number): number {
  return Math.round(carga * (1 + reps / 30));
}

/** Volume of a session = sum of carga*reps across all sets. */
export function sessionVolume(sets: SetEntry[]): number {
  return sets.reduce((acc, s) => acc + s.carga * s.reps, 0);
}

/** % improvement of current vs previous value. */
export function pctChange(current: number, previous: number): number {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

/** Level for a given lift vs a reference average. */
export function levelForLift(topSet: number, referenceAvg: number): LevelDef {
  return levelFromRatio(topSet / referenceAvg);
}

/** Linear regression slope + R² over a series (for "most linear progress"). */
export function linearFit(values: number[]): { slope: number; r2: number } {
  const n = values.length;
  if (n < 2) return { slope: 0, r2: 0 };
  const xs = values.map((_, i) => i);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = values[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const slope = denX ? num / denX : 0;
  const r2 = denX && denY ? (num * num) / (denX * denY) : 0;
  return { slope, r2 };
}

/** Overall status engine — crosses training consistency, calories and weight trend. */
export interface StatusInput {
  workoutsThisWeek: number;
  targetWorkouts: number;
  avgKcal: number;
  metaKcal: number;
  goal: 'bulking' | 'cutting' | 'manter';
}

export interface StatusResult {
  tone: 'good' | 'warn' | 'bad';
  headline: string;
  detail: string;
}

export function computeStatus(i: StatusInput): StatusResult {
  const diff = i.avgKcal - i.metaKcal;
  const onTrainingTrack = i.workoutsThisWeek >= i.targetWorkouts - 1;

  if (i.goal === 'bulking') {
    if (diff >= 0 && onTrainingTrack)
      return {
        tone: 'good',
        headline: 'No caminho do bulk',
        detail: `Superávit de ${Math.round(diff)} kcal/dia e treino em dia. Massa vindo.`,
      };
    if (diff < 0)
      return {
        tone: 'warn',
        headline: 'Comendo pouco pro bulk',
        detail: `Faltam ~${Math.abs(Math.round(diff))} kcal/dia pra crescer. Ajusta a dieta.`,
      };
  }
  if (i.goal === 'cutting') {
    if (diff <= 0 && onTrainingTrack)
      return {
        tone: 'good',
        headline: 'Cutting no ritmo',
        detail: `Déficit de ${Math.abs(Math.round(diff))} kcal/dia e treino mantido. Seco vindo.`,
      };
    if (diff > 0)
      return {
        tone: 'warn',
        headline: 'Estourando as kcal',
        detail: `${Math.round(diff)} kcal/dia acima da meta. Segura a mão.`,
      };
  }
  if (!onTrainingTrack)
    return {
      tone: 'bad',
      headline: 'Treino atrasado',
      detail: `Só ${i.workoutsThisWeek}/${i.targetWorkouts} treinos essa semana. Bora.`,
    };
  return {
    tone: 'good',
    headline: 'Tudo no eixo',
    detail: 'Dieta e treino batendo a meta.',
  };
}

/** Weeks of projection to reach a bodyweight goal from calorie balance. */
export function projectGoal(
  dailyBalance: number,
  currentKg: number,
  targetKg: number,
): { weeks: number; perWeekKg: number } {
  // ~7700 kcal per kg of body mass
  const perWeekKg = (dailyBalance * 7) / 7700;
  const deltaKg = targetKg - currentKg;
  const weeks = perWeekKg !== 0 ? Math.abs(deltaKg / perWeekKg) : Infinity;
  return { weeks: Math.round(weeks), perWeekKg };
}
