import { formatTime, minuteBefore, parseTime } from '../src/components/TimeSheet';

test('시각 문자열 변환', () => {
  expect(parseTime('04:05')).toEqual({ h: 4, m: 5 });
  expect(formatTime(4, 0)).toBe('04:00');
  expect(minuteBefore('04:00')).toBe('03:59');
  expect(minuteBefore('00:00')).toBe('23:59');
});
