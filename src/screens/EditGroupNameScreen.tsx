import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api, type GroupDetail } from '../api';
import type { RootStackParamList } from '../navigation';
import Button from '../components/Button';
import Header from '../components/Header';
import { colors, spacing } from '../theme';

const MAX = 20; // 서버 @Size(max=20)

// 디자인 없음, CreateGroup1 의 이름 입력을 그대로 따름
export default function EditGroupNameScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'EditGroupName'>) {
  const { id, name: initial } = route.params;
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(initial);
  const [busy, setBusy] = useState(false);
  const trimmed = name.trim();

  const save = async () => {
    setBusy(true);
    try {
      await api<GroupDetail>('PATCH', `/groups/${id}`, { name: trimmed });
      navigation.goBack(); // 상세는 포커스마다 다시 조회하므로 따로 넘길 것 없음
    } catch (e) {
      Alert.alert('이름 변경 실패', (e as Error).message);
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 34) }]}
    >
      <Header title="그룹 이름 변경" small />
      <View style={styles.content}>
        <Text style={styles.title}>새 이름을 입력하세요</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="예: 모닝 러닝"
          placeholderTextColor={colors.textTertiary}
          maxLength={MAX}
          autoFocus
          returnKeyType="done"
          style={styles.input}
        />
        <Text style={styles.help}>최대 {MAX}자 · 방장만 바꿀 수 있어요</Text>
      </View>
      <View style={styles.cta}>
        <Button label="저장" disabled={busy || trimmed.length === 0 || trimmed === initial} onPress={save} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: 20 },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  input: {
    fontSize: 17,
    lineHeight: 20,
    color: colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  help: { fontSize: 13, color: colors.textTertiary },
  cta: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
});
