import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { supabase } from '@/lib/supabase';
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

export interface Profile {
  id: string | null;
  nome: string;
  handle: string;
  peso_atual: number;
  peso_meta: number;
  altura: number;
  goal: 'bulking' | 'cutting' | 'manter';
  meta_kcal: number;
  xp: number;
  streak: number;
}

const seedProfile: Profile = {
  id: null,
  nome: user.nome,
  handle: user.handle,
  peso_atual: user.pesoAtual,
  peso_meta: user.pesoMeta,
  altura: user.altura,
  goal: user.goal,
  meta_kcal: user.metaKcal,
  xp: user.xp,
  streak: user.streak,
};

/** RFC4122-ish v4 id (fine for client-generated row ids). */
function uid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface AppState {
  profile: Profile;
  metaKcal: number;
  workout: { nome: string; exercicios: WorkoutExercise[] };
  diet: DietEntry[];
  dietDate: string; // YYYY-MM-DD the diet/workout belongs to
  inbox: SharedItem[];
  friends: Friend[];
  importedCount: number;
  toast: ToastState | null;
  hydrated: boolean;

  // derived helpers
  todayKcal: () => number;
  doneCount: () => number;

  // actions
  setProfile: (p: Partial<Profile>) => void;
  loadCloud: (userId: string) => Promise<void>;
  toggleExercise: (id: string) => void;
  addMeal: (entry: Omit<DietEntry, 'id'>) => void;
  removeMeal: (id: string) => void;
  importItem: (id: string) => void;
  clearInbox: () => void;
  showToast: (msg: string, tone?: ToastTone) => void;
  hideToast: () => void;
  rolloverDay: () => void;
  setHydrated: () => void;
}

let toastSeq = 1;

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function seedExercicios(): WorkoutExercise[] {
  return seedWorkout.exercicios.map((e, i) => ({
    id: `ex${i}`,
    nome: e.nome,
    series: e.series,
    alvo: e.alvo,
    done: e.done,
    pct: e.done ? 3 : 0,
  }));
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: seedProfile,
      metaKcal: user.metaKcal,
      workout: { nome: seedWorkout.nome, exercicios: seedExercicios() },
      diet: [...seedDiet],
      dietDate: todayStr(),
      inbox: [...seedInbox],
      friends: [...seedFriends],
      importedCount: 0,
      toast: null,
      hydrated: false,

      todayKcal: () => get().diet.reduce((a, d) => a + d.kcal, 0),
      doneCount: () => get().workout.exercicios.filter((e) => e.done).length,

      toggleExercise: (id) =>
        set((s) => {
          const exercicios = s.workout.exercicios.map((e) =>
            e.id === id ? { ...e, done: !e.done, pct: !e.done ? 3 : 0 } : e,
          );
          return { workout: { ...s.workout, exercicios } };
        }),

      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),

      // Load the signed-in user's profile + today's diet from Supabase.
      loadCloud: async (userId) => {
        const [{ data: prof }, { data: rows }] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).single(),
          supabase.from('diet_entries').select('*').eq('user_id', userId).eq('data', todayStr()),
        ]);
        if (prof) {
          const merged: Profile = {
            id: prof.id,
            nome: prof.nome ?? seedProfile.nome,
            handle: prof.handle ? `@${prof.handle}` : seedProfile.handle,
            peso_atual: prof.peso_atual ?? seedProfile.peso_atual,
            peso_meta: prof.peso_meta ?? seedProfile.peso_meta,
            altura: prof.altura ?? seedProfile.altura,
            goal: prof.goal ?? seedProfile.goal,
            meta_kcal: prof.meta_kcal ?? seedProfile.meta_kcal,
            xp: prof.xp ?? 0,
            streak: prof.streak ?? 0,
          };
          set({ profile: merged, metaKcal: merged.meta_kcal });
        }
        if (rows) {
          set({
            diet: rows.map((r) => ({
              id: r.id,
              refeicao: r.refeicao ?? '',
              alimento: r.alimento,
              kcal: r.kcal,
              prot: r.prot,
              carb: r.carb,
              gord: r.gord,
              origem: r.origem,
            })),
            dietDate: todayStr(),
          });
        }
      },

      addMeal: (entry) => {
        const id = uid();
        set((s) => ({ diet: [...s.diet, { ...entry, id }] }));
        const userId = get().profile.id;
        if (userId) {
          supabase
            .from('diet_entries')
            .insert({ id, user_id: userId, data: todayStr(), ...entry })
            .then(({ error }) => {
              if (error) get().showToast('Não sincronizou a refeição', 'warn');
            });
        }
      },

      removeMeal: (id) => {
        set((s) => ({ diet: s.diet.filter((d) => d.id !== id) }));
        if (get().profile.id) supabase.from('diet_entries').delete().eq('id', id).then(() => {});
      },

      importItem: (id) =>
        set((s) => ({
          inbox: s.inbox.filter((i) => i.id !== id),
          importedCount: s.importedCount + 1,
        })),

      clearInbox: () => set({ inbox: [] }),

      showToast: (msg, tone = 'good') => set({ toast: { id: toastSeq++, msg, tone } }),
      hideToast: () => set({ toast: null }),

      // Fresh day: clear today's food log and un-check the workout.
      rolloverDay: () =>
        set((s) => {
          const today = todayStr();
          if (s.dietDate === today) return s;
          return {
            dietDate: today,
            diet: [],
            workout: {
              ...s.workout,
              exercicios: s.workout.exercicios.map((e) => ({ ...e, done: false, pct: 0 })),
            },
          };
        }),

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'treino-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      // persist only serializable data (skip the transient toast + derived fns)
      partialize: (s) => ({
        profile: s.profile,
        metaKcal: s.metaKcal,
        workout: s.workout,
        diet: s.diet,
        dietDate: s.dietDate,
        inbox: s.inbox,
        friends: s.friends,
        importedCount: s.importedCount,
      }),
      onRehydrateStorage: () => (state) => {
        state?.rolloverDay();
        state?.setHydrated();
      },
    },
  ),
);

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
