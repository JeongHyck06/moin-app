import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import Button from '../components/Button';
import MemberAvatar from '../components/MemberAvatar';
import StreakBadge from '../components/StreakBadge';
import { colors, spacing } from '../theme';

// Figma Complete (47:557), streak.current 는 마감 전 값이라 +1 해서 보여줌
export default function CompleteScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Complete'>) {
  const { result } = route.params;
  const insets = useSafeAreaInsets();
  const g = result.group;
  const remaining = g.activeCount - g.completedCount;
  // 전원 완료면 오늘 기간이 PERFECT 로 닫히므로 완벽 횟수도 +1
  const perfect = result.streak.perfect + (result.allComplete ? 1 : 0);
  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 34) }]}>
      <View style={styles.body}>
        <Image source={require('../assets/flame-hero.png')} style={styles.flame} accessibilityLabel="완벽" />
        <Text style={styles.title}>오늘 완료!</Text>
        <StreakBadge days={result.streak.current + 1} size="large" detail={`어제보다 +1 · 완벽 ${perfect}`} />
        <Text style={styles.accent}>{result.allComplete ? '마지막 1명이었어요 — 전원 완료!' : `${remaining}명 남았어요`}</Text>
        <View style={styles.members}>
          {g.members.map(m => (
            <MemberAvatar key={m.userId} name={m.nickname} done={m.done} avatarUrl={m.avatarUrl} videoUrl={m.videoUrl} size={56} />
          ))}
        </View>
      </View>
      <Button label="홈으로" style={styles.cta} onPress={() => navigation.popToTop()} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  flame: { width: 72, height: 72 },
  title: { fontSize: 34, fontWeight: '900', color: colors.textPrimary },
  accent: { fontSize: 15, fontWeight: '500', color: colors.accent },
  members: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, paddingTop: 8, paddingHorizontal: spacing.lg },
  cta: { marginHorizontal: spacing.lg },
});
