import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import { videoUrl } from '../api';
import { colors, spacing } from '../theme';

type Certification = { userId: number; name: string; path: string };
type Props = { items: Certification[]; initialUserId: number; period: string; onClose: () => void };

// 현재 기간의 최신 인증을 직접 재생, 닫을 때 플레이어도 함께 해제
export default function CheckInViewer({ items, initialUserId, period, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [index, setIndex] = useState(() => Math.max(0, items.findIndex(item => item.userId === initialUserId)));
  const [paused, setPaused] = useState(false);
  const current = items[index];
  const move = (direction: number) => {
    const next = Math.max(0, Math.min(items.length - 1, index + direction));
    if (next === index) return;
    setLoading(true);
    setFailed(false);
    setPaused(false);
    setIndex(next);
  };
  if (!current) return null;

  return (
    <Modal visible animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }]}>
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
        <View style={styles.player}>
          {!failed && (
            <Video
              key={`${current.userId}-${attempt}`}
              source={{ uri: videoUrl(current.path) }}
              style={StyleSheet.absoluteFill}
              resizeMode="contain"
              controls={false}
              repeat
              paused={paused}
              playInBackground={false}
              playWhenInactive={false}
              onLoad={() => setLoading(false)}
              onBuffer={({ isBuffering }) => setLoading(isBuffering)}
              onError={() => { setLoading(false); setFailed(true); }}
            />
          )}
          <View style={styles.tapZones}>
            <Pressable style={styles.tapZone} accessibilityRole="button" accessibilityLabel="이전 인증" disabled={index === 0} onPress={() => move(-1)} />
            <Pressable style={styles.tapZone} accessibilityRole="button" accessibilityLabel="다음 인증" disabled={index === items.length - 1} onPress={() => move(1)} />
          </View>
          {failed && (
            <View style={styles.error} pointerEvents="box-none">
              <Text style={styles.subtitle}>인증 영상을 불러오지 못했어요</Text>
              <Pressable accessibilityRole="button" style={styles.close} onPress={() => { setLoading(true); setFailed(false); setAttempt(n => n + 1); }}>
                <Text style={styles.closeText}>다시 시도</Text>
              </Pressable>
            </View>
          )}
          {loading && !failed && <ActivityIndicator style={StyleSheet.absoluteFill} pointerEvents="none" color={colors.accent} accessibilityLabel="인증 영상 불러오는 중" />}
        </View>
        <View style={styles.footer}>
          <Text style={styles.subtitle}>왼쪽 탭 이전 · 오른쪽 탭 다음</Text>
          <Pressable accessibilityRole="button" style={styles.close} disabled={failed} onPress={() => setPaused(value => !value)}>
            <Text style={styles.closeText}>{paused ? '재생' : '일시정지'}</Text>
          </Pressable>
        </View>
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
  player: { flex: 1, justifyContent: 'center' },
  tapZones: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, flexDirection: 'row' },
  tapZone: { flex: 1 },
  segments: { flexDirection: 'row', gap: 4, paddingHorizontal: spacing.lg, paddingTop: 8 },
  segment: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.fillSecondary },
  segmentActive: { backgroundColor: colors.textPrimary },
  footer: { alignItems: 'center', paddingTop: spacing.sm },
  error: { alignItems: 'center', gap: spacing.sm },
});
