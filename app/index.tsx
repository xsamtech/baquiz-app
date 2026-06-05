import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  API_ENDPOINTS,
  AuthShell,
  BrandHeader,
  ThemeSwitcher,
  palette,
  useSurfaceColors,
} from '@/components/auth/auth-ui';
import { API_BASE_URL } from '@/config/api';
import { useTranslation } from '@/hooks/use-translation';
import { compactCount, labelForCount } from '@/utils/format';

type CountResponse = {
  count?: number | string;
};

type StatKey = 'quizzes' | 'members' | 'challenges';

type Stat = {
  key: StatKey;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  count: number;
  loading: boolean;
};

export default function WelcomeScreen() {
  const colors = useSurfaceColors();
  const { t } = useTranslation();
  const [stats, setStats] = useState<Record<StatKey, Stat>>({
    quizzes: {
      key: 'quizzes',
      icon: 'help-circle-outline',
      color: palette.green,
      count: 0,
      loading: true,
    },
    members: {
      key: 'members',
      icon: 'people-outline',
      color: '#35D46B',
      count: 0,
      loading: true,
    },
    challenges: {
      key: 'challenges',
      icon: 'medal-outline',
      color: palette.yellow,
      count: 0,
      loading: true,
    },
  });

  const loadStats = useCallback(async () => {
    const entries = Object.entries(API_ENDPOINTS.stats) as [StatKey, string][];

    await Promise.all(
      entries.map(async ([key, endpoint]) => {
        try {
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: { Accept: 'application/json' },
          });
          const data = (await response.json()) as CountResponse;
          const count = Number(data?.count ?? 0);

          setStats((current) => ({
            ...current,
            [key]: { ...current[key], count: Number.isFinite(count) ? count : 0, loading: false },
          }));
        } catch {
          setStats((current) => ({
            ...current,
            [key]: { ...current[key], loading: false },
          }));
        }
      })
    );
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const featureCards = [
    {
      icon: 'create-outline',
      color: palette.green,
      title: t('welcome.quizTitle'),
      text: t('welcome.quizText'),
    },
    {
      icon: 'people-outline',
      color: palette.blue,
      title: t('welcome.communityTitle'),
      text: t('welcome.communityText'),
    },
    {
      icon: 'trending-up-outline',
      color: '#70C944',
      title: t('welcome.progressTitle'),
      text: t('welcome.progressText'),
    },
  ] as const;

  const reasons = [
    {
      icon: 'trophy-outline',
      color: palette.green,
      bg: '#E8F9E6',
      title: t('welcome.forEveryoneTitle'),
      text: t('welcome.forEveryoneText'),
    },
    {
      icon: 'person-circle-outline',
      color: palette.blue,
      bg: '#E9F3FF',
      title: t('welcome.easyTitle'),
      text: t('welcome.easyText'),
    },
    {
      icon: 'ribbon-outline',
      color: palette.orange,
      bg: '#FFF2DA',
      title: t('welcome.funTitle'),
      text: t('welcome.funText'),
    },
    {
      icon: 'chatbubbles-outline',
      color: palette.purple,
      bg: '#F1E7FB',
      title: t('welcome.activeCommunityTitle'),
      text: t('welcome.activeCommunityText'),
    },
  ] as const;

  return (
    <AuthShell>
      <BrandHeader />

      <View style={styles.heroText}>
        <Text style={[styles.heroTitle, { color: colors.text }]}>{t('welcome.titleLine1')}</Text>
        <Text style={styles.heroTitleGreen}>{t('welcome.titleLine2')}</Text>
        <Text style={[styles.heroIntro, { color: colors.muted }]}>{t('welcome.intro')}</Text>
      </View>

      <View style={styles.heroImageWrap}>
        <Image
          source={require('@/assets/images/home-screen.png')}
          style={styles.heroImage}
          contentFit="contain"
        />
      </View>

      <View style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        {featureCards.map((item) => (
          <View key={item.title} style={styles.quickItem}>
            <View style={[styles.quickIcon, { backgroundColor: `${item.color}18` }]}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.quickTextWrap}>
              <Text style={[styles.quickTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.quickText, { color: colors.muted }]}>{item.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push('/register')}
          style={({ pressed }) => [styles.actionPrimary, pressed && styles.pressed]}>
          <View style={styles.actionContent}>
            <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionPrimaryText}>{t('welcome.createAccount')}</Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => router.push('/login')}
          style={({ pressed }) => [styles.actionSecondary, pressed && styles.pressed]}>
          <View style={styles.actionContent}>
            <Ionicons name="person-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionSecondaryText}>{t('welcome.login')}</Text>
          </View>
        </Pressable>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('welcome.why')}</Text>
      <View style={styles.reasonList}>
        {reasons.map((item) => (
          <View
            key={item.title}
            style={[styles.reasonCard, { backgroundColor: colors.surface, borderColor: colors.line }]}>
            <View style={[styles.reasonIcon, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon} size={28} color={item.color} />
            </View>
            <View style={styles.reasonTextWrap}>
              <Text style={[styles.reasonTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.reasonText, { color: colors.muted }]}>{item.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.statsCard, { borderColor: colors.line }]}>
        {Object.values(stats).map((stat) => (
          <View key={stat.key} style={styles.statItem}>
            <Ionicons name={stat.icon} size={32} color={stat.color} />
            {stat.loading ? (
              <ActivityIndicator color="#FFFFFF" style={styles.statLoader} />
            ) : (
              <Text style={styles.statValue}>{compactCount(stat.count)}</Text>
            )}
            <Text style={styles.statLabel}>
              {labelForCount(
                stat.count,
                t(`welcome.${stat.key}One`),
                t(`welcome.${stat.key}Other`)
              )}
            </Text>
          </View>
        ))}
      </View>
      <ThemeSwitcher />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  heroText: {
    marginTop: 10,
    gap: 4,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  heroTitleGreen: {
    color: palette.green,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  heroIntro: {
    marginTop: 8,
    maxWidth: 340,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  heroImageWrap: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: -10,
  },
  heroImage: {
    width: '112%',
    maxWidth: 430,
    aspectRatio: 1.22,
  },
  quickCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    gap: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 3,
  },
  quickItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTextWrap: {
    flex: 1,
  },
  quickTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  quickText: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 18,
  },
  actionPrimary: {
    flex: 1,
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    textAlign: 'center',
  },
  actionSecondary: {
    flex: 1,
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: palette.red,
    borderColor: palette.red,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  actionSecondaryText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    textAlign: 'center',
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 14,
  },
  reasonList: {
    gap: 12,
  },
  reasonCard: {
    minHeight: 82,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  reasonIcon: {
    width: 54,
    height: 54,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonTextWrap: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  reasonText: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
  },
  statsCard: {
    marginTop: 22,
    marginBottom: 16,
    minHeight: 132,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#061A16',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  statLoader: {
    height: 30,
  },
  statLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
