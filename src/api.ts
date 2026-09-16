import { Platform } from 'react-native';
import { MOCK } from './mock';

// BACKEND_DESIGN.md §4 응답 형태
export type Frequency = 'DAILY' | 'WEEKLY';
export type GroupState = 'NEEDS_ME' | 'WAITING_OTHERS' | 'COMPLETE' | 'CRISIS';
export type PeriodStatus = 'PERFECT' | 'PASS' | 'FROZEN' | 'FAILED';

export type LoginResponse = {
  token: string;
  userId: number;
  nickname: string;
  avatarUrl: string | null;
};

export type MemberStatus = {
  userId: number;
  nickname: string;
  avatarUrl: string | null;
  done: boolean;
  doneCount: number;
  videoUrl: string | null;
};

export type GroupCard = {
  id: number;
  name: string;
  frequency: Frequency;
  weeklyTarget: number | null;
  resetTime: string;
  state: GroupState;
  streak: number;
  activeCount: number;
  completedCount: number;
  allowedAbsences: number;
  myDone: boolean;
  myDoneCount: number;
  joinsNextPeriod: boolean;
  periodStart: string;
  deadline: string;
  members: MemberStatus[];
};

export const BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
export const USE_MOCK = true; // 백엔드 붙으면 false

// ponytail: 세션 토큰은 메모리에만 보관, 앱 재시작 후에도 유지하려면 AsyncStorage 추가
let token: string | null = null;
export const setToken = (t: string | null) => {
  token = t;
};

export async function api<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH',
  path: string,
  body?: unknown,
): Promise<T> {
  // 화면 코드가 mock 여부로 분기하지 않도록 여기서만 전환, 키는 "METHOD path"
  if (USE_MOCK) {
    const hit = MOCK[`${method} ${path}`];
    if (hit === undefined) {
      throw new Error(`mock 없음: ${method} ${path}`);
    }
    return hit as T;
  }
  const res = await fetch(BASE_URL + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    // ResponseStatusException 은 message 에, @Valid 실패는 error 에만 문구가 실림
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? err?.error ?? `HTTP ${res.status}`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}
