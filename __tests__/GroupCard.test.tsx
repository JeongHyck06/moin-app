import { cardSubtitle } from '../src/components/GroupCard';
import { MOCK_GROUPS } from '../src/mock';

test('상태별 카드 문구', () => {
  const [needsMe, waiting, complete, crisis] = MOCK_GROUPS;
  expect(cardSubtitle(needsMe)).toEqual({ text: '매일 · 오늘 3/4', accent: false });
  expect(cardSubtitle(waiting)).toEqual({ text: '내 인증 완료 · 2명 남음', accent: false });
  expect(cardSubtitle(complete)).toEqual({ text: '오늘 전원 완료', accent: true });
  expect(cardSubtitle(crisis, Date.parse(crisis.deadline) - 2 * 3600_000)).toEqual({
    text: '마감까지 2시간 · 나만 남음',
    accent: true,
  });
  expect(cardSubtitle({ ...needsMe, joinsNextPeriod: true })).toEqual({ text: '다음 기간부터 함께해요', accent: false });
});
