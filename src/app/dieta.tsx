import { Mic, Mic as MicIcon, Plus, Trash2, Type, Utensils, Hand } from 'lucide-react-native';
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { AddMealSheet } from '@/components/AddMealSheet';
import { BarChart } from '@/components/charts/BarChart';
import { RingProgress } from '@/components/charts/RingProgress';
import { Reveal, SectionHeader } from '@/components/common';
import { kcalWeek } from '@/data/mock';
import { useStore } from '@/store/useStore';
import { Badge } from '@/ui/Badge';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { PressableScale } from '@/ui/PressableScale';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';
import { palette, radius, space } from '@/theme/tokens';

const MEAL_ORDER = ['Café', 'Almoço', 'Lanche', 'Jantar'];
const origemIcon = { audio: MicIcon, texto: Type, manual: Hand };

export default function DietaScreen() {
  const diet = useStore((s) => s.diet);
  const metaKcal = useStore((s) => s.metaKcal);
  const removeMeal = useStore((s) => s.removeMeal);
  const showToast = useStore((s) => s.showToast);
  const [open, setOpen] = useState(false);

  const total = diet.reduce((a, d) => a + d.kcal, 0);
  const restante = Math.max(0, metaKcal - total);
  const macros = {
    prot: diet.reduce((a, d) => a + d.prot, 0),
    carb: diet.reduce((a, d) => a + d.carb, 0),
    gord: diet.reduce((a, d) => a + d.gord, 0),
  };

  const grouped = MEAL_ORDER.map((m) => ({
    refeicao: m,
    itens: diet.filter((d) => d.refeicao === m),
  })).filter((g) => g.itens.length > 0);
  const outras = diet.filter((d) => !MEAL_ORDER.includes(d.refeicao ?? ''));
  if (outras.length) grouped.push({ refeicao: 'Outros', itens: outras });

  const onRemove = (id: string, nome: string) => {
    removeMeal(id);
    showToast(`${nome} removido`, 'info');
  };

  return (
    <Screen>
      <Reveal index={0}>
        <View style={styles.headerRow}>
          <View>
            <Text variant="caption" color={palette.inkMuted}>
              Hoje
            </Text>
            <Text variant="display">DIETA</Text>
          </View>
          <PressableScale style={styles.addBtn} onPress={() => setOpen(true)}>
            <Plus size={22} color={palette.bg} strokeWidth={2.8} />
          </PressableScale>
        </View>
      </Reveal>

      {/* Big ring + remaining */}
      <Reveal index={1}>
        <Card>
          <View style={styles.ringRow}>
            <RingProgress progress={total / metaKcal} size={132} stroke={13}>
              <View style={{ alignItems: 'center' }}>
                <Text variant="hero" style={{ fontSize: 34, lineHeight: 34 }}>
                  {total.toLocaleString('pt-BR')}
                </Text>
                <Text variant="caption" color={palette.inkFaint}>
                  de {metaKcal.toLocaleString('pt-BR')}
                </Text>
              </View>
            </RingProgress>
            <View style={styles.ringSide}>
              <View>
                <Text variant="stat" color={palette.lime}>
                  {restante.toLocaleString('pt-BR')}
                </Text>
                <Text variant="caption" color={palette.inkMuted}>
                  kcal restantes
                </Text>
              </View>
              <View style={styles.macros}>
                <Macro label="Prot" value={macros.prot} target={180} color={palette.magenta} />
                <Macro label="Carb" value={macros.carb} target={330} color={palette.lime} />
                <Macro label="Gord" value={macros.gord} target={80} color={palette.gold} />
              </View>
            </View>
          </View>
        </Card>
      </Reveal>

      {/* Register */}
      <Reveal index={2}>
        <View style={{ marginTop: space.md }}>
          <Button label="Registrar refeição" icon={Utensils} onPress={() => setOpen(true)} />
        </View>
      </Reveal>

      {/* AI voice teaser */}
      <Reveal index={3}>
        <PressableScale
          style={styles.voiceCard}
          onPress={() => showToast('Registro por voz com IA chega em breve 🎤', 'info')}>
          <View style={[styles.voiceIcon, { backgroundColor: palette.magenta + '22' }]}>
            <Mic size={20} color={palette.magenta} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="subtitle">Falar o que comeu</Text>
            <Text variant="caption" color={palette.inkMuted}>
              "Comi 5 pães de queijo" → a IA calcula as kcal
            </Text>
          </View>
          <Badge label="SOON" color={palette.magenta} />
        </PressableScale>
      </Reveal>

      {/* Weekly */}
      <SectionHeader title="SEMANA" />
      <Reveal index={4}>
        <Card>
          <BarChart
            data={kcalWeek.map((k) => ({ label: k.dia, value: k.kcal }))}
            target={metaKcal}
            height={110}
          />
        </Card>
      </Reveal>

      {/* Meals list */}
      <SectionHeader title="REFEIÇÕES DE HOJE" />
      {grouped.length === 0 ? (
        <Reveal index={5}>
          <Card>
            <View style={styles.empty}>
              <Utensils size={24} color={palette.inkFaint} strokeWidth={2} />
              <Text variant="bodyMd" color={palette.inkMuted}>
                Nada registrado ainda
              </Text>
              <Text variant="caption" color={palette.inkFaint}>
                Toque em + pra adicionar sua primeira refeição.
              </Text>
            </View>
          </Card>
        </Reveal>
      ) : (
        grouped.map((g, gi) => {
          const groupKcal = g.itens.reduce((a, d) => a + d.kcal, 0);
          return (
            <Reveal index={5 + gi} key={g.refeicao}>
              <Card padded={false} style={{ marginBottom: space.md }}>
                <View style={styles.mealHead}>
                  <Text variant="displaySm" color={palette.inkMuted}>
                    {g.refeicao.toUpperCase()}
                  </Text>
                  <Text variant="mono" color={palette.lime}>
                    {groupKcal} kcal
                  </Text>
                </View>
                {g.itens.map((d, i) => {
                  const Ori = origemIcon[d.origem];
                  return (
                    <View key={d.id} style={[styles.foodRow, i > 0 && styles.border]}>
                      <Ori size={14} color={palette.inkFaint} strokeWidth={2.2} />
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyMd">{d.alimento}</Text>
                        <Text variant="caption" color={palette.inkFaint}>
                          {d.kcal} kcal · P{d.prot} C{d.carb} G{d.gord}
                        </Text>
                      </View>
                      <PressableScale
                        style={styles.trash}
                        onPress={() => onRemove(d.id, d.alimento)}
                        haptic={false}>
                        <Trash2 size={16} color={palette.inkFaint} strokeWidth={2.2} />
                      </PressableScale>
                    </View>
                  );
                })}
              </Card>
            </Reveal>
          );
        })
      )}

      <AddMealSheet visible={open} onClose={() => setOpen(false)} />
    </Screen>
  );
}

function Macro({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = Math.min(1, value / target);
  return (
    <View style={{ gap: 4 }}>
      <View style={styles.macroLabelRow}>
        <Text variant="caption" color={palette.inkMuted}>
          {label}
        </Text>
        <Text variant="mono" color={palette.inkFaint} style={{ fontSize: 11 }}>
          {value}/{target}
        </Text>
      </View>
      <View style={styles.macroTrack}>
        <View style={[styles.macroFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: palette.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  ringSide: { flex: 1, gap: space.md },
  macros: { gap: space.sm },
  macroLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  macroTrack: { height: 6, backgroundColor: palette.surfaceHi, borderRadius: radius.pill, overflow: 'hidden' },
  macroFill: { height: '100%', borderRadius: radius.pill },
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.magenta + '33',
    borderRadius: radius.lg,
    padding: space.lg,
  },
  voiceIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space.lg,
    paddingBottom: space.md,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  border: { borderTopWidth: 1, borderTopColor: palette.border },
  trash: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceHi,
  },
  empty: { alignItems: 'center', gap: 6, paddingVertical: space.lg },
});
