import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, type NotificationKinds, type NotificationView } from '../api';
import Header from '../components/Header';
import ToggleRow from '../components/ToggleRow';
import { card, colors, spacing } from '../theme';

const KINDS: { key: keyof NotificationKinds; label: string; core?: boolean }[] = [
  { key: 'reminder', label: '리마인더' },
  { key: 'social', label: '소셜' },
  { key: 'crisis', label: '위기' },
  { key: 'lastCall', label: '막차 알림', core: true },
  { key: 'allComplete', label: '전원 완료 알림', core: true },
];

// Figma Notification Settings (51:969), 토글은 낙관적으로 바꾸고 실패하면 되돌림
export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<NotificationView | null>(null);

  useEffect(() => {
    api<NotificationView>('GET', '/me/notification-settings')
      .then(setView)
      .catch(e => Alert.alert('불러오기 실패', (e as Error).message));
  }, []);

  const setKind = (key: keyof NotificationKinds, value: boolean) => {
    if (!view) {
      return;
    }
    const before = view;
    const kinds = { ...view.kinds, [key]: value };
    setView({ ...view, kinds });
    // 서버는 5개 필드를 항상 전부 받음
    api<NotificationView>('PUT', '/me/notification-settings', kinds).catch(e => {
      setView(before);
      Alert.alert('저장 실패', (e as Error).message);
    });
  };

  const setMuted = (id: number, muted: boolean) => {
    if (!view) {
      return;
    }
    const before = view;
    setView({ ...view, groups: view.groups.map(g => (g.id === id ? { ...g, muted } : g)) });
    api<void>('PUT', `/groups/${id}/mute`, { muted }).catch(e => {
      setView(before);
      Alert.alert('저장 실패', (e as Error).message);
    });
  };

  const kinds = KINDS.filter(k => !k.core);
  const core = KINDS.filter(k => k.core);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="알림 설정" small />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 34) }]}>
        {view && view.groups.length > 0 && (
          <>
            <Text style={styles.section}>그룹별 음소거</Text>
            <View style={card}>
              {view.groups.map((g, i) => (
                <ToggleRow
                  key={g.id}
                  title={g.name}
                  value={!g.muted} // 토글이 켜져 있으면 알림 받음
                  onChange={v => setMuted(g.id, !v)}
                  separator={i < view.groups.length - 1}
                />
              ))}
            </View>
          </>
        )}
        <Text style={styles.section}>알림 종류</Text>
        <View style={card}>
          {kinds.map((k, i) => (
            <ToggleRow
              key={k.key}
              title={k.label}
              value={view?.kinds[k.key] ?? false}
              onChange={v => setKind(k.key, v)}
              separator={i < kinds.length - 1}
            />
          ))}
        </View>
        <Text style={styles.section}>막차 · 완료 알림</Text>
        <View style={card}>
          {core.map((k, i) => (
            <ToggleRow
              key={k.key}
              title={k.label}
              value={view?.kinds[k.key] ?? false}
              onChange={v => setKind(k.key, v)}
              separator={i < core.length - 1}
            />
          ))}
        </View>
        <Text style={styles.note}>제품 핵심 알림이라 목록 맨 아래에 두었어요</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  section: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  note: { fontSize: 12, color: colors.textTertiary },
});
