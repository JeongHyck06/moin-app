import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, loadToken, onTokenChange, setToken } from '../src/api';

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

// BASE_URL 은 env 에서 오고, Android 에뮬레이터에서만 호스트를 10.0.2.2 로 바꾼다
test('BASE_URL 플랫폼 분기', () => {
  expect(BASE_URL).toBe('http://localhost:8080');

  jest.isolateModules(() => {
    require('react-native').Platform.OS = 'android';
    expect(require('../src/api').BASE_URL).toBe('http://10.0.2.2:8080');
  });
});
