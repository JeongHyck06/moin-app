import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { avatarUrl, upload, type Profile } from '../api';
import Button from '../components/Button';
import { colors, spacing } from '../theme';

// 선택 중에는 로컬 미리보기만 변경, 저장 요청 하나로 사진과 닉네임을 함께 반영
export default function EditProfileScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'EditProfile'>) {
  const { profile } = route.params;
  const insets = useSafeAreaInsets();
  const [nickname, setNickname] = useState(profile.nickname);
  const [photo, setPhoto] = useState<Asset | null>(null);
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(false);
  const name = nickname.trim();
  const uri =
    photo?.uri ?? (profile.avatarUrl ? avatarUrl(profile.avatarUrl) : null);

  const choosePhoto = async () => {
    if (busy || picking) return;
    setPicking(true);
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
        assetRepresentationMode: 'compatible',
      });
      if (result.didCancel) return;
      if (result.errorCode)
        throw new Error(
          result.errorCode === 'permission'
            ? '설정에서 사진 접근을 허용해주세요'
            : '사진을 불러오지 못했어요. 다시 선택해주세요',
        );
      const selected = result.assets?.[0];
      if (!selected?.uri) return;
      if ((selected.fileSize ?? 0) > 5 * 1024 * 1024)
        throw new Error('사진은 5MB 이하로 선택해주세요');
      setPhoto(selected);
    } catch (error) {
      Alert.alert('사진 선택 실패', (error as Error).message);
    } finally {
      setPicking(false);
    }
  };

  const save = async () => {
    if (busy || picking || !name) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append('nickname', name);
      if (photo?.uri)
        form.append('avatar', {
          uri: photo.uri,
          type: photo.type ?? 'image/jpeg',
          name: photo.fileName ?? 'profile.jpg',
        } as unknown as Blob);
      await upload<Profile>('/me/profile', form);
      navigation.goBack();
    } catch (error) {
      Alert.alert('프로필 저장 실패', (error as Error).message);
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={() => navigation.goBack()}
          style={styles.cancel}
        >
          <Text style={styles.cancelText}>취소</Text>
        </Pressable>
        <Text style={styles.title}>프로필 편집</Text>
        <View style={styles.cancel} />
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="프로필 사진 변경"
          disabled={busy || picking}
          onPress={choosePhoto}
          style={styles.photoButton}
        >
          <Image
            source={uri ? { uri } : require('../assets/avatar-empty.png')}
            style={styles.photo}
          />
          <Text style={styles.photoText}>
            {picking ? '사진 선택 중…' : '사진 변경'}
          </Text>
        </Pressable>
        <View style={styles.field}>
          <Text style={styles.label}>닉네임</Text>
          <TextInput
            accessibilityLabel="닉네임"
            value={nickname}
            onChangeText={setNickname}
            editable={!busy}
            maxLength={20}
            autoCorrect={false}
            returnKeyType="done"
            placeholder="닉네임을 입력해주세요"
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
          />
          <Text style={styles.help}>{nickname.length}/20</Text>
        </View>
      </ScrollView>
      <View
        style={[styles.cta, { paddingBottom: Math.max(insets.bottom, 34) }]}
      >
        <Button
          label={busy ? '저장 중…' : '저장'}
          disabled={
            busy || picking || !name || (!photo && name === profile.nickname)
          }
          onPress={save}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  cancel: { minWidth: 48, minHeight: 48, justifyContent: 'center' },
  cancelText: { fontSize: 15, color: colors.textSecondary },
  content: { padding: spacing.lg, gap: 32 },
  photoButton: { alignSelf: 'center', alignItems: 'center', gap: 12 },
  photo: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.surface,
  },
  photoText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 8,
  },
  field: { gap: 10 },
  label: { fontSize: 14, color: colors.textSecondary },
  input: {
    fontSize: 17,
    color: colors.textPrimary,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  help: { fontSize: 13, color: colors.textTertiary, textAlign: 'right' },
  cta: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
});
