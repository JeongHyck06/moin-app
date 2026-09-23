import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import { videoUrl } from '../api';
import { colors, spacing } from '../theme';

type Props = { name: string; path: string; period: string; onClose: () => void };

// 현재 기간의 최신 인증을 직접 재생, 닫을 때 플레이어도 함께 해제
export default function CheckInViewer({ name, path, period, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  return (
    <Modal visible animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.header}>
          <View style={styles.heading}>
            <Text style={styles.name} numberOfLines={1}>{name}님의 인증</Text>
            <Text style={styles.subtitle}>{period} 최신 인증</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="인증 영상 닫기" style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
        </View>
        <View style={styles.player}>
          {failed ? (
            <View style={styles.error}>
              <Text style={styles.subtitle}>인증 영상을 불러오지 못했어요</Text>
              <Pressable accessibilityRole="button" style={styles.close} onPress={() => { setLoading(true); setFailed(false); setAttempt(n => n + 1); }}>
                <Text style={styles.closeText}>다시 시도</Text>
              </Pressable>
            </View>
          ) : (
            <Video
              key={attempt}
              source={{ uri: videoUrl(path) }}
              style={StyleSheet.absoluteFill}
              resizeMode="contain"
              controls
              repeat
              playInBackground={false}
              playWhenInactive={false}
              onLoad={() => setLoading(false)}
              onBuffer={({ isBuffering }) => setLoading(isBuffering)}
              onError={() => { setLoading(false); setFailed(true); }}
            />
          )}
          {loading && !failed && <ActivityIndicator style={StyleSheet.absoluteFill} pointerEvents="none" color={colors.accent} accessibilityLabel="인증 영상 불러오는 중" />}
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
  error: { alignItems: 'center', gap: spacing.sm },
});
