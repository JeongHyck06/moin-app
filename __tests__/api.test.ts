import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadToken, onTokenChange, setToken } from '../src/api';

test('토큰 저장과 복원', async () => {
  const seen: (string | null)[] = [];
  const off = onTokenChange(t => seen.push(t));

  setToken('abc');
  expect(await AsyncStorage.getItem('moin.token')).toBe('abc');
  expect(await loadToken()).toBe('abc');

  setToken(null);
  expect(await AsyncStorage.getItem('moin.token')).toBeNull();
  expect(await loadToken()).toBeNull();

  off();
  setToken('after-unsubscribe');
  expect(seen).toEqual(['abc', null]);
});
