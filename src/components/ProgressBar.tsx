import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

type Props = {
  value: number;
  max: number;
  threshold?: number; // 결석 허용선, 4명 중 3명이면 완료일 때 3
  label: string; // "오늘 3/4"
  note?: string; // "3명이면 완료"
};

// Figma ProgressBar 42:77
export default function ProgressBar({ value, max, threshold, label, note }: Props) {
  const pct = (n: number) => `${Math.min(100, Math.max(0, (n / max) * 100))}%` as const;
  return (
    <View style={styles.wrap}>
      <View style={styles.labels}>
        <Text style={styles.label}>{label}</Text>
        {note !== undefined && <Text style={styles.note}>{note}</Text>}
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: pct(value) }]} />
        {threshold !== undefined && <View style={[styles.tick, { left: pct(threshold) }]} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 15, fontWeight: '500', color: colors.textPrimary },
  note: { fontSize: 13, color: colors.textSecondary },
  track: { height: 8, borderRadius: radius.full, backgroundColor: colors.fillTertiary },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.accent },
  tick: {
    position: 'absolute',
    top: -4,
    width: 2,
    height: 16,
    marginLeft: -1,
    borderRadius: 1,
    backgroundColor: colors.textTertiary,
  },
});
