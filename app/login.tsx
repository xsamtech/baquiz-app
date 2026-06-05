import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  API_ENDPOINTS,
  AuthShell,
  BackButton,
  BrandHeader,
  Divider,
  Field,
  LinkText,
  PrimaryButton,
  SocialButtons,
  ThemeSwitcher,
  palette,
  postJson,
  showResult,
  useSurfaceColors,
} from '@/components/auth/auth-ui';
import { useTranslation } from '@/hooks/use-translation';

export default function LoginScreen() {
  const colors = useSurfaceColors();
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      await postJson(API_ENDPOINTS.auth.login, {
        username: identifier,
        password,
      });
      showResult(t('common.success'), t('login.success'));
      router.replace('/');
    } catch (error) {
      showResult(t('common.error'), error instanceof Error ? error.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <BackButton />
      <BrandHeader compact />
      <Text style={[styles.title, { color: colors.text }]}>{t('login.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>{t('login.subtitle')}</Text>

      <View style={styles.form}>
        <Field
          label={t('common.emailOrUsername')}
          value={identifier}
          onChangeText={setIdentifier}
          placeholder={t('login.placeholder')}
          keyboardType="email-address"
        />
        <Field
          label={t('common.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <View style={styles.formMeta}>
          <Pressable onPress={() => setRemember((current) => !current)} style={styles.remember}>
            <View style={[styles.checkbox, { borderColor: colors.line }]}>
              {remember ? <View style={styles.checkboxFill} /> : null}
            </View>
            <Text style={[styles.rememberText, { color: colors.text }]}>{t('login.remember')}</Text>
          </Pressable>
          <Link href="/forgot-password" asChild>
            <Pressable>
              <Text style={styles.forgot}>{t('login.forgot')}</Text>
            </Pressable>
          </Link>
        </View>
        <PrimaryButton
          title={t('login.submit')}
          onPress={submit}
          loading={loading}
          style={styles.loginButton}
        />
      </View>

      <Divider />
      <SocialButtons />
      <LinkText before={t('login.noAccount')} label={t('login.create')} href="/register" />
      <ThemeSwitcher />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 28,
  },
  form: {
    marginTop: 4,
  },
  formMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  remember: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxFill: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: palette.green,
  },
  rememberText: {
    fontSize: 12,
  },
  forgot: {
    color: palette.green,
    fontSize: 12,
    fontWeight: '800',
  },
  loginButton: {
    backgroundColor: palette.red,
  },
});
