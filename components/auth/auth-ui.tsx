import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { PropsWithChildren, ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_ENDPOINTS, apiRequest } from '@/config/api';
import { ThemePreference, useAppTheme } from '@/hooks/use-app-theme';
import { useTranslation } from '@/hooks/use-translation';

export const palette = {
  green: '#05B321',
  greenDark: '#038A18',
  yellow: '#F5CE00',
  orange: '#FF9F1C',
  blue: '#1E8CFF',
  purple: '#8E44D8',
  red: '#E6292C',
  ink: '#101316',
  muted: '#6F7782',
  line: '#DFE4EA',
  darkBg: '#081412',
  darkSurface: '#121F1C',
  darkLine: '#263632',
};

export function useSurfaceColors() {
  const { isDark } = useAppTheme();

  return {
    isDark,
    bg: isDark ? palette.darkBg : '#F7F9F8',
    surface: isDark ? palette.darkSurface : '#FFFFFF',
    raised: isDark ? '#162621' : '#FFFFFF',
    text: isDark ? '#F4F7F5' : palette.ink,
    muted: isDark ? '#A9B5B0' : palette.muted,
    line: isDark ? palette.darkLine : palette.line,
    input: isDark ? '#0D1916' : '#FFFFFF',
  };
}

export function AuthShell({
  children,
  scroll = true,
}: PropsWithChildren<{ scroll?: boolean }>) {
  const colors = useSurfaceColors();

  const content = <View style={styles.screenInner}>{children}</View>;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

export function BrandHeader({ compact = false }: { compact?: boolean }) {
  const { isDark } = useAppTheme();

  return (
    <View style={[styles.brandHeader, compact && styles.brandHeaderCompact]}>
      <Image
        source={
          isDark
            ? require('@/assets/images/logo-theme-dark.png')
            : require('@/assets/images/logo-theme-light.png')
        }
        style={[styles.logo, compact && styles.logoCompact]}
        contentFit="contain"
      />
    </View>
  );
}

export function BackButton() {
  const colors = useSurfaceColors();

  return (
    <Pressable
      accessibilityLabel="Back"
      onPress={() => router.back()}
      style={[styles.backButton, { backgroundColor: colors.raised }]}>
      <Ionicons name="chevron-back" size={20} color={colors.text} />
    </Pressable>
  );
}

export function TextBlock({
  title,
  subtitle,
  center = true,
}: {
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  const colors = useSurfaceColors();

  return (
    <View style={[styles.textBlock, center && styles.center]}>
      <Text style={[styles.screenTitle, { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  const colors = useSurfaceColors();
  const [visible, setVisible] = useState(false);
  const isPassword = Boolean(secureTextEntry);

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.input, borderColor: colors.line }]}>
        <TextInput
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={isPassword && !visible}
          style={[styles.input, { color: colors.text }]}
          value={value}
        />
        {isPassword ? (
          <Pressable onPress={() => setVisible((current) => !current)} style={styles.eyeButton}>
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function InlineToast({
  message,
  type,
}: {
  message?: string;
  type: 'success' | 'error';
}) {
  if (!message) {
    return null;
  }

  const backgroundColor = type === 'success' ? '#E8F9E6' : '#FDEBEC';
  const borderColor = type === 'success' ? palette.green : palette.red;
  const icon = type === 'success' ? 'checkmark-circle' : 'alert-circle';

  return (
    <View style={[styles.inlineToast, { backgroundColor, borderColor }]}>
      <Ionicons name={icon} size={18} color={borderColor} />
      <Text style={[styles.inlineToastText, { color: borderColor }]}>{message}</Text>
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && styles.pressed,
        loading && styles.disabled,
        style,
      ]}>
      {loading ? <ActivityIndicator color="#FFFFFF" /> : null}
      {!loading && icon ? <Ionicons name={icon} size={18} color="#FFFFFF" /> : null}
      <Text style={styles.primaryButtonText}>{title}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  title,
  onPress,
  icon,
}: {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const colors = useSurfaceColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        { backgroundColor: colors.surface, borderColor: colors.line },
        pressed && styles.pressed,
      ]}>
      {icon ? <Ionicons name={icon} size={18} color={colors.text} /> : null}
      <Text style={[styles.secondaryButtonText, { color: colors.text }]}>{title}</Text>
    </Pressable>
  );
}

export function Divider() {
  const colors = useSurfaceColors();
  const { t } = useTranslation();

  return (
    <View style={styles.dividerRow}>
      <View style={[styles.dividerLine, { backgroundColor: colors.line }]} />
      <Text style={[styles.dividerText, { color: colors.muted }]}>{t('common.orContinueWith')}</Text>
      <View style={[styles.dividerLine, { backgroundColor: colors.line }]} />
    </View>
  );
}

export function SocialButtons() {
  const { t } = useTranslation();

  return (
    <View style={styles.socialRow}>
      <SocialButton
        title={t('common.google')}
        icon={
          <Image
            source={require('@/assets/images/logo-google.png')}
            style={styles.socialLogo}
            contentFit="contain"
          />
        }
      />
      <SocialButton
        title={t('common.facebook')}
        icon={
          <Image
            source={require('@/assets/images/logo-facebook.png')}
            style={styles.socialLogo}
            contentFit="contain"
          />
        }
      />
    </View>
  );
}

function SocialButton({ icon, title }: { icon: ReactNode; title: string }) {
  const colors = useSurfaceColors();

  return (
    <Pressable
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.socialButton,
        { backgroundColor: colors.surface, borderColor: colors.line },
        pressed && styles.pressed,
      ]}>
      {icon}
    </Pressable>
  );
}

