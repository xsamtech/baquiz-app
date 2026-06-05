import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  API_ENDPOINTS,
  AuthShell,
  BackButton,
  BrandHeader,
  Divider,
  Field,
  InlineToast,
  LinkText,
  PrimaryButton,
  SocialButtons,
  ThemeSwitcher,
  palette,
  postJson,
  useSurfaceColors,
} from '@/components/auth/auth-ui';
import { useTranslation } from '@/hooks/use-translation';

type AccountType = 'person' | 'organization';
type ToastState = { type: 'success' | 'error'; message: string } | null;
type Currency = { code: string; name: string };
type ApiResponse = { message?: string };

const currencyEndpoint =
  'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies.json';

const fallbackCurrencies: Currency[] = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'CDF', name: 'Congolese Franc' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'XAF', name: 'Central African CFA Franc' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'KES', name: 'Kenyan Shilling' },
  { code: 'CNY', name: 'Chinese Yuan' },
];

function sanitizeUsername(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_{2,}/g, '_')
    .slice(0, 15);
}

export default function RegisterScreen() {
  const colors = useSurfaceColors();
  const { t } = useTranslation();
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [surname, setSurname] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [gender, setGender] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [poBox, setPoBox] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currencies, setCurrencies] = useState(fallbackCurrencies);
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [loading, setLoading] = useState(false);

  const checks = useMemo(
    () => [
      { label: t('register.minLength'), valid: password.length >= 8 },
      { label: t('register.uppercase'), valid: /[A-Z]/.test(password) },
      { label: t('register.special'), valid: /[^A-Za-z0-9]/.test(password) },
      { label: t('register.digit'), valid: /\d/.test(password) },
      { label: t('register.passwordMatch'), valid: password.length > 0 && password === confirmPassword },
    ],
    [confirmPassword, password, t]
  );

  useEffect(() => {
    async function loadCurrencies() {
      try {
        const response = await fetch(currencyEndpoint);
        const data = (await response.json()) as Record<string, string>;
        const preferred = ['usd', 'eur', 'cdf', 'gbp', 'cad', 'xaf', 'zar', 'ngn', 'kes', 'cny'];
        const loaded = preferred
          .filter((code) => data[code])
          .map((code) => ({ code: code.toUpperCase(), name: data[code] }));

        if (loaded.length > 0) {
          setCurrencies(loaded);
          setCurrency((current) => loaded.some((item) => item.code === current) ? current : loaded[0].code);
        }
      } catch {
        setCurrencies(fallbackCurrencies);
      }
    }

    loadCurrencies();
  }, []);

  useEffect(() => {
    if (usernameEdited || !accountType) {
      return;
    }

    const source =
      accountType === 'person' ? `${firstname}_${lastname}` : organizationName;
    setUsername(sanitizeUsername(source));
  }, [accountType, firstname, lastname, organizationName, usernameEdited]);

  function updateUsername(value: string) {
    setUsernameEdited(true);
    setUsername(sanitizeUsername(value));
  }

  async function submit() {
    setToast(null);

    if (password !== confirmPassword) {
      setToast({ type: 'error', message: t('register.passwordMismatch') });
      return;
    }

    setLoading(true);

    try {
      const payload =
        accountType === 'organization'
          ? {
              organization_name: organizationName,
              email,
              phone,
              address_1: address1,
              p_o_box: poBox,
              username,
              password,
              confirm_password: confirmPassword,
              password_confirmation: confirmPassword,
            }
          : {
              firstname,
              lastname,
              surname,
              gender,
              birthdate,
              country,
              city,
              address_1: address1,
              address_2: address2,
              p_o_box: poBox,
              currency,
              email,
              phone,
              username,
              password,
              confirm_password: confirmPassword,
              password_confirmation: confirmPassword,
            };

      const response = (await postJson(API_ENDPOINTS.auth.register, payload)) as ApiResponse;
      setToast({ type: 'success', message: response.message ?? t('register.success') });
      setTimeout(() => router.replace('/'), 900);
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : t('common.error'),
      });
    } finally {
      setLoading(false);
    }
  }

  const selectedCurrency = currencies.find((item) => item.code === currency);

  return (
    <AuthShell>
      <BackButton />
      <BrandHeader compact />
      <Text style={[styles.title, { color: colors.text }]}>{t('register.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>{t('register.subtitle')}</Text>
      <InlineToast message={toast?.message} type={toast?.type ?? 'success'} />

      {!accountType ? (
        <View style={styles.typeBlock}>
          <Text style={[styles.typeQuestion, { color: colors.text }]}>{t('register.whatAreYou')}</Text>
          <View style={styles.typeGrid}>
            <AccountTypeCard
              icon="person-circle-outline"
              title={t('register.person')}
              onPress={() => setAccountType('person')}
            />
            <AccountTypeCard
              icon="business-outline"
              title={t('register.organization')}
              onPress={() => setAccountType('organization')}
            />
          </View>
        </View>
      ) : (
        <View style={styles.form}>
          <Pressable onPress={() => setAccountType(null)} style={styles.changeTypeButton}>
            <Ionicons name="swap-horizontal-outline" size={16} color={palette.green} />
            <Text style={styles.changeTypeText}>{t('register.changeType')}</Text>
          </Pressable>

          {accountType === 'person' ? (
            <>
              <Field label={t('register.firstname')} value={firstname} onChangeText={setFirstname} autoCapitalize="words" />
              <Field label={t('register.lastname')} value={lastname} onChangeText={setLastname} autoCapitalize="words" />
              <Field label={t('register.surname')} value={surname} onChangeText={setSurname} autoCapitalize="words" />
              <Field label={t('register.gender')} value={gender} onChangeText={setGender} />
              <Field label={t('register.birthdate')} value={birthdate} onChangeText={setBirthdate} placeholder="YYYY-MM-DD" />
              <Field label={t('register.country')} value={country} onChangeText={setCountry} autoCapitalize="words" />
              <Field label={t('register.city')} value={city} onChangeText={setCity} autoCapitalize="words" />
              <Field label={t('register.address1')} value={address1} onChangeText={setAddress1} autoCapitalize="sentences" />
              <Field label={t('register.address2')} value={address2} onChangeText={setAddress2} autoCapitalize="sentences" />
              <Field label={t('register.poBox')} value={poBox} onChangeText={setPoBox} />
              <CurrencySelect
                label={t('register.currency')}
                value={`${currency} - ${selectedCurrency?.name ?? ''}`}
                open={currencyPickerOpen}
                currencies={currencies}
                onToggle={() => setCurrencyPickerOpen((current) => !current)}
                onSelect={(nextCurrency) => {
                  setCurrency(nextCurrency);
                  setCurrencyPickerOpen(false);
                }}
              />
            </>
          ) : (
            <>
              <Field
                label={t('register.organizationName')}
                value={organizationName}
                onChangeText={setOrganizationName}
                autoCapitalize="words"
              />
              <Field label={t('register.address1')} value={address1} onChangeText={setAddress1} autoCapitalize="sentences" />
              <Field label={t('register.poBox')} value={poBox} onChangeText={setPoBox} />
            </>
          )}

          <Field label={t('common.email')} value={email} onChangeText={setEmail} placeholder={t('login.placeholder')} keyboardType="email-address" />
          <Field label={t('register.phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Field label={t('common.username')} value={username} onChangeText={updateUsername} placeholder="username" />
          <Text style={[styles.usernameHint, { color: colors.muted }]}>{t('register.usernameHint')}</Text>
          <Field label={t('common.password')} value={password} onChangeText={setPassword} secureTextEntry />
          <Field label={t('common.confirmPassword')} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

          <View style={styles.checkGrid}>
            {checks.map((check) => (
              <View key={check.label} style={styles.checkItem}>
                <Ionicons
                  name={check.valid ? 'checkmark-circle' : 'ellipse-outline'}
                  size={15}
                  color={check.valid ? palette.green : colors.muted}
                />
                <Text style={[styles.checkText, { color: check.valid ? colors.text : colors.muted }]}>
                  {check.label}
                </Text>
              </View>
            ))}
          </View>
          <PrimaryButton title={t('register.submit')} onPress={submit} loading={loading} />
        </View>
      )}

      <Divider />
      <SocialButtons />
      <LinkText before={t('register.haveAccount')} label={t('register.login')} href="/login" />
      <ThemeSwitcher />
    </AuthShell>
  );
}

function AccountTypeCard({
  icon,
  title,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
}) {
  const colors = useSurfaceColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.typeCard,
        { backgroundColor: colors.surface, borderColor: colors.line },
        pressed && styles.pressed,
      ]}>
      <Ionicons name={icon} size={48} color={palette.green} />
      <Text style={[styles.typeCardText, { color: colors.text }]}>{title}</Text>
    </Pressable>
  );
}

