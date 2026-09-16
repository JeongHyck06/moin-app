import { addDays, addMonths, koreanDate, monthCells } from '../src/date';

test('달력 셀 상태 매핑', () => {
  const cells = monthCells('2026-09', [
    { start: '2026-09-01', end: '2026-09-02', status: 'PERFECT' },
    { start: '2026-09-14', end: '2026-09-21', status: 'PASS' }, // WEEKLY 7일 구간
  ]);
  expect(cells.slice(0, 2)).toEqual([null, null]); // 2026-09-01 은 화요일
  expect(cells[2]).toEqual({ day: 1, iso: '2026-09-01', status: 'PERFECT' });
  expect(cells[3]?.status).toBeUndefined();
  expect(cells.filter(c => c?.status === 'PASS').map(c => c?.day)).toEqual([14, 15, 16, 17, 18, 19, 20]);
  expect(cells.length).toBe(32);
});

test('날짜 계산', () => {
  expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
  expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  expect(addMonths('2026-01', -1)).toBe('2025-12');
  expect(koreanDate('2026-09-06')).toBe('9월 6일');
});
