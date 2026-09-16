import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { api, type MyGroup, type Profile } from '../api';
import Header from '../components/Header';
import ListRow from '../components/ListRow';
import MemberAvatar from '../components/MemberAvatar';
import StreakBadge from '../components/StreakBadge';
import { TAB_BAR_HEIGHT } from '../components/TabBar';
import { card, colors, spacing } from '../theme';

// Figma My Page (51:818)
export default function MyPageScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [groups, setGroups] = useState<MyGroup[]>([]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([api<Profile>('GET', '/me'), api<MyGroup[]>('GET', '/me/groups')])
        .then(([p, g]) => {
          setProfile(p);
          setGroups(g);
        })
        .catch(e => Alert.alert('불러오기 실패', (e as Error).message));
    }, []),
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="마이페이지" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: TAB_BAR_HEIGHT + Math.max(insets.bottom, 16) }]}>
        <View style={[card, styles.profile]}>
          <MemberAvatar done avatarUrl={profile?.avatarUrl} size={64} />
          <Text style={styles.nickname}>{profile?.nickname ?? ''}</Text>
          <StreakBadge
            days={profile?.totalStreak ?? 0}
            size="large"
            detail={`전체 그룹 합산 · 총 인증 ${profile?.totalCheckIns ?? 0}회`}
          />
        </View>
        <Text style={styles.section}>내 그룹</Text>
        <View style={card}>
          {groups.map((g, i) => (
            <ListRow
              key={g.id}
              title={g.name}
              subtitle={`달성률 ${g.achievementRate}% · ${g.streak}일`}
              bold
              tall
              chevron
              separator={i < groups.length - 1}
              onPress={() => navigation.navigate('GroupDetail', { id: g.id })}
            />
          ))}
          {groups.length === 0 && <ListRow title="아직 그룹이 없어요" />}
        </View>
        <View style={card}>
          <ListRow title="알림 설정" chevron onPress={() => navigation.navigate('NotificationSettings')} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  profile: { alignItems: 'center', gap: 8, paddingVertical: spacing.lg },
  nickname: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  section: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
});