function CurrencySelect({
  label,
  value,
  open,
  currencies,
  onToggle,
  onSelect,
}: {
  label: string;
  value: string;
  open: boolean;
  currencies: Currency[];
  onToggle: () => void;
  onSelect: (currency: string) => void;
}) {
  const colors = useSurfaceColors();

  return (
    <View style={styles.currencyField}>
      <Text style={[styles.currencyLabel, { color: colors.text }]}>{label}</Text>
      <Pressable
        onPress={onToggle}
        style={[styles.currencyButton, { backgroundColor: colors.input, borderColor: colors.line }]}>
        <Text style={[styles.currencyValue, { color: colors.text }]}>{value}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
      </Pressable>
      {open ? (
        <ScrollView
          nestedScrollEnabled
          style={[styles.currencyList, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          {currencies.map((item) => (
            <Pressable
              key={item.code}
              onPress={() => onSelect(item.code)}
              style={styles.currencyOption}>
              <Text style={[styles.currencyOptionText, { color: colors.text }]}>
                {item.code} - {item.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 22,
  },
  typeBlock: {
    gap: 16,
  },
  typeQuestion: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '900',
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    minHeight: 150,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 14,
  },
  typeCardText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
  },
  form: {
    marginTop: 4,
  },
  changeTypeButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
  },
  changeTypeText: {
    color: palette.green,
    fontSize: 13,
    fontWeight: '800',
  },
  usernameHint: {
    marginTop: -10,
    marginBottom: 16,
    fontSize: 12,
    lineHeight: 18,
  },
  checkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: -6,
    marginBottom: 18,
  },
  checkItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkText: {
    flex: 1,
    fontSize: 11,
  },
  currencyField: {
    gap: 8,
    marginBottom: 16,
  },
  currencyLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  currencyButton: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  currencyValue: {
    flex: 1,
    fontSize: 15,
  },
  currencyList: {
    maxHeight: 220,
    borderWidth: 1,
    borderRadius: 8,
  },
  currencyOption: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  currencyOptionText: {
    fontSize: 14,
  },
  pressed: {
    opacity: 0.84,
  },
});
