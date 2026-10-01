import { useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, clearToken } from '../api';
import { openLegal, TERMS_VERSION } from '../legal';
import { registerPushToken } from '../push';
import { colors, spacing } from '../theme';
import Button from './Button';

// 서버의 동의 버전으로 기존 사용자도 재확인, 실패 시 게시 화면으로 넘어가지 않음
export default function TermsGate({ children }: { children: ReactNode }) {
  const inset = useSafeAreaInsets();
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = () => {
    setError('');
    api<{ version: string; accepted: boolean }>('GET', '/me/terms')
      .then(v => setAccepted(v.accepted && v.version === TERMS_VERSION))
      .catch(e => setError(e.message));
  };
  useEffect(load, []);
  useEffect(() => {
    if (!accepted) return;
    let cancelled = false;
    let off = () => {};
    registerPushToken().then(remove => {
      if (cancelled) remove();
      else off = remove;
    });
    return () => {
      cancelled = true;
      off();
    };
  }, [accepted]);
  const accept = async () => {
    setBusy(true);
    try {
      await api('POST', '/me/terms', {
        version: TERMS_VERSION,
        accepted: true,
        ageConfirmed: checked,
      });
      setAccepted(true);
    } catch (e) {
      Alert.alert('동의 저장 실패', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  if (accepted) return children;
  return (
    <View
      style={[
        styles.screen,
        { paddingTop: inset.top, paddingBottom: inset.bottom },
      ]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>함께 지키는 모인의 약속</Text>
        <Text style={styles.body}>
          모인은 만 15세 이상 이용할 수 있어요. 본인에게 권리가 있는 영상만
          공유하고, 다른 사람을 존중해주세요.
        </Text>
        <Text style={styles.body}>
          성적·폭력적 콘텐츠, 괴롭힘, 혐오, 타인의 개인정보 공개와 불법 행위는
          허용되지 않아요. 영상과 댓글에서 신고하거나 사용자를 차단할 수 있어요.
        </Text>
        <Text style={styles.body}>
          로그인 정보와 프로필, 그룹·인증 영상·댓글은 서비스 제공에 사용돼요.
          자세한 수집 항목과 삭제 방법을 확인해주세요.
        </Text>
        <Button
          label="이용약관·커뮤니티 규칙 보기"
          variant="secondary"
          onPress={() => openLegal('terms')}
        />
        <Button
          label="개인정보처리방침 보기"
          variant="secondary"
          onPress={() => openLegal('privacy')}
        />
        {accepted === null && !error ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <>
            {error ? (
              <Button label="안내 다시 불러오기" onPress={load} />
            ) : (
              <>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                  style={styles.check}
                  onPress={() => setChecked(v => !v)}
                >
                  <Text style={styles.body}>
                    {checked ? '☑' : '☐'} 만 15세 이상이며 이용약관에 동의하고
                    개인정보 수집·이용 안내를 확인했어요
                  </Text>
                </Pressable>
                <Button
                  label={busy ? '저장 중…' : '동의하고 시작하기'}
                  disabled={!checked || busy}
                  onPress={accept}
                />
              </>
            )}
            {error !== '' && <Text style={styles.body}>{error}</Text>}
          </>
        )}
        <Button
          label="로그아웃"
          variant="secondary"
          onPress={() => {
            clearToken().catch(() =>
              Alert.alert('로그아웃 실패', '다시 시도해주세요'),
            );
          }}
        />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.lg, gap: 20 },
  title: { fontSize: 26, fontWeight: '700', color: colors.textPrimary },
  body: { fontSize: 16, lineHeight: 25, color: colors.textPrimary },
  check: { minHeight: 48, paddingVertical: 12 },
});
