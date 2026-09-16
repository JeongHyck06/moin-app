import type { GroupCard, LoginResponse, MemberStatus } from './api';

const member = (userId: number, nickname: string, done: boolean): MemberStatus => ({
  userId,
  nickname,
  avatarUrl: null,
  done,
  doneCount: done ? 1 : 0,
  videoUrl: done ? '/videos/mock.mp4' : null,
});

const hours = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();

const base = {
  frequency: 'DAILY' as const,
  weeklyTarget: null,
  resetTime: '04:00',
  allowedAbsences: 1,
  activeCount: 4,
  myDoneCount: 0,
  joinsNextPeriod: false,
  periodStart: '2026-09-16',
  deadline: hours(10),
};

// Figma Home 43:43 의 카드 4장 (GroupCard 46:39 / 46:127 / 46:196 / 46:257)
export const MOCK_GROUPS: GroupCard[] = [
  {
    ...base,
    id: 1,
    name: '모닝 러닝',
    state: 'NEEDS_ME',
    streak: 12,
    completedCount: 3,
    myDone: false,
    members: [member(2, '민수', true), member(3, '지연', true), member(5, '준호', true), member(1, '나', false)],
  },
  {
    ...base,
    id: 2,
    name: '헬스 인증',
    state: 'WAITING_OTHERS',
    streak: 8,
    completedCount: 2,
    myDone: true,
    myDoneCount: 1,
    members: [member(1, '나', true), member(2, '민수', true), member(3, '지연', false), member(5, '준호', false)],
  },
  {
    ...base,
    id: 3,
    name: '독서 모임',
    state: 'COMPLETE',
    streak: 30,
    completedCount: 4,
    myDone: true,
    myDoneCount: 1,
    members: [member(1, '나', true), member(2, '민수', true), member(3, '지연', true), member(5, '준호', true)],
  },
  {
    ...base,
    id: 4,
    name: '주 3회 요가',
    frequency: 'WEEKLY',
    weeklyTarget: 3,
    state: 'CRISIS',
    streak: 5,
    completedCount: 3,
    myDone: false,
    deadline: hours(2),
    members: [member(2, '민수', true), member(3, '지연', true), member(5, '준호', true), member(1, '나', false)],
  },
];

export const MOCK: Record<string, unknown> = {
  'POST /auth/dev': { token: 'mock-token', userId: 1, nickname: '나', avatarUrl: null } satisfies LoginResponse,
  'GET /groups': MOCK_GROUPS,
};
