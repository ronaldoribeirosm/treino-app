import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { supabase } from '@/lib/supabase';
import {
  todayDiet as seedDiet,
  todayWorkout as seedWorkout,
  user,
  type DietEntry,
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

export interface CloudFriend {
  friendshipId: string;
  id: string;
  nome: string;
  handle: string;
  streak: number;
}

export interface PendingReq {
  friendshipId: string;
  id: string;
  nome: string;
  handle: string;
}

export type ShareTipo = 'treino' | 'dieta' | 'receita';
export interface CloudShare {
  id: string;
  fromNome: string;
  tipo: ShareTipo;
  titulo: string;
  detalhe: string;
  payload: unknown;
}

/** Deterministic accent color for a friend avatar (real friends have no computed level yet). */
const FRIEND_COLORS = ['#4ADE80', '#38BDF8', '#A855F7', '#FFC53D', '#FF2E97', '#2BE7FF'];
export function friendColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return FRIEND_COLORS[h % FRIEND_COLORS.length];
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
  cloudFriends: CloudFriend[];
  pending: PendingReq[];
  cloudInbox: CloudShare[];
  toast: ToastState | null;
  hydrated: boolean;

  // derived helpers
  todayKcal: () => number;
  doneCount: () => number;

  // actions
  setProfile: (p: Partial<Profile>) => void;
  loadCloud: (userId: string) => Promise<void>;
  loadSocial: (userId: string) => Promise<void>;
  setHandle: (handle: string) => Promise<boolean>;
  sendFriendRequest: (handle: string) => Promise<void>;
  acceptFriend: (friendshipId: string) => Promise<void>;
  sendShare: (paraId: string, tipo: ShareTipo, titulo: string, detalhe: string, payload: unknown) => Promise<void>;
  importShare: (share: CloudShare) => void;
  clearInbox: () => void;
  toggleExercise: (id: string) => void;
  addMeal: (entry: Omit<DietEntry, 'id'>) => void;
  removeMeal: (id: string) => void;
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
      cloudFriends: [],
      pending: [],
      cloudInbox: [],
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
        await get().loadSocial(userId);
      },

      // Load real friends, incoming requests and received shares.
      loadSocial: async (userId) => {
        const { data: fs } = await supabase
          .from('friendships')
          .select('*')
          .or(`user_a.eq.${userId},user_b.eq.${userId}`);
        const { data: shares } = await supabase
          .from('shared_items')
          .select('*')
          .eq('para_id', userId)
          .order('created_at', { ascending: false });

        const otherId = (f: { user_a: string; user_b: string }) =>
          f.user_a === userId ? f.user_b : f.user_a;
        const ids = new Set<string>();
        (fs ?? []).forEach((f) => ids.add(otherId(f)));
        (shares ?? []).forEach((s) => ids.add(s.de_id));

        let profs: Record<string, { nome: string; handle: string; streak: number }> = {};
        if (ids.size) {
          const { data: ps } = await supabase
            .from('profiles')
            .select('id,nome,handle,streak')
            .in('id', [...ids]);
          (ps ?? []).forEach((p) => {
            profs[p.id] = { nome: p.nome, handle: p.handle, streak: p.streak ?? 0 };
          });
        }
        const nameOf = (id: string) => profs[id]?.nome ?? 'Atleta';

        const cloudFriends: CloudFriend[] = (fs ?? [])
          .filter((f) => f.status === 'aceito')
          .map((f) => {
            const oid = otherId(f);
            return { friendshipId: f.id, id: oid, nome: nameOf(oid), handle: profs[oid]?.handle ?? '', streak: profs[oid]?.streak ?? 0 };
          });
        const pending: PendingReq[] = (fs ?? [])
          .filter((f) => f.status === 'pendente' && f.user_b === userId)
          .map((f) => ({ friendshipId: f.id, id: f.user_a, nome: nameOf(f.user_a), handle: profs[f.user_a]?.handle ?? '' }));
        const cloudInbox: CloudShare[] = (shares ?? []).map((s) => ({
          id: s.id,
          fromNome: nameOf(s.de_id),
          tipo: s.tipo,
          titulo: s.titulo,
          detalhe: s.detalhe ?? '',
          payload: s.payload,
        }));
        set({ cloudFriends, pending, cloudInbox });
      },

      setHandle: async (handle) => {
        const clean = handle.trim().replace(/^@/, '').toLowerCase();
        const userId = get().profile.id;
        if (!userId || clean.length < 3) {
          get().showToast('Handle muito curto', 'warn');
          return false;
        }
        const { error } = await supabase.from('profiles').update({ handle: clean }).eq('id', userId);
        if (error) {
          get().showToast(/duplicate|unique/i.test(error.message) ? 'Esse @ já está em uso' : 'Não deu pra salvar', 'warn');
          return false;
        }
        set((s) => ({ profile: { ...s.profile, handle: `@${clean}` } }));
        get().showToast(`Seu @ agora é @${clean}`, 'good');
        return true;
      },

      sendFriendRequest: async (handle) => {
        const clean = handle.trim().replace(/^@/, '').toLowerCase();
        const me = get().profile.id;
        if (!me) return;
        const { data: found } = await supabase.from('profiles').select('id,nome').eq('handle', clean).maybeSingle();
        if (!found) {
          get().showToast(`Ninguém com @${clean}`, 'warn');
          return;
        }
        if (found.id === me) {
          get().showToast('Esse é você 😅', 'warn');
          return;
        }
        const { error } = await supabase.from('friendships').insert({ user_a: me, user_b: found.id, status: 'pendente' });
        if (error) {
          get().showToast(/duplicate|unique/i.test(error.message) ? 'Pedido já existe' : 'Não deu pra enviar', 'warn');
          return;
        }
        get().showToast(`Pedido enviado pro ${found.nome}`, 'good');
      },

      acceptFriend: async (friendshipId) => {
        await supabase.from('friendships').update({ status: 'aceito' }).eq('id', friendshipId);
        const me = get().profile.id;
        if (me) await get().loadSocial(me);
        get().showToast('Amizade aceita 🤝', 'good');
      },

      sendShare: async (paraId, tipo, titulo, detalhe, payload) => {
        const me = get().profile.id;
        if (!me) return;
        const { error } = await supabase.from('shared_items').insert({ de_id: me, para_id: paraId, tipo, titulo, detalhe, payload });
        get().showToast(error ? 'Não deu pra enviar' : 'Enviado! 🚀', error ? 'warn' : 'good');
      },

      importShare: (share) => {
        // dieta: adiciona as refeições recebidas na sua dieta de hoje
        if (share.tipo === 'dieta' && Array.isArray(share.payload)) {
          (share.payload as Omit<DietEntry, 'id'>[]).forEach((e) => get().addMeal(e));
        }
        set((s) => ({ cloudInbox: s.cloudInbox.filter((i) => i.id !== share.id) }));
        supabase.from('shared_items').update({ copiado: true }).eq('id', share.id).then(() => {});
        get().showToast(`${share.titulo} importado!`, 'good');
      },

      clearInbox: () => {
        const me = get().profile.id;
        set({ cloudInbox: [] });
        if (me) supabase.from('shared_items').delete().eq('para_id', me).then(() => {});
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
