import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

type Props = {
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  detail?: string; // 우측 보조 텍스트 "오늘 영상 3개"
  chevron?: boolean;
  tall?: boolean;
  separator?: boolean;
  onPress?: () => void;
};

// iOS 그룹형 리스트 Row (Figma Row 34:475)
export default function ListRow({ title, subtitle, subtitleColor, detail, chevron, tall, separator, onPress }: Props) {
  return (
    <>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [styles.row, tall && styles.tall, pressed && styles.pressed]}
      >
        <View style={styles.texts}>
          <Text style={styles.title}>{title}</Text>
          {subtitle !== undefined && (
            <Text style={[styles.subtitle, subtitleColor !== undefined && { color: subtitleColor }]}>{subtitle}</Text>
          )}
        </View>
        {detail !== undefined && <Text style={styles.detail}>{detail}</Text>}
        {chevron && <Text style={styles.chevron}>›</Text>}
      </Pressable>
      {separator && <View style={styles.separator} />}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    minHeight: 44,
  },
  tall: { paddingVertical: 14 },
  pressed: { opacity: 0.6 },
  texts: { flex: 1, gap: 2 },
  title: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  subtitle: { fontSize: 15, color: colors.textSecondary },
  detail: { fontSize: 17, color: colors.textSecondary },
  chevron: { fontSize: 22, lineHeight: 24, color: colors.textTertiary },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: spacing.md, backgroundColor: colors.separator },
});
