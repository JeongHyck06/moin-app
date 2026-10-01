import { useContext, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { api } from '../api';
import { CurrentUserId, notifySafetyChange } from '../safety';
import { colors } from '../theme';

type Props = {
  groupId: number;
  userId: number;
  kind: 'CHECK_IN' | 'COMMENT' | 'USER';
  targetId: number;
  onHidden?: () => void;
};
export default function SafetyActions({
  groupId,
  userId,
  kind,
  targetId,
  onHidden,
}: Props) {
  const me = useContext(CurrentUserId);
  const [busy, setBusy] = useState(false);
  if (me === userId) return null;
  const finish = () => {
    notifySafetyChange();
    onHidden?.();
  };
  const report = async (reason: string) => {
    setBusy(true);
    try {
      await api('POST', '/reports', { groupId, kind, targetId, reason });
      finish();
      Alert.alert(
        '신고 접수 완료',
        '신고한 콘텐츠는 숨겨지며 운영자가 검토해요.',
      );
    } catch (e) {
      Alert.alert('신고 실패', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const reasons = () =>
    Alert.alert('신고 사유', '운영자에게 검토를 요청합니다.', [
      {
        text: '성적·폭력적 콘텐츠',
        onPress: () => report('성적·폭력적 콘텐츠'),
      },
      {
        text: '괴롭힘·개인정보·기타 위반',
        onPress: () => report('괴롭힘·개인정보·기타 위반'),
      },
      { text: '취소', style: 'cancel' },
    ]);
  const block = () =>
    Alert.alert(
      '이 사용자를 차단할까요?',
      '서로의 영상·댓글 노출을 제한해요. 그룹의 달성 기록은 유지되며 마이페이지에서 해제할 수 있어요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '차단',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await api('PUT', `/me/blocks/${userId}`);
              finish();
            } catch (e) {
              Alert.alert('차단 실패', (e as Error).message);
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="신고·차단"
      disabled={busy}
      style={styles.button}
      onPress={() =>
        Alert.alert('안전한 이용', undefined, [
          { text: '신고', onPress: reasons },
          { text: '사용자 차단', onPress: block },
          { text: '취소', style: 'cancel' },
        ])
      }
    >
      <Text style={styles.text}>{busy ? '처리 중…' : '신고·차단'}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    minWidth: 70,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  text: { color: colors.accent, fontSize: 13 },
});
