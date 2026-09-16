import type { Period, PeriodStatus } from './api';

const pad = (n: number) => String(n).padStart(2, '0');

// 서버 날짜는 "2026-09-16", 월은 "2026-09", 전부 로컬(Asia/Seoul) 기준 문자열로만 다룸
export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const toISOMonth = (d: Date) => toISODate(d).slice(0, 7);

export const addDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  return toISODate(new Date(y, m - 1, d + n));
};

export const addMonths = (month: string, n: number) => {
  const [y, m] = month.split('-').map(Number);
  return toISOMonth(new Date(y, m - 1 + n, 1));
};

export const koreanDate = (iso: string) => `${Number(iso.slice(5, 7))}월 ${Number(iso.slice(8, 10))}일`;
export const koreanMonth = (month: string) => `${month.slice(0, 4)}년 ${Number(month.slice(5, 7))}월`;

export type Cell = { day: number; iso: string; status?: PeriodStatus };

// 달력 셀 목록, 1일 앞은 요일 맞춤용 null, WEEKLY 는 7일 구간 하나로 오므로 구간 안 날짜를 전부 같은 상태로
export function monthCells(month: string, periods: Period[]): (Cell | null)[] {
  const [y, m] = month.split('-').map(Number);
  const byDate: Record<string, PeriodStatus> = {};
  for (const p of periods) {
    for (let d = p.start; d < p.end; d = addDays(d, 1)) {
      byDate[d] = p.status;
    }
  }
  const days = new Date(y, m, 0).getDate();
  const lead: null[] = Array(new Date(y, m - 1, 1).getDay()).fill(null);
  const cells = Array.from({ length: days }, (_, i) => {
    const iso = `${month}-${pad(i + 1)}`;
    return { day: i + 1, iso, status: byDate[iso] };
  });
  return [...lead, ...cells];
}