export function LinkText({
  before,
  label,
  href,
  style,
}: {
  before: string;
  label: string;
  href: '/login' | '/register' | '/forgot-password' | '/';
  style?: StyleProp<TextStyle>;
}) {
  const colors = useSurfaceColors();

  return (
    <View style={styles.linkTextWrap}>
      <Text style={[styles.bottomText, { color: colors.text }, style]}>{before}</Text>
      <Link href={href} asChild>
        <Pressable>
          <Text style={styles.linkText}>{label}</Text>
        </Pressable>
      </Link>
    </View>
  );
}

export function ThemeSwitcher() {
  const { preference, setPreference } = useAppTheme();
  const colors = useSurfaceColors();

  return (
    <View style={styles.themeSwitcherWrap}>
      <View style={[styles.iconSegmented, { borderColor: colors.line, backgroundColor: colors.surface }]}>
        <IconSegment
          icon="phone-portrait-outline"
          selected={preference === 'auto'}
          onPress={() => setPreference('auto')}
        />
        <IconSegment
          icon="sunny-outline"
          selected={preference === 'light'}
          onPress={() => setPreference('light')}
        />
        <IconSegment
          icon="moon-outline"
          selected={preference === 'dark'}
          onPress={() => setPreference('dark')}
        />
      </View>
    </View>
  );
}

function IconSegment({
  icon,
  selected,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useSurfaceColors();

  return (
    <Pressable onPress={onPress} style={[styles.iconSegment, selected && styles.segmentSelected]}>
      <Ionicons name={icon} size={18} color={selected ? '#FFFFFF' : colors.text} />
    </Pressable>
  );
}

export function PreferencesBar() {
  return null;
}

function SegmentedControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[][];
  onChange: (value: string) => void;
}) {
  const colors = useSurfaceColors();

  return (
    <View style={styles.segmentGroup}>
      <Text style={[styles.segmentLabel, { color: colors.muted }]}>{label}</Text>
      <View style={[styles.segmented, { borderColor: colors.line, backgroundColor: colors.surface }]}>
        {options.map(([optionValue, title]) => {
          const selected = optionValue === value;

          return (
            <Pressable
              key={optionValue}
              onPress={() => onChange(optionValue)}
              style={[styles.segment, selected && styles.segmentSelected]}>
              <Text style={[styles.segmentText, { color: selected ? '#FFFFFF' : colors.text }]}>
                {title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function HiddenLanguageAndThemePreferences() {
  const { preference, setPreference } = useAppTheme();

  return (
    <View style={styles.preferences}>
      <SegmentedControl
        label="Theme"
        value={preference}
        options={[
          ['auto', 'Auto'],
          ['light', 'Light'],
          ['dark', 'Dark'],
        ]}
        onChange={(value) => setPreference(value as ThemePreference)}
      />
    </View>
  );
}

export async function postJson(endpoint: string, body: Record<string, unknown>) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function putJson(endpoint: string, body: Record<string, unknown>) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function showResult(title: string, message: string) {
  Alert.alert(title, message);
}

export { API_ENDPOINTS };

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  screenInner: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingVertical: 18,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandHeaderCompact: {
    marginBottom: 8,
  },
  logo: {
    width: 200,
    height: 74,
  },
  logoCompact: {
    width: 128,
    height: 48,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  textBlock: {
    gap: 8,
    marginBottom: 22,
  },
  center: {
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  subtitle: {
    maxWidth: 330,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  field: {
    gap: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputWrap: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  eyeButton: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineToast: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineToastText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: palette.green,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.7,
  },
  dividerRow: {
    marginVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialLogo: {
    width: 26,
    height: 26,
  },
  linkTextWrap: {
    gap: 8,
    alignItems: 'center',
    marginTop: 26,
  },
  bottomText: {
    fontSize: 15,
  },
  linkText: {
    color: palette.green,
    fontSize: 15,
    fontWeight: '800',
  },
  preferences: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  themeSwitcherWrap: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 6,
  },
  iconSegmented: {
    width: 150,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  iconSegment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentGroup: {
    flex: 1,
    gap: 6,
  },
  segmentLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  segmented: {
    minHeight: 34,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  segmentSelected: {
    backgroundColor: palette.green,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
