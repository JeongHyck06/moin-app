import { useCallback, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api, type GroupDetail } from '../api';
import type { RootStackParamList } from '../navigation';
import Button from '../components/Button';
import ListRow from '../components/ListRow';
import MemberAvatar from '../components/MemberAvatar';
import ProgressBar from '../components/ProgressBar';
import StreakBadge from '../components/StreakBadge';
import { card, colors, radius, spacing } from '../theme';

// Figma Group Detail (46:338)
export default function GroupDetailScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'GroupDetail'>) {
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const [detail, setDetail] = useState<GroupDetail | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);

  // 인증하고 돌아오면 스트릭·진행도가 바뀌므로 포커스마다 다시 조회
  useFocusEffect(
    useCallback(() => {
      api<GroupDetail>('GET', `/groups/${id}`)
        .then(setDetail)
        .catch(e => Alert.alert('불러오기 실패', (e as Error).message));
    }, [id]),
  );

  if (!detail) {
    return <View style={styles.screen} />;
  }
  const g = detail.card;
  const period = g.frequency === 'DAILY' ? '오늘' : '이번 주';
  const { streak } = detail;
  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 34) }]}>
      <View style={styles.header}>
        <Text style={styles.heading} numberOfLines={1}>{g.name}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="그룹 옵션" onPress={() => setOptionsOpen(true)} style={styles.optionsButton}>
          <Text style={styles.optionsIcon}>•••</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <StreakBadge days={streak.current} size="large" detail={`완벽 ${streak.perfect} · 프리즈 ${streak.frozen} · 결석허용 ${streak.pass}`} />
          <Text style={styles.next}>{g.myDone ? `${period} 인증 완료` : `${period} 하면 ${streak.current + 1}일`}</Text>
        </View>
        <ProgressBar
          value={g.completedCount}
          max={g.activeCount}
          threshold={detail.threshold}
          label={`${period} ${g.completedCount}/${g.activeCount}`}
          note={`${detail.threshold}명이면 완료`}
        />
        <View style={[card, styles.members]}>
          {g.members.map(m => (
            <MemberAvatar
              key={m.userId}
              name={m.nickname}
              done={m.done}
              avatarUrl={m.avatarUrl}
              videoUrl={m.videoUrl}
              size={56}
              progress={g.frequency === 'WEEKLY' ? `${m.doneCount}/${g.weeklyTarget}` : undefined}
            />
          ))}
        </View>
        <View style={card}>
          <ListRow
            title="피드"
            detail={`${period} 영상 ${detail.periodVideoCount}개`}
            chevron
            separator
            onPress={() => navigation.navigate('Feed', { groupId: g.id })}
          />
          <ListRow
            title="기록"
            detail={`이번 달 ${detail.monthCompletedPeriods}/${detail.monthClosedPeriods}`}
            chevron
            onPress={() => navigation.navigate('Calendar', { groupId: g.id })}
          />
        </View>
      </ScrollView>
      <View style={styles.cta}>
        <Button
          label={g.myDone ? `${period} 인증 완료` : '인증하기'}
          disabled={g.myDone || g.joinsNextPeriod}
          onPress={() => navigation.navigate('Camera', { groupId: g.id, name: g.name })}
        />
      </View>
      <Modal visible={optionsOpen} transparent animationType="fade" onRequestClose={() => setOptionsOpen(false)}>
        <View style={styles.optionsOverlay}>
          <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="그룹 옵션 닫기" onPress={() => setOptionsOpen(false)} />
          <View style={[styles.optionsMenu, { marginTop: insets.top + 54 }]} accessibilityViewIsModal>
            <ListRow
              title="초대코드 공유"
              detail={detail.inviteCode}
              separator={detail.isOwner}
              onPress={() => Share.share({ message: `모인 "${g.name}" 초대코드: ${detail.inviteCode}` }).catch(() => Alert.alert('공유 실패', '잠시 후 다시 시도해 주세요'))}
            />
            {detail.isOwner && (
              <ListRow
                title="그룹 이름 변경"
                chevron
                onPress={() => {
                  setOptionsOpen(false);
                  navigation.navigate('EditGroupName', { id: g.id, name: g.name });
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  header: { flexDirection: 'row', alignItems: 'center', paddingLeft: spacing.md, paddingRight: 8, minHeight: 48 },
  heading: { flex: 1, fontSize: 17, lineHeight: 22, fontWeight: '700', color: colors.textSecondary },
  optionsButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  optionsIcon: { fontSize: 19, letterSpacing: 2, color: colors.textPrimary },
  optionsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'flex-end' },
  optionsMenu: { width: 300, maxWidth: '92%', marginRight: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, overflow: 'hidden' },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: 24 },
  hero: { alignItems: 'center', gap: 6 },
  next: { fontSize: 13, color: colors.textSecondary },
  members: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  cta: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
});
