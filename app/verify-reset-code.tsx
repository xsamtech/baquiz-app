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
  postJson,
  showResult,
} from '@/components/auth/auth-ui';
import { useTranslation } from '@/hooks/use-translation';

type PasswordResetResource = {
  id?: number;
};

type CheckTokenResponse = {
  data?: PasswordResetResource;
};

export default function VerifyResetCodeScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ email?: string; resetId?: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const email = params.email ?? '';

  async function submit() {
    setLoading(true);
    try {
      const response = (await postJson(API_ENDPOINTS.passwordReset.checkToken, {
        email,
        token: code,
      })) as CheckTokenResponse;
      const resetId = response.data?.id ?? params.resetId ?? '';

      router.push({ pathname: '/reset-password', params: { email, code, resetId: String(resetId) } });
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
      <TextBlock title={t('reset.codeTitle')} subtitle={t('reset.codeSubtitle')} />
      <Field
        label={t('reset.code')}
        value={code}
        onChangeText={setCode}
        placeholder="000000"
        keyboardType="number-pad"
      />
      <PrimaryButton title={t('reset.verify')} onPress={submit} loading={loading} />
      <ThemeSwitcher />
    </AuthShell>
  );
}
