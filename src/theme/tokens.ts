/**
 * Design tokens — "Arcade Gym" dark system.
 * Committed dark theme: night gym / fighting-game HUD energy.
 * Neon accents on near-black (violet-tinted). No cream, no gradients-as-text.
 */

export const palette = {
  // Surfaces — near-black with a faint violet tint (not warm)
  bg: '#0A0A0F',
  bgElevated: '#101019',
  surface: '#15151F',
  surfaceHi: '#1E1E2B',
  surfacePressed: '#24243440',

  // Hairlines
  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.14)',

  // Ink
  ink: '#F5F5FA',
  inkMuted: '#9B9BB4',
  inkFaint: '#63637E',

  // Brand accents
  lime: '#C6F542', // primary action / gains / "GO"
  limeDim: '#93B834',
  magenta: '#FF2E97', // energy / streak / live
  cyan: '#2BE7FF', // info / cardio

  // Semantic
  success: '#4ADE80',
  danger: '#FF4D5E',
  warning: '#FFB020',
  gold: '#FFC53D',
} as const;

/** Level ramp — used by avatar, stats, exercise level badges. */
export type LevelKey = 'iniciante' | 'namedia' | 'acima' | 'fera' | 'mutante';

export interface LevelDef {
  key: LevelKey;
  name: string;
  short: string;
  color: string;
  glow: string;
  /** lower bound as ratio of user lift vs reference average */
  min: number;
}

export const LEVELS: LevelDef[] = [
  { key: 'iniciante', name: 'INICIANTE', short: 'INI', color: '#8A8AA3', glow: '#8A8AA3', min: 0 },
  { key: 'namedia', name: 'NA MÉDIA', short: 'MED', color: '#4ADE80', glow: '#4ADE80', min: 0.8 },
  { key: 'acima', name: 'ACIMA DA MÉDIA', short: 'ACM', color: '#38BDF8', glow: '#38BDF8', min: 1.1 },
  { key: 'fera', name: 'FERA', short: 'FERA', color: '#A855F7', glow: '#A855F7', min: 1.25 },
  { key: 'mutante', name: 'MUTANTE', short: 'MUT', color: '#FFC53D', glow: '#FF8A3D', min: 1.5 },
];

/** Resolve a level definition from a ratio (userLift / referenceAvg). */
export function levelFromRatio(ratio: number): LevelDef {
  let result = LEVELS[0];
  for (const lvl of LEVELS) if (ratio >= lvl.min) result = lvl;
  return result;
}

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

/** z-index scale — semantic, never arbitrary. */
export const z = {
  base: 0,
  card: 1,
  sticky: 10,
  tabbar: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
} as const;

export const font = {
  display: 'BebasNeue_400Regular',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  black: 'Inter_800ExtraBold',
  mono: 'SpaceMono_400Regular',
  monoBold: 'SpaceMono_700Bold',
} as const;

export const MAX_CONTENT_WIDTH = 560;
