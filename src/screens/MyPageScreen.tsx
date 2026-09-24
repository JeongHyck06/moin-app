import { useCallback, useRef, useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { api, ApiError, clearToken, setToken, type MyGroup, type Profile } from '../api';
import { useSeenCheckIns } from '../SeenCheckInsProvider';
import { clearSocialLogin } from '../socialLogin';
import { currentPushToken, forgetPushToken } from '../push';
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
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deletingRef = useRef(false);
  const seen = useSeenCheckIns();

  // 서버 삭제가 성공한 뒤 기기 상태 정리, 로컬 저장 실패로 탈퇴 성공을 실패처럼 표시하지 않음
  const deleteAccount = async () => {
    if (deletingRef.current || loggingOut) return;
    deletingRef.current = true;
    setDeleting(true);
    let result: { appleManualRevocationRequired: boolean };
    try {
      result = await api('DELETE', '/me', { confirmed: true });
    } catch (error) {
      deletingRef.current = false;
      setDeleting(false);
      Alert.alert('회원 탈퇴 실패', (error as Error).message);
      return;
    }
    await Promise.allSettled([seen.clear(), clearSocialLogin()]);
    forgetPushToken();
    setToken(null);
    Alert.alert('회원 탈퇴 완료', result.appleManualRevocationRequired
      ? '모인 계정이 삭제됐어요. Apple 계정의 ‘Apple로 로그인’ 설정에서도 모인을 선택해 연결을 해제해주세요.'
      : '모인 계정과 인증·댓글이 삭제됐어요.', result.appleManualRevocationRequired
      ? [{ text: '확인', style: 'cancel' }, { text: 'Apple 연결 해제 안내', onPress: () => { Linking.openURL('https://support.apple.com/ko-kr/102571').catch(() => {}); } }]
      : [{ text: '확인' }]);
  };
  const confirmDeletion = () => Alert.alert('모인을 탈퇴할까요?',
    '프로필, 인증 영상, 댓글, 프리즈 잔액이 삭제되며 복구할 수 없어요. 모든 모임에서 나가고, 방장인 모임은 가장 먼저 가입한 멤버에게 넘어가요. 혼자 남은 모임은 삭제돼요. 구매는 자동 환불되지 않아요.',
    [{ text: '취소', style: 'cancel' }, { text: '회원 탈퇴', style: 'destructive', onPress: deleteAccount }]);

  const logout = async () => {
    if (loggingOut || deletingRef.current) return;
    setLoggingOut(true);
    try {
      try {
        await api<void>('POST', '/me/logout', { pushToken: currentPushToken() });
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) throw error;
      }
      await clearSocialLogin();
      forgetPushToken();
      await clearToken();
    } catch (error) {
      Alert.alert('로그아웃 실패', (error as Error).message);
    } finally {
      setLoggingOut(false);
    }
  };

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
          <Pressable accessibilityRole="button" disabled={!profile} style={styles.editButton} onPress={() => profile && navigation.navigate('EditProfile', { profile })}>
            <Text style={styles.editText}>프로필 편집</Text>
          </Pressable>
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
          <ListRow title="프리즈 보관함" subtitle="1개 1,000원 · 광고 보상 주 1회" chevron separator onPress={() => navigation.navigate('FreezeShop')} />
          <ListRow title="알림 설정" separator={Platform.OS === 'ios'} chevron onPress={() => navigation.navigate('NotificationSettings')} />
          {Platform.OS === 'ios' && <ListRow title="광고 추적 설정" subtitle="허용하지 않아도 앱을 이용할 수 있어요" chevron onPress={() => { Linking.openSettings().catch(() => Alert.alert('설정 열기 실패', '기기 설정에서 모인을 찾아주세요')); }} />}
        </View>
        <View style={card}>
          <ListRow title={loggingOut ? '로그아웃 중…' : '로그아웃'} separator onPress={loggingOut || deleting ? undefined : logout} />
          <ListRow title={deleting ? '탈퇴 처리 중…' : '회원 탈퇴'} onPress={loggingOut || deleting ? undefined : confirmDeletion} />
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
  editButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.md },
  editText: { fontSize: 14, fontWeight: '600', color: colors.accent },
  section: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
});
