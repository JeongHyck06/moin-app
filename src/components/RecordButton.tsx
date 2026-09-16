import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme';

const SIZE = 88;
const STROKE = 4;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = { recording: boolean; duration: number; onPress: () => void };

// 카메라 위에 놓이므로 링은 흰색 고정, 중심은 액센트 (Figma RecordButton 42:90)
// 녹화 중에는 액센트 링이 duration 초 동안 시계 방향으로 채워짐
export default function RecordButton({ recording, duration, onPress }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!recording) {
      progress.setValue(0);
      return;
    }
    // strokeDashoffset 은 네이티브 드라이버가 못 다루는 속성이라 JS 타이밍으로
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: duration * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [recording, duration, progress]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={recording ? '녹화 중' : '녹화'}
      disabled={recording}
      onPress={onPress}
      style={styles.wrap}
    >
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={recording ? 'rgba(255,255,255,0.3)' : colors.textPrimary}
          strokeWidth={STROKE}
          fill="none"
        />
        {recording && (
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={colors.accent}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={progress.interpolate({ inputRange: [0, 1], outputRange: [CIRCUMFERENCE, 0] })}
            // 12시 방향에서 시작
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        )}
      </Svg>
      <View style={recording ? styles.square : styles.dot} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  dot: { width: SIZE - STROKE * 5, height: SIZE - STROKE * 5, borderRadius: SIZE / 2, backgroundColor: colors.accent },
  square: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.accent },
});
