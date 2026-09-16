import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

// 카메라 위에 놓이므로 링은 흰색 고정, 중심은 액센트 (Figma RecordButton 42:90)
// ponytail: 녹화 중 링이 채워지는 애니메이션은 생략, 남은 초 텍스트로 대신함
export default function RecordButton({ recording, onPress }: { recording: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={recording ? '녹화 중' : '녹화'}
      disabled={recording}
      onPress={onPress}
      style={[styles.ring, recording && styles.ringRecording]}
    >
      <View style={recording ? styles.square : styles.dot} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringRecording: { borderColor: 'rgba(255,255,255,0.3)' },
  dot: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.accent },
  square: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.accent },
});
