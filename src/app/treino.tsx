import { LinearGradient } from 'expo-linear-gradient';
import { Check, Crown, Flame, Plus, Radio, TrendingUp, Zap } from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';

import { Reveal, SectionHeader } from '@/components/common';
import { lastLivePodium, todayWorkout } from '@/data/mock';
import { Badge } from '@/ui/Badge';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { PressableScale } from '@/ui/PressableScale';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';
import { palette, radius, space } from '@/theme/tokens';

const medals = ['#FFC53D', '#C0C6D4', '#CD7F44'];

export default function TreinoScreen() {
  const sorted = [...lastLivePodium].sort((a, b) => b.volume - a.volume);

  return (
    <Screen>
      <Reveal index={0}>
        <Text variant="caption" color={palette.inkMuted}>
          Bora treinar
        </Text>
        <Text variant="display">TREINO</Text>
      </Reveal>

      {/* Live session CTA */}
      <Reveal index={1}>
        <Card style={{ marginTop: space.lg }} padded={false}>
          <LinearGradient
            colors={[palette.magenta + '2A', palette.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={{ padding: space.lg }}>
            <View style={styles.liveTop}>
              <View style={styles.liveTag}>
                <Radio size={13} color={palette.magenta} strokeWidth={2.6} />
                <Text variant="mono" color={palette.magenta} style={{ fontSize: 10, letterSpacing: 1 }}>
                  AO VIVO
                </Text>
              </View>
              <View style={styles.onlineAvatars}>
                {['L', 'B', 'D'].map((n, i) => (
                  <View key={i} style={[styles.miniAvatar, { marginLeft: i === 0 ? 0 : -10 }]}>
                    <Text variant="label" color={palette.ink}>
                      {n}
                    </Text>
                  </View>
                ))}
                <Text variant="caption" color={palette.inkMuted} style={{ marginLeft: space.sm }}>
                  2 online
                </Text>
              </View>
            </View>
            <Text variant="title" style={{ marginTop: space.md }}>
              Treinar junto com o squad
            </Text>
            <Text variant="body" color={palette.inkMuted} style={{ marginTop: 2, marginBottom: space.lg }}>
              Mesma sessão sincronizada, música compartilhada e pódio no fim.
            </Text>
            <Button label="Iniciar sessão ao vivo" icon={Zap} />
          </View>
        </Card>
      </Reveal>

      {/* Today's workout */}
      <SectionHeader title="TREINO DE HOJE" actionLabel="Editar" />
      <Reveal index={2}>
        <Card padded={false}>
          <View style={styles.woHead}>
            <View style={{ flex: 1 }}>
              <Text variant="subtitle">{todayWorkout.nome}</Text>
              <Text variant="caption" color={palette.inkMuted} style={{ marginTop: 2 }}>
                {todayWorkout.exercicios.length} exercícios
              </Text>
            </View>
            <Badge label="PUSH A" color={palette.cyan} />
          </View>
          {todayWorkout.exercicios.map((ex, i) => (
            <PressableScale key={i} haptic={false}>
              <View style={[styles.exRow, styles.exBorder]}>
                <View
                  style={[
                    styles.checkbox,
                    ex.done && { backgroundColor: palette.lime, borderColor: palette.lime },
                  ]}>
                  {ex.done && <Check size={14} color={palette.bg} strokeWidth={3} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMd" color={ex.done ? palette.inkMuted : palette.ink}>
                    {ex.nome}
                  </Text>
                  <Text variant="caption" color={palette.inkFaint}>
                    {ex.series} · alvo {ex.alvo}
                  </Text>
                </View>
                {ex.done ? (
                  <View style={styles.pctChip}>
                    <TrendingUp size={12} color={palette.success} strokeWidth={2.6} />
                    <Text variant="mono" color={palette.success} style={{ fontSize: 11 }}>
                      +3%
                    </Text>
                  </View>
                ) : (
                  <Text variant="mono" color={palette.inkFaint} style={{ fontSize: 11 }}>
                    —
                  </Text>
                )}
              </View>
            </PressableScale>
          ))}
          <View style={{ padding: space.lg }}>
            <Button label="Adicionar exercício" icon={Plus} variant="secondary" />
          </View>
        </Card>
      </Reveal>

      {/* Last group podium */}
      <SectionHeader title="ÚLTIMO TREINO EM GRUPO" />
      <Reveal index={3}>
        <Card>
          <View style={styles.podiumHead}>
            <Crown size={16} color={palette.gold} strokeWidth={2.4} />
            <Text variant="label" color={palette.gold}>
              PÓDIO · POR VOLUME
            </Text>
          </View>
          {sorted.map((p, i) => (
            <View key={p.nome} style={[styles.podRow, i > 0 && styles.exBorder]}>
              <Text variant="display" color={medals[i]} style={styles.rank}>
                {i + 1}
              </Text>
              <View style={[styles.podAvatar, { borderColor: p.color }]}>
                <Text variant="subtitle" color={p.color}>
                  {p.nome[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="subtitle">{p.nome}</Text>
                <Text variant="caption" color={palette.inkMuted}>
                  {p.volume.toLocaleString('pt-BR')} kg de volume · top {p.topSet}kg
                </Text>
              </View>
              <View style={styles.pctChip}>
                <TrendingUp size={12} color={palette.success} strokeWidth={2.6} />
                <Text variant="mono" color={palette.success} style={{ fontSize: 11 }}>
                  +{p.progresso.toFixed(0)}%
                </Text>
              </View>
            </View>
          ))}
          <View style={styles.podFoot}>
            <Flame size={14} color={palette.magenta} strokeWidth={2.4} />
            <Text variant="caption" color={palette.inkMuted}>
              Bia teve o maior progresso linear da sessão (+8%).
            </Text>
          </View>
        </Card>
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  liveTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: palette.magenta + '22',
    borderColor: palette.magenta + '55',
    borderWidth: 1,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  onlineAvatars: { flexDirection: 'row', alignItems: 'center' },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.surfaceHi,
    borderWidth: 2,
    borderColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  woHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space.lg,
    gap: space.sm,
  },
  exRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md },
  exBorder: { borderTopWidth: 1, borderTopColor: palette.border },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: palette.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pctChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.success + '18',
    paddingHorizontal: space.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  podiumHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: space.md },
  podRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  rank: { width: 22, textAlign: 'center' },
  podAvatar: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    borderWidth: 2,
    backgroundColor: palette.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: space.md,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
});
