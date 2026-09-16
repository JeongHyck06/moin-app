import { Pressable, StyleSheet, View } from 'react-native';
import type { GroupCard as GroupCardData } from '../api';
import { colors, radius, spacing } from '../theme';
import Button from './Button';
import ListRow from './ListRow';
import MemberAvatar from './MemberAvatar';
import StreakBadge from './StreakBadge';

type Props = { group: GroupCardData; onPress?: () => void; onCheckIn?: () => void };

const untilText = (deadline: string, now: number) => {
  const min = Math.max(0, Math.round((Date.parse(deadline) - now) / 60_000));
  return min >= 60 ? `${Math.round(min / 60)}시간` : `${min}분`;
};

// 서버는 숫자·상태만 주고 문구는 클라이언트가 조립 (BACKEND_DESIGN.md §1)
export function cardSubtitle(g: GroupCardData, now = Date.now()): { text: string; accent: boolean } {
  const remaining = g.activeCount - g.completedCount;
  const period = g.frequency === 'DAILY' ? '오늘' : '이번 주';
  if (g.joinsNextPeriod) {
    return { text: '다음 기간부터 함께해요', accent: false };
  }
  switch (g.state) {
    case 'CRISIS':
      return {
        text: `마감까지 ${untilText(g.deadline, now)} · ${remaining === 1 ? '나만 남음' : `${remaining}명 남음`}`,
        accent: true,
      };
    case 'COMPLETE':
      return { text: `${period} 전원 완료`, accent: true };
    case 'WAITING_OTHERS':
      return { text: `내 인증 완료 · ${remaining}명 남음`, accent: false };
    default:
      return {
        text: `${g.frequency === 'DAILY' ? '매일' : `주 ${g.weeklyTarget}회`} · ${period} ${g.completedCount}/${g.activeCount}`,
        accent: false,
      };
  }
}

// 4상태: NeedsMe(CTA) / WaitingOthers(차분) / Complete(축하) / Crisis(액센트 테두리) (Figma GroupCard 44:206)
export default function GroupCard({ group, onPress, onCheckIn }: Props) {
  const { text, accent } = cardSubtitle(group);
  // NEEDS_ME/CRISIS 는 곧 myDone=false, 다음 기간부터 참여하는 멤버는 인증 요청이 409 라 CTA 숨김
  const showCta = !group.myDone && !group.joinsNextPeriod;
  return (
    <Pressable onPress={onPress} style={[styles.card, group.state === 'CRISIS' && styles.crisis]}>
      <ListRow title={group.name} subtitle={text} subtitleColor={accent ? colors.accent : undefined} tall separator />
      <View style={styles.meta}>
        <View style={styles.members}>
          {group.members.map((m, i) => (
            <MemberAvatar key={m.userId} done={m.done} style={i > 0 && styles.overlap} />
          ))}
        </View>
        <StreakBadge days={group.streak} />
      </View>
      {showCta && (
        <View style={styles.action}>
          <Button label="인증하기" onPress={onCheckIn} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, overflow: 'hidden' },
  crisis: { borderWidth: 2, borderColor: colors.accent },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  members: { flexDirection: 'row' },
  overlap: { marginLeft: -8 },
  action: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
});
