import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUpRight, Target, TrendingUp } from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';

import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { Reveal, SectionHeader } from '@/components/common';
import { bodyweightHistory, exercises, exerciseLevel, kcalWeek, user } from '@/data/mock';
import { pctChange, projectGoal } from '@/lib/stats';
import { Badge } from '@/ui/Badge';
import { Card } from '@/ui/Card';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';
import { palette, radius, space } from '@/theme/tokens';

export default function ProgressoScreen() {
  const weights = bodyweightHistory.map((b) => b.kg);
  const avgKcal = Math.round(kcalWeek.reduce((a, d) => a + d.kcal, 0) / kcalWeek.length);
  const balance = avgKcal - 2600;
  const proj = projectGoal(balance, user.pesoAtual, user.pesoMeta);

  return (
    <Screen>
      <Reveal index={0}>
        <Text variant="caption" color={palette.inkMuted}>
          Sua evolução
        </Text>
        <Text variant="display">ESTATÍSTICAS</Text>
      </Reveal>

      {/* Goal projection */}
      <Reveal index={1}>
        <Card style={{ marginTop: space.lg }} padded={false}>
          <LinearGradient colors={[palette.cyan + '14', 'transparent']} style={StyleSheet.absoluteFill} />
          <View style={{ padding: space.lg }}>
            <View style={styles.rowBetween}>
              <View style={styles.iconLabel}>
                <Target size={16} color={palette.cyan} strokeWidth={2.4} />
                <Text variant="label" color={palette.cyan}>
                  PREVISÃO DE OBJETIVO
                </Text>
              </View>
              <Badge label="BULKING" color={palette.cyan} />
            </View>
            <View style={styles.projRow}>
              <View>
                <Text variant="hero" style={{ fontSize: 40, lineHeight: 40 }}>
                  {user.pesoAtual.toFixed(1)}
                </Text>
                <Text variant="caption" color={palette.inkFaint}>
                  peso atual (kg)
                </Text>
              </View>
              <ArrowUpRight size={26} color={palette.inkFaint} />
              <View>
                <Text variant="hero" color={palette.cyan} style={{ fontSize: 40, lineHeight: 40 }}>
                  {user.pesoMeta.toFixed(0)}
                </Text>
                <Text variant="caption" color={palette.inkFaint}>
                  meta (kg)
                </Text>
              </View>
              <View style={styles.projBadge}>
                <Text variant="stat" color={palette.lime}>
                  ~{proj.weeks}
                </Text>
                <Text variant="caption" color={palette.inkMuted}>
                  semanas
                </Text>
              </View>
            </View>
            <Text variant="body" color={palette.inkMuted} style={{ marginTop: space.sm }}>
              No ritmo atual (+{proj.perWeekKg.toFixed(2)} kg/semana) você bate a meta em ~
              {proj.weeks} semanas.
            </Text>
          </View>
        </Card>
      </Reveal>

      {/* Bodyweight */}
      <SectionHeader title="PESO CORPORAL" />
      <Reveal index={2}>
        <Card>
          <View style={styles.rowBetween}>
            <View style={styles.valueRow}>
              <Text variant="hero" style={{ fontSize: 40, lineHeight: 40 }}>
                {user.pesoAtual.toFixed(1)}
              </Text>
              <Text variant="displaySm" color={palette.inkMuted} style={{ marginBottom: 5 }}>
                KG
              </Text>
            </View>
            <TrendBadge value={pctChange(weights[weights.length - 1], weights[0])} />
          </View>
          <LineChart data={weights} color={palette.cyan} height={130} />
        </Card>
      </Reveal>

      {/* Weekly kcal */}
      <SectionHeader title="CALORIAS · SEMANA" />
      <Reveal index={3}>
        <Card>
          <View style={styles.rowBetween}>
            <View style={styles.valueRow}>
              <Text variant="stat" style={{ fontSize: 28 }}>
                {avgKcal.toLocaleString('pt-BR')}
              </Text>
              <Text variant="caption" color={palette.inkMuted} style={{ marginBottom: 3 }}>
                média/dia
              </Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: palette.lime }]} />
              <Text variant="caption" color={palette.inkMuted}>
                acima da meta ({user.metaKcal.toLocaleString('pt-BR')})
              </Text>
            </View>
          </View>
          <View style={{ marginTop: space.md }}>
            <BarChart
              data={kcalWeek.map((k) => ({ label: k.dia, value: k.kcal }))}
              target={user.metaKcal}
              height={110}
            />
          </View>
        </Card>
      </Reveal>

      {/* Per-exercise */}
      <SectionHeader title="POR EXERCÍCIO" />
      {exercises.map((ex, i) => {
        const series = ex.history.map((h) => h.topSet);
        const lvl = exerciseLevel(ex);
        const change = pctChange(series[series.length - 1], series[0]);
        return (
          <Reveal index={4 + i} key={ex.id}>
            <Card style={{ marginBottom: space.md }}>
              <View style={styles.exHead}>
                <View style={{ flex: 1 }}>
                  <Text variant="subtitle">{ex.nome}</Text>
                  <Text variant="caption" color={palette.inkMuted}>
                    {ex.grupo} · média da galera {ex.referenceAvg}kg
                  </Text>
                </View>
                <Badge label={lvl.name} color={lvl.color} />
              </View>
              <View style={styles.exStatRow}>
                <View style={styles.valueRow}>
                  <Text variant="stat">{series[series.length - 1]}</Text>
                  <Text variant="caption" color={palette.inkMuted} style={{ marginBottom: 3 }}>
                    kg
                  </Text>
                </View>
                <TrendBadge value={change} />
              </View>
              <LineChart data={series} color={lvl.color} height={96} />
            </Card>
          </Reveal>
        );
      })}
    </Screen>
  );
}

function TrendBadge({ value }: { value: number }) {
  const up = value >= 0;
  const color = up ? palette.success : palette.danger;
  return (
    <View style={[styles.trendBadge, { backgroundColor: color + '1A' }]}>
      <TrendingUp size={13} color={color} strokeWidth={2.6} />
      <Text variant="label" color={color}>
        {up ? '+' : ''}
        {value.toFixed(0)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 5 },
  projRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.md },
  projBadge: {
    marginLeft: 'auto',
    alignItems: 'center',
    backgroundColor: palette.surfaceHi,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  exHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space.sm },
  exStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.sm,
    marginBottom: space.xs,
  },
});
