import { useRef, useState, type ElementRef } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
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

// 스크롤 위치로 크기·회전·투명도를 연속 보간, JS 갱신과 무관하게 네이티브에서 휠 움직임 유지
function Wheel({ items, index, label, onChange }: { items: string[]; index: number; label: string; onChange: (i: number) => void }) {
  const scroll = useRef<ElementRef<typeof ScrollView>>(null);
  const initialOffset = useRef({ x: 0, y: index * ITEM }).current;
  const position = useRef(new Animated.Value(initialOffset.y)).current;
  const selected = useRef(index);
  const clamp = (i: number) => Math.max(0, Math.min(items.length - 1, i));
  const select = (i: number) => scroll.current?.scrollTo({ y: clamp(i) * ITEM, animated: true });
  return (
    <Animated.ScrollView
      ref={scroll}
      style={styles.column}
      contentContainerStyle={styles.wheelContent}
      contentOffset={initialOffset}
      showsVerticalScrollIndicator={false}
      bounces={false}
      overScrollMode="never"
      snapToInterval={ITEM}
      decelerationRate="fast"
      scrollEventThrottle={16}
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: items.length - 1, now: index, text: items[index] }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={e => select(index + (e.nativeEvent.actionName === 'increment' ? 1 : -1))}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: position } } }], {
        useNativeDriver: true,
        listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
          const next = clamp(Math.round(e.nativeEvent.contentOffset.y / ITEM));
          if (next !== selected.current) {
            selected.current = next;
            onChange(next);
          }
        },
      })}
    >
      {items.map((item, i) => {
        const inputRange = [-2, -1, 0, 1, 2].map(distance => (i + distance) * ITEM);
        return (
          <Pressable key={item} onPress={() => select(i)} accessible={false}>
            <Animated.Text style={[styles.item, {
              opacity: position.interpolate({ inputRange, outputRange: [0.2, 0.55, 1, 0.55, 0.2], extrapolate: 'clamp' }),
              transform: [
                { perspective: 400 },
                { rotateX: position.interpolate({ inputRange, outputRange: ['50deg', '25deg', '0deg', '-25deg', '-50deg'], extrapolate: 'clamp' }) },
                { scale: position.interpolate({ inputRange, outputRange: [0.75, 0.9, 1, 0.9, 0.75], extrapolate: 'clamp' }) },
              ],
            }]}>{item}</Animated.Text>
          </Pressable>
        );
      })}
    </Animated.ScrollView>
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
          <Wheel items={HOURS} index={h} label="시" onChange={setH} />
          <Text style={styles.colon}>:</Text>
          <Wheel items={MINUTES} index={mi} label="분" onChange={setMi} />
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
  wheelContent: { paddingVertical: ITEM * PAD },
  item: { height: ITEM, lineHeight: ITEM, textAlign: 'center', fontSize: 24, fontWeight: '500', color: colors.textPrimary },
  colon: { width: 28, textAlign: 'center', fontSize: 24, fontWeight: '500', color: colors.textPrimary },
});
