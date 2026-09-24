import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Video, { ViewType } from 'react-native-video';
import { videoUrl } from '../api';
import { colors } from '../theme';
import { useSeenCheckIns } from '../SeenCheckInsProvider';
import SwipeUpArea from './SwipeUpArea';
import { useReducedMotion } from '../useReducedMotion';

export type StoryItem = { userId: number; checkInId: number | null; path: string | null; frozen?: boolean };
type Props = { items: StoryItem[]; index: number; onIndexChange: (index: number) => void; paused: boolean; commentsOpen: boolean; onComments: () => void };

// 첫 프레임이 준비된 현재 페이지만 읽음 처리, 옆 페이지 미리 로딩은 제외
function StoryVideo({ item, active, paused }: { item: StoryItem; active: boolean; paused: boolean }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { markSeen } = useSeenCheckIns();
  useEffect(() => { if (active && ready && !failed) markSeen(item.checkInId); }, [active, ready, failed, item.checkInId, markSeen]);
  if (!item.path) return <Text style={styles.message}>{item.frozen ? '프리즈로 인증 완료' : '아직 인증 전이에요'}</Text>;
  if (failed) return (
    <Pressable accessibilityRole="button" style={styles.retry} onPress={() => { setFailed(false); setReady(false); setAttempt(n => n + 1); }}>
      <Text style={styles.message}>영상을 불러오지 못했어요 · 다시 시도</Text>
    </Pressable>
  );
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Video
        key={attempt}
        source={{ uri: videoUrl(item.path) }}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
        // Android에서도 영상 표면이 페이지 이동을 따라가도록 TextureView 사용
        viewType={ViewType.TEXTURE}
        controls={false}
        repeat
        paused={!active || paused}
        playInBackground={false}
        playWhenInactive={false}
        onReadyForDisplay={() => setReady(true)}
        onError={() => setFailed(true)}
      />
      {!ready && <ActivityIndicator style={StyleSheet.absoluteFill} color={colors.accent} accessibilityLabel="인증 영상 불러오는 중" />}
    </View>
  );
}

// 네이티브 가로 페이징으로 손가락 이동을 그대로 반영, 탭도 같은 슬라이드 전환 사용
export default function StoryPager({ items, index, onIndexChange, paused, commentsOpen, onComments }: Props) {
  const { width } = useWindowDimensions();
  const list = useRef<FlatList<StoryItem>>(null);
  const reduced = useReducedMotion();
  const scrollX = useRef(new Animated.Value(index * width)).current;
  const initialIndex = useRef(index).current;
  const moving = useRef(false);
  const [dragging, setDragging] = useState(false);
  const previousWidth = useRef(width);
  useEffect(() => {
    if (previousWidth.current !== width) {
      previousWidth.current = width;
      list.current?.scrollToOffset({ offset: index * width, animated: false });
      scrollX.setValue(index * width);
      moving.current = false;
      setDragging(false);
    }
  }, [index, scrollX, width]);
  const settle = (offset: number) => {
    const next = Math.max(0, Math.min(items.length - 1, Math.round(offset / width)));
    moving.current = false;
    setDragging(false);
    onIndexChange(next);
  };
  const move = (direction: number) => {
    if (moving.current || commentsOpen) return;
    const next = Math.max(0, Math.min(items.length - 1, index + direction));
    if (next === index) return;
    moving.current = true;
    setDragging(true);
    list.current?.scrollToOffset({ offset: next * width, animated: !reduced });
    if (reduced) settle(next * width);
  };
  return (
    <SwipeUpArea enabled={!commentsOpen && !dragging && items[index]?.checkInId != null} onSwipeUp={onComments}>
      <Animated.FlatList
        ref={list}
        data={items}
        extraData={`${index}-${paused}-${commentsOpen}-${dragging}`}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        bounces={false}
        scrollEnabled={!commentsOpen}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        initialNumToRender={1}
        maxToRenderPerBatch={3}
        windowSize={3}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        keyExtractor={item => `${item.userId}-${item.checkInId ?? 'empty'}`}
        onScrollBeginDrag={() => { moving.current = true; setDragging(true); }}
        onScrollEndDrag={e => {
          const offset = e.nativeEvent.contentOffset.x;
          if (Math.abs(offset / width - Math.round(offset / width)) < 0.001) settle(offset);
        }}
        onMomentumScrollEnd={e => settle(e.nativeEvent.contentOffset.x)}
        renderItem={({ item, index: i }) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const motion = reduced ? undefined : {
            opacity: scrollX.interpolate({ inputRange, outputRange: [0.55, 1, 0.55], extrapolate: 'clamp' }),
            transform: [{ scale: scrollX.interpolate({ inputRange, outputRange: [0.96, 1, 0.96], extrapolate: 'clamp' }) }],
          };
          return (
            <Animated.View style={[styles.page, { width }, motion]}>
              <View style={styles.tapZones}>
                <Pressable style={styles.tapZone} accessibilityRole="button" accessibilityLabel="이전 인증" disabled={i === 0 || commentsOpen} onPress={() => move(-1)} />
                <Pressable style={styles.tapZone} accessibilityRole="button" accessibilityLabel="다음 인증" disabled={i === items.length - 1 || commentsOpen} onPress={() => move(1)} />
              </View>
              <StoryVideo item={item} active={i === index && !dragging} paused={paused || commentsOpen} />
            </Animated.View>
          );
        }}
      />
    </SwipeUpArea>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tapZones: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row' },
  tapZone: { flex: 1 },
  message: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
  retry: { padding: 20 },
});
