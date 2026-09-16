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

export type CreateGroupRequest = {
  name: string;
  frequency: Frequency;
  weeklyTarget?: number;
  resetTime?: string;
  reminderTime?: string;
  allowedAbsences?: number;
  streakFreeze?: boolean;
};

export type StreakSummary = { current: number; perfect: number; pass: number; frozen: number; longest: number };

export type GroupDetail = {
  card: GroupCard;
  inviteCode: string;
  reminderTime: string;
  streakFreeze: boolean;
  muted: boolean;
  streak: StreakSummary;
  threshold: number;
  periodVideoCount: number;
  monthCompletedPeriods: number;
  monthClosedPeriods: number;
};

export type InvitePreview = {
  id: number;
  name: string;
  frequency: Frequency;
  weeklyTarget: number | null;
  resetTime: string;
  memberCount: number;
  streak: number;
  members: MemberStatus[];
  alreadyMember: boolean;
  joinsFrom: string;
};

export const BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
export const USE_MOCK = false; // 홈 카드 4상태를 mock 으로 보려면 true

// ponytail: 세션 토큰은 메모리에만 보관, 앱 재시작 후에도 유지하려면 AsyncStorage 추가
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// 서버 기본 오류 응답(@Valid 실패, 404, 409)에는 message 가 없어 상태코드별 한국어 대체 문구를 둠
const FALLBACK: Record<number, string> = {
  400: '입력값을 확인해 주세요',
  401: '다시 로그인해 주세요',
  403: '이 그룹의 멤버가 아니에요',
  404: '찾을 수 없어요',
  409: '이미 처리된 요청이에요',
  415: '지원하지 않는 파일이에요',
};

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
    const err = await res.json().catch(() => null);
    throw new ApiError(err?.message ?? FALLBACK[res.status] ?? `HTTP ${res.status}`, res.status);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}
