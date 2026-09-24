import { useState } from 'react';
import { Alert, Switch, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api, type GroupDetail } from '../api';
import type { RootStackParamList } from '../navigation';
import ListRow from '../components/ListRow';
import Stepper from '../components/Stepper';
import WizardStep from '../components/WizardStep';
import { card, colors } from '../theme';

// Figma Create Group 4 (50:769), 결석 허용 인원은 디자인에 컨트롤이 없어 주당 횟수와 같은 스테퍼로
export default function CreateGroup4Screen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'CreateGroup4'>) {
  const [allowedAbsences, setAllowedAbsences] = useState(1);
  const [streakFreeze, setStreakFreeze] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const group = await api<GroupDetail>('POST', '/groups', { ...route.params, allowedAbsences, streakFreeze });
      // 뒤로 가기로 4단계에 돌아와 그룹이 또 만들어지지 않도록 스택을 Main 위에 5단계만 남김
      navigation.reset({ index: 1, routes: [{ name: 'Main' }, { name: 'CreateGroup5', params: { group } }] });
    } catch (e) {
      Alert.alert('그룹 만들기 실패', (e as Error).message);
      setBusy(false);
    }
  };

  return (
    <WizardStep
      step={4}
      title="난이도를 정해주세요"
      subtitle="기본값으로 넘어가도 괜찮아요"
      hint={allowedAbsences === 0 ? '전원이 인증해야 완료돼요' : `멤버 ${allowedAbsences}명까지 빠져도 완료돼요`}
      note="프리즈: 멤버마다 월 1개 무료, 원하는 날짜의 본인 인증 1회를 채워요"
      cta={{ label: '다음', disabled: busy, onPress: submit }}
    >
      <View style={card}>
        <ListRow
          title="결석 허용 인원"
          tall
          separator
          detail={`${allowedAbsences}명`}
          detailColor={colors.accent}
          trailing={<Stepper value={allowedAbsences} min={0} max={10} onChange={setAllowedAbsences} />}
        />
        <ListRow
          title="스트릭 프리즈"
          tall
          trailing={<Switch value={streakFreeze} onValueChange={setStreakFreeze} trackColor={{ true: colors.accent }} />}
        />
      </View>
    </WizardStep>
  );
}
