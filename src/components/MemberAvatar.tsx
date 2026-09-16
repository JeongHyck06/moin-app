import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme';

type Props = {
  done: boolean;
  name?: string;
  progress?: string; // 주 N회 그룹의 "1/2"
  size?: number;
  style?: StyleProp<ViewStyle>;
};

// 완료=액센트 링(영상 썸네일 자리), 미완료=회색 실루엣, 빨강/경고 금지 (Figma MemberAvatar 42:62)
export default function MemberAvatar({ done, name, progress, size = 36, style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      {done ? (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.fillTertiary,
            borderWidth: size / 28, // Figma 36px 기준 링 1.29, 56px 기준 2
            borderColor: colors.accent,
          }}
        />
      ) : (
        <Image source={require('../assets/avatar-empty.png')} style={{ width: size, height: size }} />
      )}
      {name !== undefined && <Text style={[styles.name, !done && styles.muted]}>{name}</Text>}
      {progress !== undefined && <Text style={styles.progress}>{progress}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 6 },
  name: { fontSize: 13, color: colors.textPrimary },
  muted: { color: colors.textTertiary },
  progress: { fontSize: 12, fontWeight: '500', color: colors.textTertiary },
});
