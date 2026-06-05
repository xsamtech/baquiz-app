import { router } from 'expo-router';
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
  postJson,
  showResult,
} from '@/components/auth/auth-ui';
import { useTranslation } from '@/hooks/use-translation';

type PasswordResetResource = {
  id?: number;
};

type FindUserResponse = {
  data?: {
    password_resets?: PasswordResetResource;
  };
};

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const response = (await postJson(API_ENDPOINTS.passwordReset.findUser, {
        email,
      })) as FindUserResponse;
      const resetId = response.data?.password_resets?.id;

      router.push({
        pathname: '/verify-reset-code',
        params: { email, resetId: resetId ? String(resetId) : '' },
      });
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
      <TextBlock title={t('reset.title')} subtitle={t('reset.subtitle')} />
      <Field
        label={t('common.email')}
        value={email}
        onChangeText={setEmail}
        placeholder={t('login.placeholder')}
        keyboardType="email-address"
      />
      <PrimaryButton title={t('reset.sendCode')} onPress={submit} loading={loading} />
      <ThemeSwitcher />
    </AuthShell>
  );
}
