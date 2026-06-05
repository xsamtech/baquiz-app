import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import {
  API_ENDPOINTS,
  AuthShell,
  BackButton,
  BrandHeader,
  Field,
  PrimaryButton,
  ThemeSwitcher,
  TextBlock,
  putJson,
  showResult,
} from '@/components/auth/auth-ui';
import { useTranslation } from '@/hooks/use-translation';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ email?: string; code?: string; resetId?: string }>();
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      if (!params.resetId) {
        throw new Error(t('reset.missingToken'));
      }

      await putJson(API_ENDPOINTS.passwordReset.update(params.resetId), {
        email: params.email ?? '',
        token: params.code ?? '',
        former_password: password,
        password,
        password_confirmation: passwordConfirmation,
      });
      showResult(t('common.success'), t('reset.done'));
      router.replace('/login');
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
      <TextBlock title={t('reset.newPasswordTitle')} subtitle={t('reset.newPasswordSubtitle')} />
      <Field
        label={t('common.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Field
        label={t('common.confirmPassword')}
        value={passwordConfirmation}
        onChangeText={setPasswordConfirmation}
        secureTextEntry
      />
      <PrimaryButton title={t('reset.reset')} onPress={submit} loading={loading} />
      <ThemeSwitcher />
    </AuthShell>
  );
}
