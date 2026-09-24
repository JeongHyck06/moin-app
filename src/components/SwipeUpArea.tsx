import { useMemo, type ReactNode } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

// 수직 이동이 확실할 때만 터치를 가져와 좌우 탭·가로 페이징과 충돌 방지
export default function SwipeUpArea({ onSwipeUp, enabled = true, children }: { onSwipeUp: () => void; enabled?: boolean; children: ReactNode }) {
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, { dx, dy }) => enabled && dy < -12 && Math.abs(dy) > Math.abs(dx) * 1.5,
    onPanResponderRelease: (_, { dy }) => { if (dy < -60) onSwipeUp(); },
  }), [enabled, onSwipeUp]);
  return <View style={styles.area} {...pan.panHandlers}>{children}</View>;
}

const styles = StyleSheet.create({ area: { flex: 1 } });
