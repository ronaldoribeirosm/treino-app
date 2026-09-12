import { MotiView } from 'moti';
import { Mic, Plus, X } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { foodPresets, useStore } from '@/store/useStore';
import { Badge } from '@/ui/Badge';
import { Button } from '@/ui/Button';
import { PressableScale } from '@/ui/PressableScale';
import { Text } from '@/ui/Text';
import { palette, radius, space } from '@/theme/tokens';

const MEALS = ['Café', 'Almoço', 'Lanche', 'Jantar'];

export function AddMealSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const addMeal = useStore((s) => s.addMeal);
  const showToast = useStore((s) => s.showToast);

  const [meal, setMeal] = useState('Café');
  const [nome, setNome] = useState('');
  const [kcal, setKcal] = useState('');

  const commit = (alimento: string, k: number, macro?: { prot: number; carb: number; gord: number }) => {
    addMeal({
      refeicao: meal,
      alimento,
      kcal: k,
      prot: macro?.prot ?? 0,
      carb: macro?.carb ?? 0,
      gord: macro?.gord ?? 0,
      origem: 'manual',
    });
    showToast(`+${k} kcal · ${alimento}`, 'good');
    setNome('');
    setKcal('');
    onClose();
  };

  const manualValid = nome.trim().length > 0 && Number(kcal) > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.anchor} pointerEvents="box-none">
        <MotiView
          from={{ translateY: 480 }}
          animate={{ translateY: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 220 }}
          style={[styles.sheet, { paddingBottom: insets.bottom + space.lg }]}>
          <View style={styles.grabber} />
          <View style={styles.header}>
            <Text variant="title">Registrar refeição</Text>
            <PressableScale style={styles.closeBtn} onPress={onClose} haptic={false}>
              <X size={18} color={palette.inkMuted} strokeWidth={2.4} />
            </PressableScale>
          </View>

          {/* meal type */}
          <View style={styles.chipRow}>
            {MEALS.map((m) => {
              const active = m === meal;
              return (
                <PressableScale
                  key={m}
                  onPress={() => setMeal(m)}
                  style={[styles.chip, active && styles.chipActive]}
                  haptic={false}>
                  <Text variant="label" color={active ? palette.bg : palette.inkMuted}>
                    {m}
                  </Text>
                </PressableScale>
              );
            })}
          </View>

          {/* quick presets */}
          <Text variant="caption" color={palette.inkFaint} style={styles.sectionLabel}>
            ATALHOS
          </Text>
          <View style={styles.presetWrap}>
            {foodPresets.map((f) => (
              <PressableScale
                key={f.alimento}
                onPress={() => commit(f.alimento, f.kcal, f)}
                style={styles.preset}>
                <Text variant="label">{f.alimento}</Text>
                <Text variant="mono" color={palette.lime} style={{ fontSize: 11 }}>
                  {f.kcal}
                </Text>
              </PressableScale>
            ))}
          </View>

          {/* manual */}
          <Text variant="caption" color={palette.inkFaint} style={styles.sectionLabel}>
            MANUAL
          </Text>
          <View style={styles.manualRow}>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Alimento"
              placeholderTextColor={palette.inkFaint}
              style={[styles.input, { flex: 1 }]}
            />
            <TextInput
              value={kcal}
              onChangeText={setKcal}
              placeholder="kcal"
              placeholderTextColor={palette.inkFaint}
              keyboardType="number-pad"
              style={[styles.input, { width: 90 }]}
            />
          </View>
          <Button
            label="Adicionar"
            icon={Plus}
            disabled={!manualValid}
            onPress={() => commit(nome.trim(), Number(kcal))}
            style={{ marginTop: space.md }}
          />

          {/* future: voice */}
          <View style={styles.voiceHint}>
            <Mic size={14} color={palette.magenta} strokeWidth={2.2} />
            <Text variant="caption" color={palette.inkMuted}>
              Em breve: fale o que comeu e a IA calcula
            </Text>
            <Badge label="SOON" color={palette.magenta} />
          </View>
        </MotiView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  anchor: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: palette.bgElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: palette.borderStrong,
    padding: space.lg,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.borderStrong,
    alignSelf: 'center',
    marginBottom: space.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  chip: {
    flex: 1,
    paddingVertical: space.sm,
    borderRadius: radius.sm,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
  },
  chipActive: { backgroundColor: palette.lime, borderColor: palette.lime },
  sectionLabel: { marginTop: space.lg, marginBottom: space.sm, letterSpacing: 1 },
  presetWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  preset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.pill,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
  },
  manualRow: { flexDirection: 'row', gap: space.sm },
  input: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    color: palette.ink,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  voiceHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.lg,
    justifyContent: 'center',
  },
});
