import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Video from 'react-native-video';
import { api, videoUrl, type Feed, type FeedMember } from '../api';
import { addDays, koreanDate, toISODate } from '../date';
import type { RootStackParamList } from '../navigation';
import MemberAvatar from '../components/MemberAvatar';
import CheckInComments from '../components/CheckInComments';
import SwipeUpArea from '../components/SwipeUpArea';

const BG = '#17171A';

// 좌우 탭·페이징으로 멤버 이동, 위로 스와이프는 현재 인증의 댓글 열기
export default function FeedScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Feed'>) {
  const { groupId } = route.params;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const today = toISODate(new Date());
  const [date, setDate] = useState(route.params.date ?? today);
  const [feed, setFeed] = useState<Feed | null>(null);
  const [index, setIndex] = useState(0);
  const list = useRef<FlatList<FeedMember>>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const activeIndex = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let alive = true;
    setFeed(null);
    setError(null);
    setIndex(0);
    setCommentsOpen(false);
    activeIndex.current = 0;
    api<Feed>('GET', `/groups/${groupId}/check-ins?date=${date}`)
      .then(f => {
        if (!alive) {
          return;
        }
        setFeed(f);
        setIndex(0);
        list.current?.scrollToOffset({ offset: 0, animated: false });
      })
      .catch(e => { if (alive) setError((e as Error).message); });
    return () => {
      alive = false;
    };
  }, [groupId, date, retry]);

  const members = feed?.members ?? [];
  const current = members[index];
  const move = (direction: number) => {
    const next = Math.max(0, Math.min(members.length - 1, activeIndex.current + direction));
    if (next === activeIndex.current) return;
    activeIndex.current = next;
    setIndex(next);
    list.current?.scrollToOffset({ offset: next * width, animated: false });
  };

  return (
    <View
      style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 40) }]}
    >
      <View style={styles.segments}>
        {members.map((m, i) => (
          <View key={m.userId} style={[styles.seg, i <= index && styles.segActive]} />
        ))}
      </View>
      <View style={styles.header}>
        <MemberAvatar done={current?.videoUrl != null} avatarUrl={current?.avatarUrl} videoUrl={current?.videoUrl} size={32} />
        <View style={styles.name}>
          <Text style={styles.nameText}>{current?.nickname ?? ''}</Text>
          <Text style={styles.meta}>
            {koreanDate(date)} · {feed?.completedCount ?? 0}/{feed?.activeCount ?? 0}
          </Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="닫기" hitSlop={12} onPress={() => navigation.goBack()}>
          <Image source={require('../assets/x.png')} style={styles.icon} />
        </Pressable>
      </View>
      <View style={styles.dates}>
        <Pressable accessibilityRole="button" accessibilityLabel="이전 날짜" style={styles.dateButton} onPress={() => setDate(d => addDays(d, -1))}><Text style={styles.nameText}>‹ 이전 날</Text></Pressable>
        <Text style={styles.meta}>{koreanDate(date)}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="다음 날짜" accessibilityState={{ disabled: date >= today }} disabled={date >= today} style={styles.dateButton} onPress={() => setDate(d => addDays(d, 1))}><Text style={[styles.nameText, date >= today && styles.disabled]}>다음 날 ›</Text></Pressable>
      </View>
      <SwipeUpArea enabled={current?.checkInId != null && !commentsOpen} onSwipeUp={() => setCommentsOpen(true)}>
      <FlatList
        ref={list}
        data={members}
        horizontal
        pagingEnabled
        extraData={`${index}-${commentsOpen}`}
        scrollEnabled={!commentsOpen}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        showsHorizontalScrollIndicator={false}
        keyExtractor={m => String(m.userId)}
        onMomentumScrollEnd={e => {
          const next = Math.max(0, Math.min(members.length - 1, Math.round(e.nativeEvent.contentOffset.x / width)));
          activeIndex.current = next;
          setIndex(next);
        }}
        ListEmptyComponent={
          <View style={[styles.empty, { width }]}>
            {error ? (
              <Pressable accessibilityRole="button" style={styles.retry} onPress={() => setRetry(n => n + 1)}>
                <Text style={styles.meta}>{error} · 다시 시도</Text>
              </Pressable>
            ) : feed ? <Text style={styles.placeholder}>이 날은 영상이 없어요</Text> : <ActivityIndicator color="#FFFFFF" accessibilityLabel="선택한 날짜 인증 불러오는 중" />}
          </View>
        }
        renderItem={({ item, index: i }) => (
          <View style={[styles.page, { width }]}>
            {item.videoUrl ? (
              <Video source={{ uri: videoUrl(item.videoUrl) }} style={StyleSheet.absoluteFill} resizeMode="cover" controls={false} repeat paused={i !== index || commentsOpen} playInBackground={false} playWhenInactive={false} />
            ) : (
              <Text style={styles.placeholder}>아직 인증 전이에요</Text>
            )}
            <View style={styles.tapZones}>
              <Pressable style={styles.tapZone} accessibilityRole="button" accessibilityLabel="이전 멤버 인증" disabled={i === 0} onPress={() => move(-1)} />
              <Pressable style={styles.tapZone} accessibilityRole="button" accessibilityLabel="다음 멤버 인증" disabled={i === members.length - 1} onPress={() => move(1)} />
            </View>
          </View>
        )}
      />
      </SwipeUpArea>
      <Text style={styles.hint}>왼쪽 탭 이전 · 오른쪽 탭 다음</Text>
      {current?.checkInId != null && <Pressable accessibilityRole="button" accessibilityLabel="댓글 열기" style={styles.dateButton} onPress={() => setCommentsOpen(true)}><Text style={styles.nameText}>위로 스와이프해 댓글 남기기 ↑</Text></Pressable>}
      {commentsOpen && current?.checkInId != null && <CheckInComments key={current.checkInId} groupId={groupId} checkInId={current.checkInId} name={current.nickname} onClose={() => setCommentsOpen(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  segments: { flexDirection: 'row', gap: 4, paddingHorizontal: 20, paddingTop: 6 },
  seg: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)' },
  segActive: { backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  name: { flex: 1 },
  nameText: { fontSize: 15, fontWeight: '500', color: '#FFFFFF' },
  meta: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  icon: { width: 28, height: 28 },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tapZones: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, flexDirection: 'row' },
  tapZone: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  retry: { padding: 24 },
  placeholder: { fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center', alignSelf: 'center' },
  hint: { fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center', paddingTop: 12 },
  dates: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  dateButton: { minHeight: 44, minWidth: 72, justifyContent: 'center', alignItems: 'center' },
  disabled: { opacity: 0.35 },
});
