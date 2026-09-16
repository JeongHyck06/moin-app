import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Video from 'react-native-video';
import { upload, type CheckInResult } from '../api';
import type { RootStackParamList } from '../navigation';
import Button from '../components/Button';
import TopBar from '../components/TopBar';
import { card, colors, spacing } from '../theme';

// Figma Preview (47:504), 3초 영상 반복 재생 후 업로드
export default function PreviewScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Preview'>) {
  const { groupId, name, path } = route.params;
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const uri = `file://${path}`;

  const submit = async () => {
    setBusy(true);
    const form = new FormData();
    // RN fetch 는 {uri, name, type} 객체를 파일 파트로 보낸다, 파트 이름은 서버 계약대로 "video"
    form.append('video', { uri, name: 'video.mp4', type: 'video/mp4' });
    try {
      const result = await upload<CheckInResult>(`/groups/${groupId}/check-ins`, form);
      navigation.replace('Complete', { result });
    } catch (e) {
      Alert.alert('업로드 실패', (e as Error).message);
      setBusy(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 34) }]}>
      <TopBar title="미리보기" onClose={() => navigation.goBack()} />
      <View style={styles.wrap}>
        <View style={[card, styles.video]}>
          <Video source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" repeat />
        </View>
      </View>
      <View style={styles.actions}>
        <Button label="다시 찍기" variant="secondary" style={styles.action} onPress={() => navigation.replace('Camera', { groupId, name })} />
        <Button label={busy ? '올리는 중' : '인증 완료'} disabled={busy} style={styles.action} onPress={submit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  wrap: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  video: { flex: 1 },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  action: { flex: 1 },
});
