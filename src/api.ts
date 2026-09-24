import { Platform } from 'react-native';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  frozen?: boolean;
  checkInId: number | null;
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
  isOwner: boolean; // 이름 변경은 방장만
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

export type CheckInResult = {
  id: number;
  videoUrl: string;
  logicalDate: string;
  allComplete: boolean;
  streak: StreakSummary; // 마감 전 값, "오늘 하면 N일" 은 current + 1
  group: GroupCard;
};

export type FeedMember = {
  userId: number;
  nickname: string;
  avatarUrl: string | null;
  checkInId: number | null; // 영상 없으면 세 필드 모두 null
  videoUrl: string | null;
  createdAt: string | null;
  frozen?: boolean;
};

export type Feed = { date: string; completedCount: number; activeCount: number; members: FeedMember[] };

export type CheckInComment = { id: number; userId: number; nickname: string; avatarUrl: string | null; body: string; createdAt: string };
export type CommentPage = { items: CheckInComment[]; nextCursor: number | null };

export type Period = { start: string; end: string; status: PeriodStatus }; // end 는 배타

export type Calendar = {
  month: string;
  today: string;
  periods: Period[];
  totalCheckIns: number;
  longestStreak: number;
  perfectRate: number;
};

export type Profile = {
  id: number;
  nickname: string;
  avatarUrl: string | null;
  totalStreak: number; // 내 그룹들의 현재 스트릭 합
  totalCheckIns: number;
};

export type MyGroup = { id: number; name: string; streak: number; achievementRate: number };

export type NotificationKinds = {
  reminder: boolean;
  social: boolean;
  crisis: boolean;
  lastCall: boolean;
  allComplete: boolean;
};

export type NotificationView = { kinds: NotificationKinds; groups: { id: number; name: string; muted: boolean }[] };

export type AppVersion = {
  minVersion: string; // 이 미만이면 강제 업데이트
  latestVersion: string;
  iosStoreUrl: string;
  androidStoreUrl: string;
};

// 주소는 .env.local (운영 빌드는 .env.prod) 의 API_BASE_URL 에서 온다
// Android 에뮬레이터에서 localhost 는 에뮬레이터 자신이라 호스트 PC 주소인 10.0.2.2 로 바꿔야 한다
export const BASE_URL =
  Platform.OS === 'android'
    ? (Config.API_BASE_URL ?? '').replace(/\/$/, '').replace('://localhost', '://10.0.2.2')
    : (Config.API_BASE_URL ?? '').replace(/\/$/, '');
export const USE_MOCK = false; // 홈 카드 4상태를 mock 으로 보려면 true

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// 서버는 message 를 항상 주지만 네트워크 계층 오류 등 본문이 없을 때를 위한 상태코드별 대체 문구
const FALLBACK: Record<number, string> = {
  400: '입력값을 확인해 주세요',
  401: '다시 로그인해 주세요',
  403: '이 그룹의 멤버가 아니에요',
  404: '찾을 수 없어요',
  409: '이미 처리된 요청이에요',
  415: '지원하지 않는 파일이에요',
};

const TOKEN_KEY = 'moin.token';

let token: string | null = null;
const listeners = new Set<(t: string | null) => void>();

// 세션이 끊기면 App 이 로그인 화면으로 되돌려야 해서 구독을 둠
export function onTokenChange(fn: (t: string | null) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function setToken(t: string | null) {
  token = t;
  // 저장 실패는 이번 실행에 영향이 없음, 다음 로그인 때 다시 시도
  (t === null ? AsyncStorage.removeItem(TOKEN_KEY) : AsyncStorage.setItem(TOKEN_KEY, t)).catch(() => {});
  listeners.forEach(fn => fn(t));
}

// 로그아웃은 저장소 삭제를 마친 뒤 화면 전환, 재실행 시 이전 세션 복원 방지
export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  token = null;
  listeners.forEach(fn => fn(null));
}

// 앱 시작 시 한 번, 저장된 세션을 메모리로 올림
export async function loadToken(): Promise<string | null> {
  token = await AsyncStorage.getItem(TOKEN_KEY).catch(() => null);
  return token;
}

async function request<T>(method: string, path: string, headers: Record<string, string>, body?: RequestInit['body']): Promise<T> {
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
    headers: { ...headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body,
  });
  if (!res.ok) {
    // 만료된 세션은 화면마다 처리할 수 없으니 여기서 한 번에 로그아웃
    if (res.status === 401 && token !== null) {
      setToken(null);
    }
    const err = await res.json().catch(() => null);
    throw new ApiError(err?.message ?? FALLBACK[res.status] ?? `HTTP ${res.status}`, res.status);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export function api<T>(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, body?: unknown): Promise<T> {
  return request<T>(method, path, { 'Content-Type': 'application/json' }, body === undefined ? undefined : JSON.stringify(body));
}

// multipart 는 fetch 가 boundary 를 붙이도록 Content-Type 을 지정하지 않음
export function upload<T>(path: string, form: FormData): Promise<T> {
  return request<T>('POST', path, {}, form);
}

// "/videos/x.mp4" 상대 경로를 재생 가능한 절대 URL 로, 토큰 불필요
export const videoUrl = (path: string) => BASE_URL + path;

// 소셜 제공자의 절대 URL과 직접 업로드한 서버 상대 경로를 함께 지원
export const avatarUrl = (path: string) => path.startsWith('/') ? BASE_URL + path : path;

// 보유 수량은 서버 원장 기준, 월 무료분은 모임별이며 구매·광고분은 계정 공용
export type FreezeInventory = { enabled: boolean; monthlyRemaining: number; balance: number; available: number; today: string; earliestDate: string; checkedDates: string[]; frozenDates: string[] };
export type FreezeWallet = { balance: number; adAvailable: boolean; nextAdDate: string; productId: string; products: { productId: string; quantity: number }[]; accountToken: string; appleReady: boolean; googleReady: boolean; androidAdUnit: string; iosAdUnit: string };
