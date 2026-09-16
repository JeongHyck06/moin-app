import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type Props = { title: string; onClose: () => void; onFlip?: () => void };

// 카메라·미리보기 상단 바 (Figma 47:460), 좌 닫기 우 카메라 전환
export default function TopBar({ title, onClose, onFlip }: Props) {
  return (
    <View style={styles.bar}>
      <Pressable accessibilityRole="button" accessibilityLabel="닫기" hitSlop={12} onPress={onClose}>
        <Image source={require('../assets/x.png')} style={styles.icon} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      {onFlip ? (
        <Pressable accessibilityRole="button" accessibilityLabel="카메라 전환" hitSlop={12} onPress={onFlip}>
          <Image source={require('../assets/refresh-cw.png')} style={styles.icon} />
        </Pressable>
      ) : (
        <View style={styles.icon} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  icon: { width: 28, height: 28 },
  title: { fontSize: 17, fontWeight: '500', color: colors.textPrimary },
});
