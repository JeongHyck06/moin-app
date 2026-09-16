import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius } from '../theme';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'accent' | 'kakao' | 'secondary';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

// Liquid Glass Prominent, Large (Figma Button 34:554)
export default function Button({ label, onPress, variant = 'accent', disabled, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.base, styles[variant], (pressed || disabled) && styles.dim, style]}
    >
      <Text style={[styles.label, variant === 'kakao' && styles.kakaoLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: radius.full },
  accent: { backgroundColor: colors.accent },
  kakao: { backgroundColor: colors.kakao },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(166,166,166,0.4)',
  },
  dim: { opacity: 0.6 },
  label: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  kakaoLabel: { color: colors.kakaoText },
});
