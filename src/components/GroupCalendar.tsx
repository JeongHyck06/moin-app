import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { api, type Calendar } from '../api';
import {
  addMonths,
  koreanMonth,
  monthCells,
  toISOMonth,
  type Cell,
} from '../date';
import StatusIcon from './StatusIcon';
import { card, colors, spacing } from '../theme';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 날짜 아래 상태 심볼 병기, 오늘은 액센트 원, 기록 없는 날은 흐리게 (Figma CalendarCell 44:311)
function CalendarCell({
  cell,
  today,
  onPress,
}: {
  cell: Cell;
  today: string;
  onPress?: () => void;
}) {
  const isToday = cell.iso === today;
  return (
    <Pressable
      style={styles.cell}
      onPress={onPress}
      disabled={!onPress || cell.iso > today}
      accessibilityRole="button"
      accessibilityLabel={`${cell.iso} 인증 기록`}
    >
      <View style={[styles.day, isToday && styles.dayToday]}>
        <Text
          style={[
            styles.dayText,
            cell.status === undefined && !isToday && styles.dayMuted,
            isToday && styles.dayTextToday,
          ]}
        >
          {cell.day}
        </Text>
      </View>
      {cell.status !== undefined && (
        <StatusIcon status={cell.status} size={14} />
      )}
    </Pressable>
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

// 그룹 상세에서 바로 확인하는 월별 기록, 날짜를 누르면 해당 날짜 인증 영상으로 이동
export default function GroupCalendar({
  groupId,
  onDatePress,
}: {
  groupId: number;
  onDatePress?: (date: string) => void;
}) {
  const thisMonth = toISOMonth(new Date());
  const [month, setMonth] = useState(thisMonth);
  const [cal, setCal] = useState<Calendar | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const focused = useIsFocused();
  useEffect(() => {
    if (!focused) return;
    let alive = true;
    setCal(null);
    setError(null);
    api<Calendar>('GET', `/groups/${groupId}/calendar?month=${month}`)
      .then(value => {
        if (alive) setCal(value);
      })
      .catch(e => {
        if (alive) setError((e as Error).message);
      });
    return () => {
      alive = false;
    };
  }, [groupId, month, retry, focused]);

  const cells = cal ? monthCells(month, cal.periods) : [];
  const weeks: (Cell | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <View style={styles.content}>
      <Text style={styles.section}>기록</Text>
      <View style={styles.monthRow}>
        <Text style={styles.month}>{koreanMonth(month)}</Text>
        <View style={styles.arrows}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="이전 달"
            hitSlop={8}
            onPress={() => setMonth(m => addMonths(m, -1))}
          >
            <Text style={styles.arrow}>‹</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="다음 달"
            hitSlop={8}
            disabled={month >= thisMonth}
            onPress={() => setMonth(m => addMonths(m, 1))}
          >
            <Text
              style={[styles.arrow, month >= thisMonth && styles.arrowMuted]}
            >
              ›
            </Text>
          </Pressable>
        </View>
      </View>
      {error ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setRetry(n => n + 1)}
          style={styles.message}
        >
          <Text style={styles.error}>{error} · 다시 시도</Text>
        </Pressable>
      ) : !cal ? (
        <ActivityIndicator
          color={colors.accent}
          accessibilityLabel="기록 불러오는 중"
        />
      ) : (
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
                return c ? (
                  <CalendarCell
                    key={c.iso}
                    cell={c}
                    today={cal?.today ?? ''}
                    onPress={onDatePress ? () => onDatePress(c.iso) : undefined}
                  />
                ) : (
                  <View key={`blank-${i}`} style={styles.cell} />
                );
              })}
            </View>
          ))}
        </View>
      )}
      {cal && (
        <View style={[card, styles.stats]}>
          <Stat value={cal.totalCheckIns} label="총 인증" />
          <Stat value={`${cal.longestStreak}일`} label="최장 스트릭" />
          <Stat value={`${cal.perfectRate}%`} label="완벽 비율" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  section: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  message: { paddingVertical: 20 },
  error: { color: colors.textSecondary, textAlign: 'center' },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  month: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  arrows: { flexDirection: 'row', gap: 24 },
  arrow: { fontSize: 28, lineHeight: 30, color: colors.textSecondary },
  arrowMuted: { color: colors.textTertiary },
  grid: { padding: spacing.md, gap: 6 },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: colors.textTertiary,
  },
  cell: { flex: 1, height: 56, paddingTop: 4, alignItems: 'center', gap: 4 },
  day: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayToday: { backgroundColor: colors.accent },
  dayText: { fontSize: 15, fontWeight: '500', color: colors.textPrimary },
  dayMuted: { color: colors.textTertiary },
  dayTextToday: { fontWeight: '700' },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  statLabel: { fontSize: 12, color: colors.textSecondary },
});
