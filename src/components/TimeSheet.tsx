import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme';
import Button from './Button';

const pad = (n: number) => String(n).padStart(2, '0');
export const parseTime = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return { h, m };
};
export const formatTime = (h: number, m: number) => `${pad(h)}:${pad(m)}`;
// "04:00" 리셋이면 "03:59" 까지 전날 인증, 자정 넘김 처리 포함
export const minuteBefore = (t: string) => {
  const { h, m } = parseTime(t);
  const total = (h * 60 + m + 24 * 60 - 1) % (24 * 60);
  return formatTime(Math.floor(total / 60), total % 60);
};

const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5)); // 5분 단위
const ITEM = 44;
const PAD = 2; // 선택 줄 위아래로 보이는 항목 수, 휠 높이 = ITEM * (PAD * 2 + 1)

// 앞뒤에 빈 칸을 PAD 개씩 넣어 첫/마지막 항목도 가운데 줄에 오게 함
function Wheel({ items, index, onChange }: { items: string[]; index: number; onChange: (i: number) => void }) {
  const data = [...Array(PAD).fill(''), ...items, ...Array(PAD).fill('')];
  return (
    <FlatList
      data={data}
      keyExtractor={(_, i) => String(i)}
      style={styles.column}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM}
      decelerationRate="fast"
      getItemLayout={(_, i) => ({ length: ITEM, offset: ITEM * i, index: i })}
      initialScrollIndex={index}
      onMomentumScrollEnd={e => onChange(Math.round(e.nativeEvent.contentOffset.y / ITEM))}
      renderItem={({ item, index: i }) => (
        <Text style={[styles.item, i - PAD === index ? styles.selected : Math.abs(i - PAD - index) > 1 && styles.far]}>
          {item}
        </Text>
      )}
    />
  );
}

type Props = {
  visible: boolean;
  title: string;
  subtitle: string;
  value: string; // "HH:MM"
  onDone: (value: string) => void;
  onClose: () => void;
};

// 바텀시트 시각 피커 (Figma 61:1099), 분은 5분 단위라 그 밖의 값은 가까운 눈금으로
export default function TimeSheet({ visible, title, subtitle, value, onDone, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const initial = parseTime(value);
  const [h, setH] = useState(initial.h);
  const [mi, setMi] = useState(Math.round(initial.m / 5) % 12);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.dim} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 34) }]}>
        <View style={styles.grabber} />
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.wheel}>
          <View style={styles.selection} />
          <Wheel items={HOURS} index={h} onChange={setH} />
          <Text style={styles.colon}>:</Text>
          <Wheel items={MINUTES} index={mi} onChange={setMi} />
        </View>
        <Button label="완료" onPress={() => onDone(formatTime(h, mi * 5))} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingTop: 8,
    paddingHorizontal: spacing.lg,
    gap: 20,
  },
  grabber: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, backgroundColor: colors.textTertiary },
  header: { gap: 4 },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary },
  wheel: { height: ITEM * (PAD * 2 + 1), flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  selection: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ITEM * PAD,
    height: ITEM,
    borderRadius: 12,
    backgroundColor: colors.fillTertiary,
  },
  column: { width: 80, flexGrow: 0 },
  item: { height: ITEM, lineHeight: ITEM, textAlign: 'center', fontSize: 20, color: colors.textSecondary },
  selected: { fontSize: 24, fontWeight: '500', color: colors.textPrimary },
  far: { color: colors.textTertiary, opacity: 0.6 },
  colon: { width: 28, textAlign: 'center', fontSize: 24, fontWeight: '500', color: colors.textPrimary },
});
