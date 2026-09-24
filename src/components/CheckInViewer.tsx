import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';
import CheckInComments from './CheckInComments';
import StoryPager from './StoryPager';

type Certification = { userId: number; name: string; path: string; checkInId: number | null };
type Props = { groupId: number; items: Certification[]; initialUserId: number; period: string; onClose: () => void };

// 현재 기간의 최신 인증을 직접 재생, 닫을 때 플레이어도 함께 해제
export default function CheckInViewer({ groupId, items, initialUserId, period, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(() => Math.max(0, items.findIndex(item => item.userId === initialUserId)));
  const [paused, setPaused] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const current = items[index];
  if (!current) return null;

  return (
    <Modal visible animationType="fade" presentationStyle="fullScreen" onRequestClose={() => commentsOpen ? setCommentsOpen(false) : onClose()}>
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 8) }]}>
        <View style={styles.segments}>
          {items.map((item, i) => <View key={item.userId} style={[styles.segment, i <= index && styles.segmentActive]} />)}
        </View>
        <View style={styles.header}>
          <View style={styles.heading}>
            <Text style={styles.name} numberOfLines={1}>{current.name}님의 인증</Text>
            <Text style={styles.subtitle}>{period} 최신 인증 · {index + 1}/{items.length}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="인증 영상 닫기" style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
        </View>
        <StoryPager items={items} index={index} onIndexChange={next => { setIndex(next); setPaused(false); }} paused={paused} commentsOpen={commentsOpen} onComments={() => setCommentsOpen(true)} />
        <View style={styles.footer}>
          {current.checkInId != null && <Pressable accessibilityRole="button" accessibilityLabel="댓글 열기" style={styles.close} onPress={() => setCommentsOpen(true)}><Text style={styles.closeText}>댓글</Text></Pressable>}
          <Pressable accessibilityRole="button" style={styles.close} onPress={() => setPaused(value => !value)}>
            <Text style={styles.closeText}>{paused ? '재생' : '일시정지'}</Text>
          </Pressable>
        </View>
        {commentsOpen && current.checkInId != null && <CheckInComments key={current.checkInId} groupId={groupId} checkInId={current.checkInId} name={current.name} onClose={() => setCommentsOpen(false)} />}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  heading: { flex: 1, gap: 4 },
  name: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary },
  close: { minWidth: 48, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  closeText: { fontSize: 15, fontWeight: '600', color: colors.accent },
  segments: { flexDirection: 'row', gap: 4, paddingHorizontal: spacing.lg, paddingTop: 8 },
  segment: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.fillSecondary },
  segmentActive: { backgroundColor: colors.textPrimary },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg },
});
