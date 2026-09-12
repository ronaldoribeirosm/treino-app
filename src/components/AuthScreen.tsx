import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell, Lock, Mail, User } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PowerCore } from '@/components/PowerCore';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { Button } from '@/ui/Button';
import { PressableScale } from '@/ui/PressableScale';
import { Text } from '@/ui/Text';
import { palette, radius, space } from '@/theme/tokens';

type Mode = 'login' | 'signup';

export function AuthScreen() {
  const insets = useSafeAreaInsets();
  const showToast = useStore((s) => s.showToast);

  const [mode, setMode] = useState<Mode>('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || senha.length < 6) {
      showToast('Preencha email e senha (mín. 6 caracteres)', 'warn');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: senha,
          options: { data: { nome: nome.trim() || email.split('@')[0] } },
        });
        if (error) throw error;
        if (!data.session) {
          showToast('Confirme seu email para entrar', 'info');
          setMode('login');
        } else {
          showToast('Conta criada! Bora treinar 💪', 'good');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: senha,
        });
        if (error) throw error;
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Algo deu errado';
      showToast(traduzErro(msg), 'warn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={[palette.lime + '10', 'transparent']} style={styles.glow} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + space.huge, paddingBottom: insets.bottom + space.xl },
          ]}
          keyboardShouldPersistTaps="handled">
          {/* brand */}
          <View style={styles.brand}>
            <PowerCore color={palette.lime} size={104}>
              <Dumbbell size={34} color={palette.lime} strokeWidth={2.2} />
            </PowerCore>
            <Text variant="hero" style={styles.wordmark}>
              FORJA
            </Text>
            <Text variant="caption" color={palette.inkMuted}>
              treino · dieta · squad
            </Text>
          </View>

          {/* form */}
          <View style={styles.form}>
            <Text variant="title" center>
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </Text>

            {mode === 'signup' && (
              <Field icon={User} placeholder="Seu nome" value={nome} onChangeText={setNome} />
            )}
            <Field
              icon={Mail}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              icon={Lock}
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              autoCapitalize="none"
            />

            <Button
              label={mode === 'login' ? 'Entrar' : 'Criar conta'}
              onPress={submit}
              loading={loading}
              style={{ marginTop: space.sm }}
            />

            <PressableScale
              onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
              haptic={false}
              style={styles.toggle}>
              <Text variant="body" color={palette.inkMuted}>
                {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
                <Text variant="bodyMd" color={palette.lime}>
                  {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
                </Text>
              </Text>
            </PressableScale>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  icon: Icon,
  ...props
}: React.ComponentProps<typeof TextInput> & { icon: typeof Mail }) {
  return (
    <View style={styles.field}>
      <Icon size={18} color={palette.inkFaint} strokeWidth={2.2} />
      <TextInput
        {...props}
        placeholderTextColor={palette.inkFaint}
        style={styles.input}
      />
    </View>
  );
}

function traduzErro(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return 'Email ou senha incorretos';
  if (/already registered|already exists/i.test(msg)) return 'Esse email já tem conta';
  if (/rate limit/i.test(msg)) return 'Muitas tentativas, espere um pouco';
  if (/password/i.test(msg)) return 'Senha muito curta (mín. 6)';
  return msg;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 360 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    gap: space.xxxl,
  },
  brand: { alignItems: 'center', gap: space.sm },
  wordmark: { fontSize: 52, lineHeight: 52, letterSpacing: 2, marginTop: space.md },
  form: { gap: space.md },
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
  input: {
    flex: 1,
    color: palette.ink,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    height: '100%',
  },
  toggle: { alignItems: 'center', paddingVertical: space.sm },
});
