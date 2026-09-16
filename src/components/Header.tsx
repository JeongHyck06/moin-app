import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

// Extra Prominent 헤더 (Figma Header 34:265)
export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle !== undefined && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.md, paddingVertical: 10, gap: 2 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.45, color: colors.textPrimary },
  subtitle: { fontSize: 15, lineHeight: 20, letterSpacing: -0.45, color: colors.textSecondary },
});
