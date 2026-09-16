import { useEffect, useRef, useState, type ElementRef } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api, type GroupDetail, type InvitePreview } from '../api';
import type { RootStackParamList } from '../navigation';
import Button from '../components/Button';
import { frequencyText } from '../components/GroupCard';
import Header from '../components/Header';
import InviteCode from '../components/InviteCode';
import MemberAvatar from '../components/MemberAvatar';
import StreakBadge from '../components/StreakBadge';
import { card, colors, radius, spacing } from '../theme';

const LENGTH = 6;

// Figma Join Group (50:823), 6자가 차면 바로 미리보기를 조회
export default function JoinGroupScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'JoinGroup'>) {
  const insets = useSafeAreaInsets();
  const input = useRef<ElementRef<typeof TextInput>>(null);
  const [code, setCode] = useState('');
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPreview(null);
    setError(null);
    if (code.length < LENGTH) {
      return;
    }
    let alive = true; // 코드가 바뀐 뒤 도착한 이전 응답은 버림
    api<InvitePreview>('GET', `/groups/invite/${code}`)
      .then(p => alive && setPreview(p))
      .catch(e => alive && setError((e as Error).message));
    return () => {
      alive = false;
    };
  }, [code]);

  const join = async () => {
    setBusy(true);
    try {
      await api<GroupDetail>('POST', `/groups/invite/${code}/join`);
      navigation.popToTop();
    } catch (e) {
      Alert.alert('참여 실패', (e as Error).message);
      setBusy(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 34) }]}>
      <Header title="그룹 참여" small />
      <View style={styles.content}>
        <Text style={styles.title}>초대코드를 입력하세요</Text>
        <InviteCode code={code} editable onPress={() => input.current?.focus()} />
        <TextInput
          ref={input}
          value={code}
          onChangeText={t => setCode(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, LENGTH))}
          autoFocus
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={LENGTH}
          style={styles.hidden}
        />
        {preview && (
          <View style={[card, styles.preview]}>
            <View style={styles.previewTop}>
              <Text style={styles.name}>{preview.name}</Text>
              <StreakBadge days={preview.streak} size="small" />
            </View>
            <Text style={styles.meta}>
              {preview.memberCount}명 · {frequencyText(preview.frequency, preview.weeklyTarget)} · 하루 리셋 {preview.resetTime}
            </Text>
            <View style={styles.members}>
              {preview.members.map((m, i) => (
                <MemberAvatar key={m.userId} done={m.done} size={32} style={i > 0 && styles.overlap} />
              ))}
            </View>
          </View>
        )}
        {(preview || error) && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              {error ?? (preview?.alreadyMember ? '이미 참여한 그룹이에요' : '이번 기간은 인원에 포함되지 않고, 다음 기간부터 함께해요')}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.cta}>
        <Button label="참여하기" onPress={join} disabled={busy || !preview || preview.alreadyMember} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: 20 },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  hidden: { position: 'absolute', opacity: 0, width: 1, height: 1 },
  preview: { padding: spacing.md, gap: 10 },
  previewTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  meta: { fontSize: 14, color: colors.textSecondary },
  members: { flexDirection: 'row' },
  overlap: { marginLeft: -8 },
  notice: { backgroundColor: colors.fillSecondary, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14 },
  noticeText: { fontSize: 14, color: colors.textSecondary },
  cta: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
});
