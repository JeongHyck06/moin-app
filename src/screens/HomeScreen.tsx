import { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { api, type GroupCard as GroupCardData } from '../api';
import GroupCard from '../components/GroupCard';
import Header from '../components/Header';
import ListRow from '../components/ListRow';
import { TAB_BAR_HEIGHT } from '../components/TabBar';
import { card, colors, spacing } from '../theme';

// Figma Home 43:43
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [groups, setGroups] = useState<GroupCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setGroups(await api<GroupCardData[]>('GET', '/groups'));
    } catch (e) {
      Alert.alert('불러오기 실패', (e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 그룹 만들기·참여에서 돌아올 때마다 새로 조회
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const remaining = groups.filter(g => !g.myDone && !g.joinsNextPeriod).length;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="모인" subtitle={`오늘 남은 인증 ${remaining}개`} />
      <FlatList
        data={groups}
        keyExtractor={g => String(g.id)}
        contentContainerStyle={[styles.list, { paddingBottom: TAB_BAR_HEIGHT + Math.max(insets.bottom, 16) }]}
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            onPress={() => navigation.navigate('GroupDetail', { id: item.id })}
            onCheckIn={() => navigation.navigate('Camera', { groupId: item.id, name: item.name })}
          />
        )}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.accent} />}
        ListEmptyComponent={loading ? undefined : <Text style={styles.empty}>아직 그룹이 없어요</Text>}
        ListFooterComponent={
          // 디자인에 진입점이 없어 그룹형 리스트 문법으로 붙임
          <View style={card}>
            <ListRow title="그룹 만들기" chevron separator onPress={() => navigation.navigate('CreateGroup1')} />
            <ListRow title="초대코드로 참여" chevron onPress={() => navigation.navigate('JoinGroup')} />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  // 하단 여백은 탭바가 absolute 라 렌더에서 safe area 를 더해 계산
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  empty: { textAlign: 'center', color: colors.textSecondary, paddingVertical: 40 },
});
