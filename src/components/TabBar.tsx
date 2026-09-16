import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, radius } from '../theme';

const INACTIVE = '#F5F5F5';
const PILL = 62; // 탭 54 + 안쪽 여백 4*2
const TOP = 16;
// 목록 화면이 하단 여백을 잡을 때 쓰는 값, safe area 는 호출 쪽에서 더함
export const TAB_BAR_HEIGHT = TOP + PILL;

// 떠 있는 알약형 탭바 (Figma Tab Bar 34:86), 심볼은 디자인의 placeholder(마름모/원)를 도형으로 그림
export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  // 알약 바깥 투명 영역(box-none)은 터치를 아래 리스트로 흘려보냄
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, TOP) }]}>
      <View style={styles.pill}>
        {state.routes.map((route, i) => {
          const active = state.index === i;
          const color = active ? colors.accent : INACTIVE;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => navigation.navigate(route.name)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <View style={[route.name === 'Home' ? styles.diamond : styles.circle, { backgroundColor: color }]} />
              <Text style={[styles.label, { color }]}>{descriptors[route.key].options.title ?? route.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', paddingTop: TOP },
  pill: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(28,28,30,0.94)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(166,166,166,0.4)',
  },
  tab: { width: 84, height: 54, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.08)' },
  diamond: { width: 18, height: 18, borderRadius: 4, transform: [{ rotate: '45deg' }] },
  circle: { width: 20, height: 20, borderRadius: 10 },
  label: { fontSize: 10, lineHeight: 12, fontWeight: '500' },
});
