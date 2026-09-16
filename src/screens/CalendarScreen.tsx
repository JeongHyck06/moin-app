import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api, type Calendar } from '../api';
import { addMonths, koreanMonth, monthCells, toISOMonth, type Cell } from '../date';
import type { RootStackParamList } from '../navigation';
import Header from '../components/Header';
import StatusIcon from '../components/StatusIcon';
import { card, colors, spacing } from '../theme';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 날짜 아래 상태 심볼 병기, 오늘은 액센트 원, 기록 없는 날은 흐리게 (Figma CalendarCell 44:311)
function CalendarCell({ cell, today }: { cell: Cell; today: string }) {
  const isToday = cell.iso === today;
  return (
    <View style={styles.cell}>
      <View style={[styles.day, isToday && styles.dayToday]}>
        <Text style={[styles.dayText, cell.status === undefined && !isToday && styles.dayMuted, isToday && styles.dayTextToday]}>{cell.day}</Text>
      </View>
      {cell.status !== undefined && <StatusIcon status={cell.status} size={14} />}
    </View>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// Figma Calendar (47:651)
export default function CalendarScreen({ route }: NativeStackScreenProps<RootStackParamList, 'Calendar'>) {
  const { groupId } = route.params;
  const insets = useSafeAreaInsets();
  const thisMonth = toISOMonth(new Date());
  const [month, setMonth] = useState(thisMonth);
  const [cal, setCal] = useState<Calendar | null>(null);

  useEffect(() => {
    api<Calendar>('GET', `/groups/${groupId}/calendar?month=${month}`)
      .then(setCal)
      .catch(e => Alert.alert('불러오기 실패', (e as Error).message));
  }, [groupId, month]);

  const cells = cal ? monthCells(month, cal.periods) : [];
  const weeks: (Cell | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="기록" small />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 34) }]}>
        <View style={styles.monthRow}>
          <Text style={styles.month}>{koreanMonth(month)}</Text>
          <View style={styles.arrows}>
            <Pressable accessibilityRole="button" accessibilityLabel="이전 달" hitSlop={8} onPress={() => setMonth(m => addMonths(m, -1))}>
              <Text style={styles.arrow}>‹</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="다음 달"
              hitSlop={8}
              disabled={month >= thisMonth}
              onPress={() => setMonth(m => addMonths(m, 1))}
            >
              <Text style={[styles.arrow, month >= thisMonth && styles.arrowMuted]}>›</Text>
            </Pressable>
          </View>
        </View>
        <View style={[card, styles.grid]}>
          <View style={styles.week}>
            {WEEKDAYS.map(w => (
              <Text key={w} style={styles.weekday}>
                {w}
              </Text>
            ))}
          </View>
          {weeks.map((week, r) => (
            <View key={r} style={styles.week}>
              {Array.from({ length: 7 }, (_, i) => {
                const c = week[i];
                return c ? <CalendarCell key={c.iso} cell={c} today={cal?.today ?? ''} /> : <View key={`blank-${i}`} style={styles.cell} />;
              })}
            </View>
          ))}
        </View>
        {cal && (
          <View style={[card, styles.stats]}>
            <Stat value={cal.totalCheckIns} label="총 인증" />
            <Stat value={`${cal.longestStreak}일`} label="최장 스트릭" />
            <Stat value={`${cal.perfectRate}%`} label="완벽 비율" />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  month: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  arrows: { flexDirection: 'row', gap: 24 },
  arrow: { fontSize: 28, lineHeight: 30, color: colors.textSecondary },
  arrowMuted: { color: colors.textTertiary },
  grid: { padding: spacing.md, gap: 6 },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  weekday: { width: 44, textAlign: 'center', fontSize: 12, color: colors.textTertiary },
  cell: { width: 44, height: 56, paddingTop: 4, alignItems: 'center', gap: 4 },
  day: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dayToday: { backgroundColor: colors.accent },
  dayText: { fontSize: 15, fontWeight: '500', color: colors.textPrimary },
  dayMuted: { color: colors.textTertiary },
  dayTextToday: { fontWeight: '700' },
  stats: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 22, fontWeight: '900', color: colors.textPrimary, fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 12, color: colors.textSecondary },
});
