import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSeenCheckInsStore } from '../src/seenCheckIns';

test('읽음 상태는 인증 ID와 계정별로 저장하고 로딩 중 시청도 보존', async () => {
  await AsyncStorage.setItem('moin.seen-check-ins.21', '[101]');
  const first = createSeenCheckInsStore(21);
  const loading = first.load();
  first.markSeen(102);
  await loading;
  await first.flush();
  expect([...first.getSnapshot().ids]).toEqual([101, 102]);
  first.markSeen(102);
  first.markSeen(null);
  first.markSeen(-1);
  expect(first.getSnapshot().ids.size).toBe(2);
  expect(first.getSnapshot().ids.has(103)).toBe(false); // 같은 작성자의 새 인증은 미확인
  const restored = createSeenCheckInsStore(21);
  await restored.load();
  expect(restored.getSnapshot().ids.has(102)).toBe(true);
  const other = createSeenCheckInsStore(22);
  await other.load();
  expect(other.getSnapshot().ids.size).toBe(0);
  await AsyncStorage.setItem('moin.seen-check-ins.23', 'broken');
  const broken = createSeenCheckInsStore(23);
  await broken.load();
  expect(broken.getSnapshot().ready).toBe(true);
  expect(broken.getSnapshot().ids.size).toBe(0);
});
