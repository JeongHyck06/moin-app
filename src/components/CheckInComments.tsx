import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, BackHandler, FlatList, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, avatarUrl, type CheckInComment, type CommentPage } from '../api';
import { colors, spacing } from '../theme';

type Props = { groupId: number; checkInId: number; name: string; onClose: () => void };

// 영상 모달 내부에 표시, 인증 ID가 바뀌면 key로 다시 마운트해 요청·초안 분리
export default function CheckInComments({ groupId, checkInId, name, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<CheckInComment[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const alive = useRef(false);
  const fetching = useRef(false);
  const posting = useRef(false);
  const list = useRef<FlatList<CheckInComment>>(null);
  const slide = useRef(new Animated.Value(300)).current;
  const path = `/groups/${groupId}/check-ins/${checkInId}/comments`;

  const load = useCallback(async (before: number | null = null) => {
    if (fetching.current) return;
    fetching.current = true;
    setLoading(true);
    setLoadError(null);
    try {
      const page = await api<CommentPage>('GET', path + (before == null ? '' : `?before=${before}`));
      if (!alive.current) return;
      // 목록을 읽는 동안 보낸 댓글이 사라지지 않도록 ID로 합침
      setItems(previous => [...new Map([...previous, ...page.items].map(item => [item.id, item])).values()].sort((a, b) => b.id - a.id));
      setCursor(page.nextCursor);
      setLoaded(true);
    } catch (e) {
      if (alive.current) setLoadError((e as Error).message);
    } finally {
      fetching.current = false;
      if (alive.current) setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    alive.current = true;
    load();
    Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: true }).start();
    return () => { alive.current = false; };
  }, [load, slide]);

  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => { onClose(); return true; });
    return () => listener.remove();
  }, [onClose]);

  const send = async () => {
    const body = draft.trim();
    if (!body || posting.current) return;
    posting.current = true;
    setSending(true);
    setSendError(null);
    try {
      const comment = await api<CheckInComment>('POST', path, { body });
      if (!alive.current) return;
      setItems(previous => [comment, ...previous.filter(item => item.id !== comment.id)]);
      setDraft('');
      list.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (e) {
      if (alive.current) setSendError((e as Error).message);
    } finally {
      posting.current = false;
      if (alive.current) setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Pressable style={[StyleSheet.absoluteFill, styles.backdrop]} accessibilityRole="button" accessibilityLabel="댓글 닫기" onPress={onClose} />
      <Animated.View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12), transform: [{ translateY: slide }] }]} accessibilityViewIsModal>
        <View style={styles.header}>
          <View style={styles.titleArea}>
            <Text style={styles.title}>댓글</Text>
            <Text style={styles.meta} numberOfLines={1}>{name}님의 인증</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="댓글 닫기" style={styles.action} onPress={onClose}><Text style={styles.actionText}>닫기</Text></Pressable>
        </View>
        <FlatList
          ref={list}
          data={items}
          keyExtractor={item => String(item.id)}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          ListEmptyComponent={!loading && !loadError ? <Text style={styles.empty}>첫 응원을 남겨보세요</Text> : undefined}
          renderItem={({ item }) => (
            <View style={styles.comment}>
              <Image source={item.avatarUrl ? { uri: avatarUrl(item.avatarUrl) } : require('../assets/avatar-empty.png')} style={styles.avatar} />
              <View style={styles.content}>
                <Text style={styles.author}>{item.nickname}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.meta}>{new Date(item.createdAt).toLocaleString('ko-KR')}</Text>
              </View>
            </View>
          )}
          ListFooterComponent={loading ? <ActivityIndicator color={colors.accent} accessibilityLabel="댓글 불러오는 중" /> : loadError ? (
            <Pressable accessibilityRole="button" style={styles.action} onPress={() => load(loaded ? cursor : null)}><Text style={styles.error}>{loadError} · 다시 시도</Text></Pressable>
          ) : cursor != null ? (
            <Pressable accessibilityRole="button" style={styles.action} onPress={() => load(cursor)}><Text style={styles.actionText}>이전 댓글 더 보기</Text></Pressable>
          ) : undefined}
        />
        {sendError && <Text style={styles.error} accessibilityLiveRegion="polite">{sendError}</Text>}
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            accessibilityLabel="댓글 입력"
            placeholder="응원의 댓글을 남겨주세요"
            placeholderTextColor={colors.textSecondary}
            value={draft}
            onChangeText={setDraft}
            maxLength={500}
            multiline
            editable={!sending}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="댓글 보내기" accessibilityState={{ disabled: sending || !draft.trim(), busy: sending }} disabled={sending || !draft.trim()} style={styles.action} onPress={send}>
            {sending ? <ActivityIndicator color={colors.accent} /> : <Text style={[styles.actionText, !draft.trim() && styles.disabled]}>보내기</Text>}
          </Pressable>
        </View>
        <Text style={styles.counter}>{draft.length}/500</Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { height: '72%', backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: spacing.lg, paddingTop: 16 },
  header: { flexDirection: 'row', alignItems: 'center', paddingBottom: 12 },
  titleArea: { flex: 1, gap: 4 },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  meta: { fontSize: 11, color: colors.textSecondary },
  list: { paddingVertical: 12, gap: 20 },
  comment: { flexDirection: 'row', gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  content: { flex: 1, gap: 5 },
  author: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  body: { fontSize: 15, lineHeight: 22, color: colors.textPrimary },
  empty: { textAlign: 'center', color: colors.textSecondary, paddingVertical: 32 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: colors.separator, paddingTop: 12 },
  input: { flex: 1, minHeight: 44, maxHeight: 110, borderRadius: 18, backgroundColor: colors.fillSecondary, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.textPrimary },
  action: { minWidth: 48, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 14, color: colors.accent, fontWeight: '600' },
  disabled: { color: colors.textTertiary },
  error: { fontSize: 12, color: colors.textSecondary, paddingVertical: 8 },
  counter: { color: colors.textTertiary, fontSize: 11, paddingTop: 4, textAlign: 'right' },
});
