import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  ChevronRight,
  Dumbbell,
  Flame,
  Play,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';

import { LineChart } from '@/components/charts/LineChart';
import { RingProgress } from '@/components/charts/RingProgress';
import { PowerCore } from '@/components/PowerCore';
import { Reveal, SectionHeader, StatTile, XPBar } from '@/components/common';
import {
  exercises,
  friends,
  kcalWeek,
  overallLevel,
  todayDiet,
  todayWorkout,
  user,
} from '@/data/mock';
import { computeStatus } from '@/lib/stats';
import { Badge } from '@/ui/Badge';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { PressableScale } from '@/ui/PressableScale';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';
import { palette, radius, space } from '@/theme/tokens';

export default function HomeScreen() {
  const level = overallLevel();
  const supino = exercises[0];
  const supinoSeries = supino.history.map((h) => h.topSet);

  const todayKcal = todayDiet.reduce((a, d) => a + d.kcal, 0);
  const avgKcal = Math.round(kcalWeek.reduce((a, d) => a + d.kcal, 0) / kcalWeek.length);
  const status = computeStatus({
    workoutsThisWeek: 4,
    targetWorkouts: 5,
    avgKcal,
    metaKcal: user.metaKcal,
    goal: user.goal,
  });
  const statusColor =
    status.tone === 'good' ? palette.success : status.tone === 'warn' ? palette.warning : palette.danger;

  const doneCount = todayWorkout.exercicios.filter((e) => e.done).length;

  return (
    <Screen>
      {/* Header */}
      <Reveal index={0}>
        <View style={styles.header}>
          <View>
            <Text variant="caption" color={palette.inkMuted}>
              E aí,
            </Text>
            <Text variant="display">{user.nome.toUpperCase()}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.streakChip}>
              <Flame size={15} color={palette.magenta} strokeWidth={2.6} />
              <Text variant="label" color={palette.magenta}>
                {user.streak}
              </Text>
            </View>
            <PressableScale style={styles.iconBtn} haptic={false}>
              <Bell size={20} color={palette.inkMuted} strokeWidth={2} />
              <View style={styles.notifDot} />
            </PressableScale>
          </View>
        </View>
      </Reveal>

      {/* Hero — Power core */}
      <Reveal index={1}>
        <Card style={styles.hero} padded={false}>
          <LinearGradient
            colors={[level.color + '18', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroInner}>
            <PowerCore color={level.color} size={128}>
              <View style={styles.coreOverlay}>
                <Dumbbell size={38} color={level.color} strokeWidth={2.2} />
              </View>
            </PowerCore>
            <View style={styles.heroInfo}>
              <Badge label={`NÍVEL · ${level.short}`} color={level.color} />
              <Text variant="display" color={level.color} style={{ marginTop: 6 }}>
                {level.name}
              </Text>
              <Text variant="caption" color={palette.inkMuted} style={{ marginTop: 2 }}>
                {user.xp.toLocaleString('pt-BR')} / {user.xpToNext.toLocaleString('pt-BR')} XP
              </Text>
              <View style={{ marginTop: 10 }}>
                <XPBar value={user.xp} max={user.xpToNext} color={level.color} />
              </View>
            </View>
          </View>
        </Card>
      </Reveal>

      {/* Status engine */}
      <Reveal index={2}>
        <Card style={[styles.statusCard, { borderColor: statusColor + '55' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <View style={{ flex: 1 }}>
            <Text variant="subtitle" color={statusColor}>
              {status.headline}
            </Text>
            <Text variant="body" color={palette.inkMuted} style={{ marginTop: 2 }}>
              {status.detail}
            </Text>
          </View>
        </Card>
      </Reveal>

      {/* KPI row */}
      <Reveal index={3}>
        <View style={styles.kpiRow}>
          <StatTile icon={Flame} value={String(user.streak)} unit="dias" label="Ofensiva" color={palette.magenta} />
          <StatTile icon={Zap} value="28,6" unit="k kg" label="Volume 7d" color={palette.lime} />
          <StatTile icon={Trophy} value="3" label="PRs no mês" color={palette.gold} />
        </View>
      </Reveal>

      {/* Today's workout */}
      <SectionHeader title="TREINO DE HOJE" actionLabel="Ver tudo" />
      <Reveal index={4}>
        <Card padded={false}>
          <View style={styles.workoutHead}>
            <View style={{ flex: 1 }}>
              <Text variant="subtitle">{todayWorkout.nome}</Text>
              <Text variant="caption" color={palette.inkMuted} style={{ marginTop: 2 }}>
                {doneCount}/{todayWorkout.exercicios.length} exercícios · {todayWorkout.exercicios.length * 4} séries
              </Text>
            </View>
            <Badge label="PUSH A" color={palette.cyan} />
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(doneCount / todayWorkout.exercicios.length) * 100}%` },
              ]}
            />
          </View>
          <View style={{ padding: space.lg, paddingTop: space.md }}>
            <Button label="Continuar treino" icon={Play} />
          </View>
        </Card>
      </Reveal>

      {/* Nutrition ring */}
      <SectionHeader title="NUTRIÇÃO HOJE" actionLabel="Registrar" />
      <Reveal index={5}>
        <Card>
          <View style={styles.nutriRow}>
            <RingProgress progress={todayKcal / user.metaKcal} size={116} stroke={12}>
              <View style={{ alignItems: 'center' }}>
                <Text variant="stat">{todayKcal.toLocaleString('pt-BR')}</Text>
                <Text variant="caption" color={palette.inkFaint}>
                  / {user.metaKcal.toLocaleString('pt-BR')}
                </Text>
              </View>
            </RingProgress>
            <View style={styles.macros}>
              <Macro label="Proteína" value={86} target={180} color={palette.magenta} />
              <Macro label="Carbo" value={150} target={330} color={palette.lime} />
              <Macro label="Gordura" value={35} target={80} color={palette.gold} />
            </View>
          </View>
        </Card>
      </Reveal>

      {/* Bench progression teaser */}
      <SectionHeader title="EVOLUÇÃO · SUPINO" actionLabel="Stats" />
      <Reveal index={6}>
        <Card>
          <View style={styles.chartHead}>
            <View style={styles.chartValueRow}>
              <Text variant="hero" style={{ fontSize: 44, lineHeight: 42 }}>
                85
              </Text>
              <Text variant="displaySm" color={palette.inkMuted} style={{ marginBottom: 6 }}>
                KG
              </Text>
            </View>
            <View style={styles.trendChip}>
              <TrendingUp size={14} color={palette.success} strokeWidth={2.6} />
              <Text variant="label" color={palette.success}>
                +17% em 8 semanas
              </Text>
            </View>
          </View>
          <LineChart data={supinoSeries} color={palette.lime} height={140} />
        </Card>
      </Reveal>

      {/* Squad teaser */}
      <SectionHeader title="SEU SQUAD" actionLabel="Abrir" />
      <Reveal index={7}>
        <Card padded={false}>
          {friends.slice(0, 3).map((f, i) => (
            <PressableScale key={f.id} haptic={false}>
              <View style={[styles.friendRow, i > 0 && styles.friendBorder]}>
                <View style={[styles.avatar, { borderColor: f.levelColor }]}>
                  <Text variant="displaySm" color={f.levelColor}>
                    {f.nome[0]}
                  </Text>
                  {f.online && <View style={styles.onlineDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.friendNameRow}>
                    <Text variant="subtitle">{f.nome}</Text>
                    <Badge label={f.levelName} color={f.levelColor} />
                  </View>
                  <Text variant="caption" color={palette.inkMuted}>
                    {f.lastAction}
                  </Text>
                </View>
                <ChevronRight size={18} color={palette.inkFaint} />
              </View>
            </PressableScale>
          ))}
        </Card>
      </Reveal>
    </Screen>
  );
}

function Macro({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = Math.min(1, value / target);
  return (
    <View style={{ gap: 5 }}>
      <View style={styles.macroLabelRow}>
        <Text variant="caption" color={palette.inkMuted}>
          {label}
        </Text>
        <Text variant="mono" color={palette.inkFaint}>
          {value}/{target}g
        </Text>
      </View>
      <View style={styles.macroTrack}>
        <View style={[styles.macroFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: space.lg,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.magenta + '1F',
    borderColor: palette.magenta + '55',
    borderWidth: 1,
    paddingHorizontal: space.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.magenta,
  },
  hero: { marginBottom: space.sm },
  heroInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    padding: space.lg,
  },
  coreOverlay: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  heroInfo: { flex: 1 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.md,
  },
  statusDot: { width: 10, height: 10, borderRadius: 6 },
  kpiRow: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  workoutHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space.lg,
    paddingBottom: space.md,
    gap: space.sm,
  },
  progressTrack: {
    height: 6,
    backgroundColor: palette.surfaceHi,
    marginHorizontal: space.lg,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: palette.lime, borderRadius: radius.pill },
  nutriRow: { flexDirection: 'row', alignItems: 'center', gap: space.xl },
  macros: { flex: 1, gap: space.md },
  macroLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  macroTrack: { height: 7, backgroundColor: palette.surfaceHi, borderRadius: radius.pill, overflow: 'hidden' },
  macroFill: { height: '100%', borderRadius: radius.pill },
  chartHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.sm,
  },
  chartValueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  trendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: palette.success + '1A',
    paddingHorizontal: space.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md },
  friendBorder: { borderTopWidth: 1, borderTopColor: palette.border },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 2,
    backgroundColor: palette.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.success,
    borderWidth: 2,
    borderColor: palette.surface,
  },
  friendNameRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: 2 },
});
