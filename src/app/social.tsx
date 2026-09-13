import { Apple, Dumbbell, Inbox, Search, Send, UserCheck, UserPlus, Utensils } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Reveal, SectionHeader } from '@/components/common';
import { useStore, type CloudFriend, type CloudShare, type ShareTipo } from '@/store/useStore';
import { Badge } from '@/ui/Badge';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { PressableScale } from '@/ui/PressableScale';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';
import { friendColor } from '@/store/useStore';
import { palette, radius, space } from '@/theme/tokens';

const typeMeta: Record<ShareTipo, { icon: typeof Dumbbell; color: string; label: string }> = {
  treino: { icon: Dumbbell, color: palette.lime, label: 'TREINO' },
  dieta: { icon: Utensils, color: palette.cyan, label: 'DIETA' },
  receita: { icon: Apple, color: palette.gold, label: 'RECEITA' },
};

export default function SocialScreen() {
  const friends = useStore((s) => s.cloudFriends);
  const pending = useStore((s) => s.pending);
  const inbox = useStore((s) => s.cloudInbox);
  const acceptFriend = useStore((s) => s.acceptFriend);
  const importShare = useStore((s) => s.importShare);
  const clearInbox = useStore((s) => s.clearInbox);
  const showToast = useStore((s) => s.showToast);

  const [addOpen, setAddOpen] = useState(false);
  const [sendTo, setSendTo] = useState<CloudFriend | null>(null);

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
          <PressableScale style={styles.addBtn} onPress={() => setAddOpen(true)}>
            <UserPlus size={20} color={palette.bg} strokeWidth={2.6} />
          </PressableScale>
        </View>
      </Reveal>

      {/* Pending requests */}
      {pending.length > 0 && (
        <>
          <SectionHeader title={`PEDIDOS · ${pending.length}`} />
          <Reveal index={1}>
            <Card padded={false}>
              {pending.map((p, i) => (
                <View key={p.friendshipId} style={[styles.reqRow, i > 0 && styles.border]}>
                  <View style={[styles.avatar, { borderColor: friendColor(p.id) }]}>
                    <Text variant="displaySm" color={friendColor(p.id)}>
                      {p.nome[0]}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="subtitle">{p.nome}</Text>
                    <Text variant="caption" color={palette.inkMuted}>
                      @{p.handle} quer te seguir
                    </Text>
                  </View>
                  <Button
                    label="Aceitar"
                    size="sm"
                    icon={UserCheck}
                    fullWidth={false}
                    onPress={() => acceptFriend(p.friendshipId)}
                  />
                </View>
              ))}
            </Card>
          </Reveal>
        </>
      )}

      {/* Inbox */}
      <SectionHeader title="RECEBIDOS" actionLabel={inbox.length ? 'Limpar' : undefined} onAction={clearInbox} />
      <Reveal index={2}>
        {inbox.length === 0 ? (
          <Card>
            <View style={styles.empty}>
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
                          de {item.fromNome}
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
                    <Button label="Importar" size="sm" fullWidth={false} style={{ flex: 1 }} onPress={() => importShare(item)} />
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
      <Reveal index={3}>
        {friends.length === 0 ? (
          <Card>
            <View style={styles.empty}>
              <UserPlus size={24} color={palette.inkFaint} strokeWidth={2} />
              <Text variant="bodyMd" color={palette.inkMuted}>
                Sem amigos ainda
              </Text>
              <Text variant="caption" color={palette.inkFaint} center>
                Toque no + e adicione pelo @ deles.
              </Text>
            </View>
          </Card>
        ) : (
          <Card padded={false}>
            {friends.map((f, i) => (
              <View key={f.friendshipId} style={[styles.friendRow, i > 0 && styles.border]}>
                <View style={[styles.avatar, { borderColor: friendColor(f.id) }]}>
                  <Text variant="displaySm" color={friendColor(f.id)}>
                    {f.nome[0]}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="subtitle">{f.nome}</Text>
                  <Text variant="caption" color={palette.inkMuted}>
                    @{f.handle} · {f.streak} dias de ofensiva
                  </Text>
                </View>
                <PressableScale style={styles.sendBtn} onPress={() => setSendTo(f)}>
                  <Send size={16} color={palette.lime} strokeWidth={2.4} />
                </PressableScale>
              </View>
            ))}
          </Card>
        )}
      </Reveal>

      <AddFriendSheet visible={addOpen} onClose={() => setAddOpen(false)} />
      <SendShareSheet friend={sendTo} onClose={() => setSendTo(null)} />
    </Screen>
  );
}

function AddFriendSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const sendFriendRequest = useStore((s) => s.sendFriendRequest);
  const myHandle = useStore((s) => s.profile.handle);
  const [handle, setHandle] = useState('');

  const submit = async () => {
    if (handle.trim().length < 3) return;
    await sendFriendRequest(handle);
    setHandle('');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Adicionar amigo">
      <Text variant="caption" color={palette.inkMuted} style={{ marginBottom: space.md }}>
        Seu @ é <Text variant="label" color={palette.lime}>{myHandle}</Text> — compartilhe com a galera.
      </Text>
      <View style={styles.field}>
        <Search size={18} color={palette.inkFaint} strokeWidth={2.2} />
        <TextInput
          value={handle}
          onChangeText={setHandle}
          placeholder="@handle do amigo"
          placeholderTextColor={palette.inkFaint}
          autoCapitalize="none"
          style={styles.input}
        />
      </View>
      <Button label="Enviar pedido" icon={UserPlus} onPress={submit} style={{ marginTop: space.md }} />
    </BottomSheet>
  );
}

