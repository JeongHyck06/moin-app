import { Share, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { frequencyText } from '../components/GroupCard';
import InviteCode from '../components/InviteCode';
import ListRow from '../components/ListRow';
import WizardStep from '../components/WizardStep';
import { card } from '../theme';

// Figma Create Group 5 (56:1042), 공유는 OS 공유 시트
export default function CreateGroup5Screen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'CreateGroup5'>) {
  const { group } = route.params;
  const { card: g } = group;
  const share = () => {
    Share.share({ message: `모인 "${g.name}" 초대코드: ${group.inviteCode}` });
  };
  return (
    <WizardStep
      step={5}
      title="멤버를 초대하세요"
      subtitle="초대코드를 공유하면 바로 참여할 수 있어요"
      hint="멤버가 참여하면 바로 함께 기록할 수 있어요"
      note="초대코드는 그룹 오른쪽 위 옵션에서 다시 볼 수 있어요"
      cta={{ label: '초대코드 공유하기', onPress: share }}
      secondary={{ label: '나중에 초대하기', onPress: () => navigation.popToTop() }}
    >
      <InviteCode code={group.inviteCode} />
      <View style={card}>
        <ListRow title="그룹 이름" tall separator detail={g.name} />
        <ListRow title="인증 주기" tall separator detail={frequencyText(g.frequency, g.weeklyTarget)} />
        <ListRow title="리셋 시각" tall separator detail={g.resetTime} />
        <ListRow title="결석 허용 인원" tall separator detail={`${g.allowedAbsences}명`} />
        <ListRow title="스트릭 프리즈" tall detail={group.streakFreeze ? '켬' : '끔'} />
      </View>
    </WizardStep>
  );
}
