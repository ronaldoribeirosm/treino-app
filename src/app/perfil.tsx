import {
  Bell,
  ChevronRight,
  LogOut,
  Music,
  Pencil,
  Ruler,
  Sparkles,
  Target,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';

import { PowerCore } from '@/components/PowerCore';
import { Reveal, SectionHeader } from '@/components/common';
import { exercises, exerciseLevel, overallLevel } from '@/data/mock';
import { useStore } from '@/store/useStore';
import { Badge } from '@/ui/Badge';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { PressableScale } from '@/ui/PressableScale';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';
import { palette, radius, space } from '@/theme/tokens';

const goalLabel: Record<string, string> = {
  bulking: 'Ganhar massa (bulking)',
  cutting: 'Perder gordura (cutting)',
  manter: 'Manter o peso',
};

export default function PerfilScreen() {
  const level = overallLevel();
  const profile = useStore((s) => s.profile);
  const setHandle = useStore((s) => s.setHandle);
  const showToast = useStore((s) => s.showToast);
  const soon = (o: string) => showToast(`${o} vem em breve`, 'info');
  const [handleOpen, setHandleOpen] = useState(false);
  const [handleInput, setHandleInput] = useState('');

  const saveHandle = async () => {
    const ok = await setHandle(handleInput);
    if (ok) {
      setHandleInput('');
      setHandleOpen(false);
    }
  };

  return (
    <Screen>
      <Reveal index={0}>
        <View style={styles.profileHead}>
          <PowerCore color={level.color} size={104}>
            <Text variant="hero" color={level.color} style={{ fontSize: 40, lineHeight: 40 }}>
              {profile.nome[0]}
            </Text>
          </PowerCore>
          <Text variant="display" style={{ marginTop: space.md }}>
            {profile.nome.toUpperCase()}
          </Text>
          <PressableScale
            onPress={() => {
              setHandleInput(profile.handle.replace(/^@/, ''));
              setHandleOpen(true);
            }}
            haptic={false}
            style={styles.handleBtn}>
            <Text variant="caption" color={palette.inkMuted}>
              {profile.handle}
            </Text>
            <Pencil size={12} color={palette.inkFaint} strokeWidth={2.2} />
          </PressableScale>
          <View style={{ marginTop: space.sm }}>
            <Badge label={`NÍVEL ${level.name}`} color={level.color} />
          </View>
        </View>
      </Reveal>

      {/* Quick facts */}
      <Reveal index={1}>
        <Card style={{ marginTop: space.xl }}>
          <View style={styles.factsRow}>
            <Fact value={`${profile.peso_atual.toFixed(1)}`} unit="kg" label="Peso" />
            <View style={styles.factDivider} />
            <Fact value={`${profile.altura}`} unit="cm" label="Altura" />
            <View style={styles.factDivider} />
            <Fact value={`${profile.streak}`} unit="d" label="Ofensiva" />
          </View>
        </Card>
      </Reveal>

      {/* Goal */}
      <SectionHeader title="OBJETIVO" actionLabel="Mudar" onAction={() => soon('Trocar objetivo')} />
      <Reveal index={2}>
        <Card>
          <View style={styles.goalRow}>
            <View style={[styles.goalIcon, { backgroundColor: palette.cyan + '1F' }]}>
              <Target size={22} color={palette.cyan} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="subtitle">{goalLabel[profile.goal] ?? profile.goal}</Text>
              <Text variant="caption" color={palette.inkMuted}>
                Meta: {profile.peso_meta}kg · {profile.meta_kcal.toLocaleString('pt-BR')} kcal/dia
              </Text>
            </View>
          </View>
        </Card>
      </Reveal>

      {/* Level breakdown */}
      <SectionHeader title="NÍVEIS POR EXERCÍCIO" />
      <Reveal index={3}>
        <Card padded={false}>
          {exercises.map((ex, i) => {
            const lvl = exerciseLevel(ex);
            const latest = ex.history[ex.history.length - 1].topSet;
            const ratio = latest / ex.referenceAvg;
            return (
              <View key={ex.id} style={[styles.lvlRow, i > 0 && styles.border]}>
                <View style={[styles.lvlDot, { backgroundColor: lvl.color }]} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMd">{ex.nome}</Text>
                  <Text variant="caption" color={palette.inkFaint}>
                    {latest}kg · {(ratio * 100).toFixed(0)}% da média
                  </Text>
                </View>
                <Badge label={lvl.name} color={lvl.color} />
              </View>
            );
          })}
        </Card>
      </Reveal>

      {/* Settings */}
      <SectionHeader title="AJUSTES" />
      <Reveal index={4}>
        <Card padded={false}>
          <SettingRow icon={Music} color={palette.magenta} label="Conectar música" hint="YouTube" onPress={() => soon('Player de música')} />
          <SettingRow icon={Sparkles} color={palette.lime} label="IA de dieta" hint="Ativa" border onPress={() => soon('IA de dieta')} />
          <SettingRow icon={Bell} color={palette.cyan} label="Notificações" hint="On" border onPress={() => soon('Notificações')} />
          <SettingRow icon={Ruler} color={palette.gold} label="Unidades" hint="kg · cm" border onPress={() => soon('Ajuste de unidades')} />
        </Card>
      </Reveal>

      <Reveal index={5}>
        <PressableScale style={styles.logout} haptic={false} onPress={() => soon('Login/logout')}>
          <LogOut size={18} color={palette.danger} strokeWidth={2.2} />
          <Text variant="subtitle" color={palette.danger}>
            Sair
          </Text>
        </PressableScale>
      </Reveal>

      <Text variant="mono" color={palette.inkFaint} center style={{ marginTop: space.lg }}>
        v0.1 · feito no suor
      </Text>

      <BottomSheet visible={handleOpen} onClose={() => setHandleOpen(false)} title="Seu @handle">
        <Text variant="caption" color={palette.inkMuted} style={{ marginBottom: space.md }}>
          É como os amigos te acham no squad. Só letras, números e _.
        </Text>
        <View style={styles.handleField}>
          <Text variant="subtitle" color={palette.inkMuted}>
            @
          </Text>
          <TextInput
            value={handleInput}
            onChangeText={(t) => setHandleInput(t.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
            placeholder="seunome"
            placeholderTextColor={palette.inkFaint}
            autoCapitalize="none"
            style={styles.handleInput}
          />
        </View>
        <Button label="Salvar @" onPress={saveHandle} style={{ marginTop: space.md }} />
      </BottomSheet>
    </Screen>
  );
}

function Fact({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <View style={styles.fact}>
      <View style={styles.factValueRow}>
        <Text variant="stat">{value}</Text>
        <Text variant="caption" color={palette.inkMuted} style={{ marginBottom: 3 }}>
          {unit}
        </Text>
      </View>
      <Text variant="caption" color={palette.inkFaint}>
        {label}
      </Text>
    </View>
  );
}

function SettingRow({
  icon: Icon,
  color,
  label,
  hint,
  border,
  onPress,
}: {
  icon: LucideIcon;
  color: string;
  label: string;
  hint?: string;
  border?: boolean;
  onPress?: () => void;
}) {
  return (
    <PressableScale haptic={false} onPress={onPress}>
      <View style={[styles.settingRow, border && styles.border]}>
        <View style={[styles.settingIcon, { backgroundColor: color + '1A' }]}>
          <Icon size={18} color={color} strokeWidth={2.2} />
        </View>
        <Text variant="bodyMd" style={{ flex: 1 }}>
          {label}
        </Text>
        {hint ? (
          <Text variant="caption" color={palette.inkMuted}>
            {hint}
          </Text>
        ) : null}
        <ChevronRight size={18} color={palette.inkFaint} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  profileHead: { alignItems: 'center', marginTop: space.md },
  handleBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 2 },
  handleField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    height: 54,
  },
  handleInput: { flex: 1, color: palette.ink, fontFamily: 'Inter_600SemiBold', fontSize: 16, height: '100%' },
  factsRow: { flexDirection: 'row', alignItems: 'center' },
  fact: { flex: 1, alignItems: 'center', gap: 4 },
  factValueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  factDivider: { width: 1, height: 34, backgroundColor: palette.border },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lvlRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md },
  lvlDot: { width: 10, height: 10, borderRadius: 5 },
  border: { borderTopWidth: 1, borderTopColor: palette.border },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    marginTop: space.xl,
    paddingVertical: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.danger + '44',
    backgroundColor: palette.danger + '12',
  },
});
