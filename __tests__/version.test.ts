import { compareVersions, isOutdated } from '../src/version';

test('버전 비교', () => {
  expect(compareVersions('1.2.3', '1.2.3')).toBe(0);
  expect(compareVersions('1.2.3', '1.10.0')).toBe(-1); // 문자열 비교면 틀리는 자리
  expect(compareVersions('2.0.0', '1.9.9')).toBe(1);
  expect(compareVersions('1.2', '1.2.0')).toBe(0);
  expect(compareVersions('1.2', '1.2.1')).toBe(-1);
  expect(isOutdated('0.0.1', '1.0.0')).toBe(true);
  expect(isOutdated('1.0.0', '1.0.0')).toBe(false);
});
