import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

type Props = { value: number; min: number; max: number; onChange: (v: number) => void };

// iOS 스테퍼 (Figma Stepper 61:1084), 경계값에서는 해당 쪽만 흐리게
export default function Stepper({ value, min, max, onChange }: Props) {
  const canDec = value > min;
  const canInc = value < max;
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="줄이기"
        disabled={!canDec}
        onPress={() => onChange(value - 1)}
        style={[styles.half, !canDec && styles.dim]}
      >
        <Text style={styles.sign}>−</Text>
      </Pressable>
      <View style={styles.separator} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="늘리기"
        disabled={!canInc}
        onPress={() => onChange(value + 1)}
        style={[styles.half, !canInc && styles.dim]}
      >
        <Text style={styles.sign}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 94,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.fillTertiary,
    overflow: 'hidden',
  },
  half: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center' },
  dim: { opacity: 0.3 },
  separator: { width: 1, height: 24, backgroundColor: colors.textTertiary },
  sign: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
});
