import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';
import Button from './Button';
import Header from './Header';

const TOTAL = 5;

type Props = {
  step: number;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  hint?: string; // 액센트 안내 한 줄
  note?: string; // 회색 보조 한 줄
  cta: { label: string; onPress: () => void; disabled?: boolean };
  secondary?: { label: string; onPress: () => void };
};

// 그룹 만들기 5단계 공통 뼈대 (Figma 50:724 계열), 헤더·진행바·제목·CTA 위치가 전부 동일
export default function WizardStep({ step, title, subtitle, children, hint, note, cta, secondary }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 34) }]}
    >
      <Header title="그룹 만들기" small />
      <View style={styles.content}>
        <View style={styles.step}>
          <Text style={styles.stepLabel}>
            {step} / {TOTAL}
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${(step / TOTAL) * 100}%` }]} />
          </View>
        </View>
        <Text style={styles.title}>{title}</Text>
        {subtitle !== undefined && <Text style={styles.subtitle}>{subtitle}</Text>}
        {children}
        {hint !== undefined && <Text style={styles.hint}>{hint}</Text>}
        {note !== undefined && <Text style={styles.note}>{note}</Text>}
      </View>
      <View style={styles.cta}>
        <Button label={cta.label} onPress={cta.onPress} disabled={cta.disabled} />
        {secondary && <Button label={secondary.label} onPress={secondary.onPress} variant="secondary" />}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: 20 },
  step: { gap: 8 },
  stepLabel: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  track: { height: 4, borderRadius: 2, backgroundColor: colors.fillTertiary },
  fill: { height: 4, borderRadius: 2, backgroundColor: colors.accent },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 15, color: colors.textSecondary },
  hint: { fontSize: 15, fontWeight: '500', color: colors.accent },
  note: { fontSize: 13, color: colors.textSecondary },
  cta: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: 12 },
});
