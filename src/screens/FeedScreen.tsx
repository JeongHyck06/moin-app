import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Video from 'react-native-video';
import { api, videoUrl, type Feed, type FeedMember } from '../api';
import { addDays, koreanDate, toISODate } from '../date';
import type { RootStackParamList } from '../navigation';
import MemberAvatar from '../components/MemberAvatar';

const BG = '#17171A';
const SWIPE = 60; // 세로 스와이프로 인정할 최소 이동량

// Figma Feed (47:617) 스토리형, 좌우 페이징은 FlatList, 상하는 터치 시작·끝 y 차이로 판정
export default function FeedScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Feed'>) {
  const { groupId } = route.params;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const today = toISODate(new Date());
  const [date, setDate] = useState(route.params.date ?? today);
  const [feed, setFeed] = useState<Feed | null>(null);
  const [index, setIndex] = useState(0);
  const list = useRef<FlatList<FeedMember>>(null);
  const touchY = useRef(0);
  const activeIndex = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let alive = true;
    setFeed(null);
    setError(null);
    setIndex(0);
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
      onTouchStart={e => {
        touchY.current = e.nativeEvent.pageY;
      }}
      onTouchEnd={e => {
        const dy = e.nativeEvent.pageY - touchY.current;
        if (dy < -SWIPE) {
          setDate(d => addDays(d, -1)); // 위로 밀면 이전 날짜
        } else if (dy > SWIPE && date < today) {
          setDate(d => addDays(d, 1));
        }
      }}
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
      <FlatList
        ref={list}
        data={members}
        horizontal
        pagingEnabled
        extraData={index}
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
              <Video source={{ uri: videoUrl(item.videoUrl) }} style={StyleSheet.absoluteFill} resizeMode="cover" controls={false} repeat paused={i !== index} />
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
      <Text style={styles.hint}>왼쪽 탭 이전 · 오른쪽 탭 다음 · 상하 스와이프 날짜 이동</Text>
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
});
