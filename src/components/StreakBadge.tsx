import { StyleSheet, Text, View } from 'react-native';
import StatusIcon from './StatusIcon';
import { colors } from '../theme';

type Props = {
  days: number;
  size?: 'medium' | 'large'; // medium=카드, large=그룹 상세
  detail?: string; // "완벽 10 · 프리즈 1 · 결석허용 1"
};

// 끊긴 스트릭(0일)은 중립 회색 빈 원, 빨강 금지 (Figma StreakBadge 43:42)
export default function StreakBadge({ days, size = 'medium', detail }: Props) {
  const large = size === 'large';
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <StatusIcon status={days > 0 ? 'PERFECT' : 'FAILED'} size={large ? 30 : 20} />
        <Text style={[styles.days, large && styles.daysLarge]}>{days}일</Text>
      </View>
      {detail !== undefined && <Text style={styles.detail}>{detail}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  days: { fontSize: 22, fontWeight: '900', color: colors.textPrimary, fontVariant: ['tabular-nums'] },
  daysLarge: { fontSize: 34 },
  detail: { fontSize: 13, color: colors.textSecondary },
});
