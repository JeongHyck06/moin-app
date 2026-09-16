import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

type Props = { title: string; subtitle?: string; small?: boolean };

// Extra Prominent 헤더, small 은 하위 화면용 Nested 타입 (Figma Header 34:265)
export default function Header({ title, subtitle, small }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={small ? styles.small : styles.title}>{title}</Text>
      {subtitle !== undefined && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.md, paddingVertical: 10, gap: 2 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.45, color: colors.textPrimary },
  small: { fontSize: 17, lineHeight: 22, fontWeight: '700', color: colors.textSecondary },
  subtitle: { fontSize: 15, lineHeight: 20, letterSpacing: -0.45, color: colors.textSecondary },
});
