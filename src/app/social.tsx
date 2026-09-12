import { Apple, Dumbbell, Inbox, Send, UserPlus, Utensils } from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';

import { Reveal, SectionHeader } from '@/components/common';
import { type SharedItem } from '@/data/mock';
import { useStore } from '@/store/useStore';
import { Badge } from '@/ui/Badge';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { PressableScale } from '@/ui/PressableScale';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';
import { palette, radius, space } from '@/theme/tokens';

const typeMeta: Record<SharedItem['tipo'], { icon: typeof Dumbbell; color: string; label: string }> = {
  treino: { icon: Dumbbell, color: palette.lime, label: 'TREINO' },
  dieta: { icon: Utensils, color: palette.cyan, label: 'DIETA' },
  receita: { icon: Apple, color: palette.gold, label: 'RECEITA' },
};

export default function SocialScreen() {
  const inbox = useStore((s) => s.inbox);
  const friends = useStore((s) => s.friends);
  const importItem = useStore((s) => s.importItem);
  const clearInbox = useStore((s) => s.clearInbox);
  const showToast = useStore((s) => s.showToast);

  const onImport = (item: SharedItem) => {
    importItem(item.id);
    const verbo = item.tipo === 'treino' ? 'Treino' : item.tipo === 'dieta' ? 'Dieta' : 'Receita';
    showToast(`${verbo} "${item.titulo}" importado!`, 'good');
  };
  const onClear = () => {
    if (inbox.length === 0) return;
    clearInbox();
    showToast('Caixa de entrada limpa', 'info');
  };

  return (
    <Screen>
      <Reveal index={0}>
        <View style={styles.headerRow}>
          <View>
            <Text variant="caption" color={palette.inkMuted}>
              Sua gangue
            </Text>
            <Text variant="display">SQUAD</Text>
          </View>
          <PressableScale
            style={styles.addBtn}
            onPress={() => showToast('Adicionar amigos vem com o backend', 'info')}>
            <UserPlus size={20} color={palette.bg} strokeWidth={2.6} />
          </PressableScale>
        </View>
      </Reveal>

      {/* Inbox — shared items */}
      <SectionHeader title="RECEBIDOS" actionLabel={inbox.length ? 'Limpar' : undefined} onAction={onClear} />
      <Reveal index={1}>
        {inbox.length === 0 ? (
          <Card>
            <View style={styles.emptyInbox}>
              <Inbox size={24} color={palette.inkFaint} strokeWidth={2} />
              <Text variant="bodyMd" color={palette.inkMuted}>
                Nada por aqui
              </Text>
              <Text variant="caption" color={palette.inkFaint} center>
                Treinos e dietas que a galera mandar aparecem aqui.
              </Text>
            </View>
          </Card>
        ) : (
          <View style={{ gap: space.md }}>
            {inbox.map((item) => {
            const meta = typeMeta[item.tipo];
            const Icon = meta.icon;
            return (
              <Card key={item.id} padded={false}>
                <View style={styles.inboxRow}>
                  <View style={[styles.typeIcon, { backgroundColor: meta.color + '1F', borderColor: meta.color + '55' }]}>
                    <Icon size={22} color={meta.color} strokeWidth={2.2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.inboxTitleRow}>
                      <Badge label={meta.label} color={meta.color} />
                      <Text variant="caption" color={palette.inkFaint}>
                        de {item.from}
                      </Text>
                    </View>
                    <Text variant="subtitle" style={{ marginTop: 4 }}>
                      {item.titulo}
                    </Text>
                    <Text variant="caption" color={palette.inkMuted}>
                      {item.detalhe}
                    </Text>
                  </View>
                </View>
                <View style={styles.inboxActions}>
                  <Button
                    label="Importar"
                    size="sm"
                    fullWidth={false}
                    style={{ flex: 1 }}
                    onPress={() => onImport(item)}
                  />
                  <Button
                    label="Ver"
                    size="sm"
                    variant="secondary"
                    fullWidth={false}
                    style={{ flex: 1 }}
                    onPress={() => showToast(`${item.titulo} · ${item.detalhe}`, 'info')}
                  />
                </View>
              </Card>
            );
            })}
          </View>
        )}
      </Reveal>

      {/* Friends */}
      <SectionHeader title={`AMIGOS · ${friends.length}`} />
      <Reveal index={2}>
        <Card padded={false}>
          {friends.map((f, i) => (
            <View key={f.id} style={[styles.friendRow, i > 0 && styles.border]}>
              <View style={[styles.avatar, { borderColor: f.levelColor }]}>
                <Text variant="displaySm" color={f.levelColor}>
                  {f.nome[0]}
                </Text>
                {f.online && <View style={styles.onlineDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text variant="subtitle">{f.nome}</Text>
                  <Badge label={f.levelName} color={f.levelColor} />
                </View>
                <Text variant="caption" color={palette.inkMuted}>
                  {f.handle} · {f.streak} dias de ofensiva
                </Text>
              </View>
              <PressableScale
                style={styles.sendBtn}
                onPress={() => showToast(`Mandar treino/dieta pro ${f.nome} 🔜`, 'info')}>
                <Send size={16} color={palette.lime} strokeWidth={2.4} />
              </PressableScale>
            </View>
          ))}
        </Card>
      </Reveal>

      <Reveal index={3}>
        <View style={styles.emptyHint}>
          <Inbox size={16} color={palette.inkFaint} strokeWidth={2} />
          <Text variant="caption" color={palette.inkFaint}>
            Toque no avião pra mandar um treino ou dieta pro amigo.
          </Text>
        </View>
      </Reveal>
    </Screen>
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
  inboxRow: { flexDirection: 'row', gap: space.md, padding: space.lg, paddingBottom: space.md },
  typeIcon: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inboxTitleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  inboxActions: {
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
  },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md },
  border: { borderTopWidth: 1, borderTopColor: palette.border },
  avatar: {
    width: 48,
    height: 48,
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
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: 2 },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: palette.lime + '18',
    borderWidth: 1,
    borderColor: palette.lime + '44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    marginTop: space.xl,
    paddingHorizontal: space.lg,
  },
  emptyInbox: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: space.lg,
  },
});
