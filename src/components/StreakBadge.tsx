import { StyleSheet, Text, View } from 'react-native';
import StatusIcon from './StatusIcon';
import { colors } from '../theme';

type Props = {
  days: number;
  size?: 'small' | 'medium' | 'large'; // small=리스트, medium=카드, large=그룹 상세
  detail?: string; // "완벽 10 · 프리즈 1 · 결석허용 1"
};

// 끊긴 스트릭(0일)은 중립 회색 빈 원, 빨강 금지 (Figma StreakBadge 43:42)
export default function StreakBadge({ days, size = 'medium', detail }: Props) {
  const icon = { small: 16, medium: 20, large: 30 }[size];
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <StatusIcon status={days > 0 ? 'PERFECT' : 'FAILED'} size={icon} />
        <Text style={[styles.days, size === 'large' && styles.daysLarge, size === 'small' && styles.daysSmall]}>{days}일</Text>
      </View>
      {detail !== undefined && <Text style={styles.detail}>{detail}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  // 보조 라인이 숫자보다 길어서, 가운데 정렬을 안 주면 아이콘+숫자가 왼쪽으로 붙는다 (Figma 43:42)
  wrap: { gap: 2, alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  days: { fontSize: 22, fontWeight: '900', color: colors.textPrimary, fontVariant: ['tabular-nums'] },
  daysLarge: { fontSize: 34 },
  daysSmall: { fontSize: 17 },
  detail: { fontSize: 13, color: colors.textSecondary },
});
