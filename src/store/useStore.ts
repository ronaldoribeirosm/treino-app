import { create } from 'zustand';

import {
  friends as seedFriends,
  inbox as seedInbox,
  todayDiet as seedDiet,
  todayWorkout as seedWorkout,
  user,
  type DietEntry,
  type Friend,
  type SharedItem,
} from '@/data/mock';

export interface WorkoutExercise {
  id: string;
  nome: string;
  series: string;
  alvo: string;
  done: boolean;
  pct: number; // % vs last session
}

export type ToastTone = 'good' | 'info' | 'warn';
export interface ToastState {
  id: number;
  msg: string;
  tone: ToastTone;
}

interface AppState {
  metaKcal: number;
  workout: { nome: string; exercicios: WorkoutExercise[] };
  diet: DietEntry[];
  inbox: SharedItem[];
  friends: Friend[];
  importedCount: number;
  toast: ToastState | null;

  // derived helpers
  todayKcal: () => number;
  doneCount: () => number;

  // actions
  toggleExercise: (id: string) => void;
  addMeal: (entry: Omit<DietEntry, 'id'>) => void;
  removeMeal: (id: string) => void;
  importItem: (id: string) => void;
  clearInbox: () => void;
  showToast: (msg: string, tone?: ToastTone) => void;
  hideToast: () => void;
}

let toastSeq = 1;

export const useStore = create<AppState>((set, get) => ({
  metaKcal: user.metaKcal,
  workout: {
    nome: seedWorkout.nome,
    exercicios: seedWorkout.exercicios.map((e, i) => ({
      id: `ex${i}`,
      nome: e.nome,
      series: e.series,
      alvo: e.alvo,
      done: e.done,
      pct: e.done ? 3 : 0,
    })),
  },
  diet: [...seedDiet],
  inbox: [...seedInbox],
  friends: [...seedFriends],
  importedCount: 0,
  toast: null,

  todayKcal: () => get().diet.reduce((a, d) => a + d.kcal, 0),
  doneCount: () => get().workout.exercicios.filter((e) => e.done).length,

  toggleExercise: (id) =>
    set((s) => {
      const exercicios = s.workout.exercicios.map((e) =>
        e.id === id ? { ...e, done: !e.done, pct: !e.done ? 3 : 0 } : e,
      );
      return { workout: { ...s.workout, exercicios } };
    }),

  addMeal: (entry) =>
    set((s) => ({
      diet: [...s.diet, { ...entry, id: `d${Date.now()}` }],
    })),

  removeMeal: (id) => set((s) => ({ diet: s.diet.filter((d) => d.id !== id) })),

  importItem: (id) =>
    set((s) => ({
      inbox: s.inbox.filter((i) => i.id !== id),
      importedCount: s.importedCount + 1,
    })),

  clearInbox: () => set({ inbox: [] }),

  showToast: (msg, tone = 'good') => set({ toast: { id: toastSeq++, msg, tone } }),
  hideToast: () => set({ toast: null }),
}));

/** Quick-add food presets for the "registrar refeição" sheet (stand-in for the future AI). */
export const foodPresets: { alimento: string; kcal: number; prot: number; carb: number; gord: number }[] = [
  { alimento: 'Ovo cozido', kcal: 78, prot: 6, carb: 0, gord: 5 },
  { alimento: 'Pão de queijo', kcal: 60, prot: 1, carb: 6, gord: 4 },
  { alimento: 'Whey (1 scoop)', kcal: 120, prot: 24, carb: 3, gord: 2 },
  { alimento: 'Banana', kcal: 90, prot: 1, carb: 23, gord: 0 },
  { alimento: 'Arroz (100g)', kcal: 130, prot: 2, carb: 28, gord: 0 },
  { alimento: 'Peito de frango (100g)', kcal: 165, prot: 31, carb: 0, gord: 4 },
  { alimento: 'Batata doce (100g)', kcal: 86, prot: 2, carb: 20, gord: 0 },
  { alimento: 'Aveia (40g)', kcal: 150, prot: 5, carb: 27, gord: 3 },
];
