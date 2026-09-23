import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import GroupCalendar from '../components/GroupCalendar';
import { colors, spacing } from '../theme';

export default function CalendarScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Calendar'>) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 34) }]}>
      <GroupCalendar groupId={route.params.groupId} onDatePress={date => navigation.navigate('Feed', { groupId: route.params.groupId, date })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: spacing.lg },
});
