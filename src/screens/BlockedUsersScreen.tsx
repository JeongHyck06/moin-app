import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api';
import { notifySafetyChange } from '../safety';
import { colors, spacing } from '../theme';
import Header from '../components/Header';
import Button from '../components/Button';
export default function BlockedUsersScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<{ userId: number; nickname: string }[]>(
    [],
  );
  const [error, setError] = useState('');
  const load = useCallback(() => {
    api<typeof items>('GET', '/me/blocks')
      .then(setItems)
      .catch(e => setError(e.message));
  }, []);
  useFocusEffect(load);
  const unblock = async (id: number) => {
    try {
      await api('DELETE', `/me/blocks/${id}`);
      notifySafetyChange();
      load();
    } catch (e) {
      Alert.alert('차단 해제 실패', (e as Error).message);
    }
  };
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.canvas,
        paddingTop: insets.top,
      }}
    >
      <Header title="차단한 사용자" />
      <ScrollView contentContainerStyle={styles.content}>
        {items.map(item => (
          <View key={item.userId}>
            <Text style={{ color: colors.textPrimary }}>{item.nickname}</Text>
            <Button
              label="차단 해제"
              variant="secondary"
              onPress={() => unblock(item.userId)}
            />
          </View>
        ))}
        {!items.length && (
          <Text style={{ color: colors.textSecondary }}>
            차단한 사용자가 없어요
          </Text>
        )}
        {error !== '' && (
          <Text style={{ color: colors.textPrimary }}>{error}</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.canvas }, content: { padding: spacing.lg, gap: 16 } });
