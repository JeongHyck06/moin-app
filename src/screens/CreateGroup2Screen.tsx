import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Frequency } from '../api';
import type { RootStackParamList } from '../navigation';
import ListRow from '../components/ListRow';
import Stepper from '../components/Stepper';
import WizardStep from '../components/WizardStep';
import { card, colors } from '../theme';

const Check = () => <Image source={require('../assets/check-circle.png')} style={styles.check} />;

// Figma Create Group 2 (56:966) 와 주 N회 선택 변형 (61:1041)
export default function CreateGroup2Screen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'CreateGroup2'>) {
  const [frequency, setFrequency] = useState<Frequency>('DAILY');
  const [weekly, setWeekly] = useState(3);
  const isWeekly = frequency === 'WEEKLY';
  return (
    <WizardStep
      step={2}
      title="얼마나 자주 인증할까요?"
      subtitle="매일이 기본이에요 · 만든 뒤에는 바꿀 수 없어요"
      hint={isWeekly ? `일주일에 ${weekly}번 인증하면 그 주가 완료돼요` : '매일 그룹은 하루 1번 인증하면 완료돼요'}
      note={isWeekly ? '하루 최대 1번 · 주는 월요일 04:00에 시작해요' : '주 N회: 일주일 안에 N번 인증하면 그 주가 완료돼요'}
      cta={{
        label: '다음',
        onPress: () =>
          navigation.navigate('CreateGroup3', { name: route.params.name, frequency, weeklyTarget: isWeekly ? weekly : undefined }),
      }}
    >
      <View style={card}>
        <ListRow title="매일" tall separator trailing={!isWeekly && <Check />} onPress={() => setFrequency('DAILY')} />
        <ListRow
          title="주 N회"
          tall
          separator={isWeekly}
          detail={isWeekly ? undefined : `${weekly}회`}
          trailing={isWeekly && <Check />}
          onPress={() => setFrequency('WEEKLY')}
        />
        {isWeekly && (
          <ListRow
            title="주당 횟수"
            tall
            detail={`${weekly}회`}
            detailColor={colors.accent}
            trailing={<Stepper value={weekly} min={1} max={7} onChange={setWeekly} />}
          />
        )}
      </View>
    </WizardStep>
  );
}

const styles = StyleSheet.create({
  check: { width: 24, height: 24, tintColor: colors.accent },
});