function SendShareSheet({ friend, onClose }: { friend: CloudFriend | null; onClose: () => void }) {
  const sendShare = useStore((s) => s.sendShare);
  const workout = useStore((s) => s.workout);
  const diet = useStore((s) => s.diet);

  const send = async (tipo: ShareTipo) => {
    if (!friend) return;
    if (tipo === 'treino') {
      await sendShare(friend.id, 'treino', workout.nome, `${workout.exercicios.length} exercícios`, workout.exercicios);
    } else {
      const total = diet.reduce((a, d) => a + d.kcal, 0);
      const payload = diet.map(({ id: _id, ...rest }) => rest);
      await sendShare(friend.id, 'dieta', 'Dieta de hoje', `${total} kcal · ${diet.length} itens`, payload);
    }
    onClose();
  };

  return (
    <BottomSheet visible={!!friend} onClose={onClose} title={`Mandar pro ${friend?.nome ?? ''}`}>
      <View style={{ gap: space.md }}>
        <PressableScale style={styles.sendOption} onPress={() => send('treino')}>
          <View style={[styles.typeIcon, { backgroundColor: palette.lime + '1F', borderColor: palette.lime + '55' }]}>
            <Dumbbell size={22} color={palette.lime} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="subtitle">Treino de hoje</Text>
            <Text variant="caption" color={palette.inkMuted}>
              {workout.nome}
            </Text>
          </View>
          <Send size={16} color={palette.inkFaint} strokeWidth={2.2} />
        </PressableScale>
        <PressableScale style={styles.sendOption} onPress={() => send('dieta')}>
          <View style={[styles.typeIcon, { backgroundColor: palette.cyan + '1F', borderColor: palette.cyan + '55' }]}>
            <Utensils size={22} color={palette.cyan} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="subtitle">Dieta de hoje</Text>
            <Text variant="caption" color={palette.inkMuted}>
              {diet.reduce((a, d) => a + d.kcal, 0)} kcal · {diet.length} itens
            </Text>
          </View>
          <Send size={16} color={palette.inkFaint} strokeWidth={2.2} />
        </PressableScale>
      </View>
    </BottomSheet>
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
  reqRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md },
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
  inboxActions: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg, paddingBottom: space.lg },
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
  empty: { alignItems: 'center', gap: 6, paddingVertical: space.lg },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    height: 54,
  },
  input: { flex: 1, color: palette.ink, fontFamily: 'Inter_500Medium', fontSize: 15, height: '100%' },
  sendOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
    padding: space.md,
  },
});
