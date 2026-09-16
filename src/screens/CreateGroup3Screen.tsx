import { useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import ListRow from '../components/ListRow';
import TimeSheet, { minuteBefore } from '../components/TimeSheet';
import WizardStep from '../components/WizardStep';
import { card, colors } from '../theme';

type Field = 'reset' | 'reminder';

// Figma Create Group 3 (56:1004), 시각 피커 시트 (61:1099)
export default function CreateGroup3Screen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'CreateGroup3'>) {
  const [resetTime, setResetTime] = useState('04:00');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [editing, setEditing] = useState<Field | null>(null);
  return (
    <WizardStep
      step={3}
      title="하루 리셋 시각을 정해주세요"
      subtitle="이 시각에 새 하루가 시작돼요"
      hint={`${minuteBefore(resetTime)} 인증도 전날 인증으로 인정돼요`}
      note="리마인더는 아직 인증하지 않은 멤버에게만 보내요"
      cta={{ label: '다음', onPress: () => navigation.navigate('CreateGroup4', { ...route.params, resetTime, reminderTime }) }}
    >
      <View style={card}>
        <ListRow title="리셋 시각" tall separator detail={resetTime} detailColor={colors.accent} onPress={() => setEditing('reset')} />
        <ListRow title="리마인더 알림" tall detail={reminderTime} detailColor={colors.accent} onPress={() => setEditing('reminder')} />
      </View>
      {/* 열 때마다 새로 마운트해 휠 초기 위치를 현재 값으로 */}
      {editing !== null && (
        <TimeSheet
          visible
          title={editing === 'reset' ? '리셋 시각' : '리마인더 알림'}
          subtitle={editing === 'reset' ? '이 시각 전 인증은 전날 인증으로 인정돼요' : '아직 인증하지 않은 멤버에게 보내요'}
          value={editing === 'reset' ? resetTime : reminderTime}
          onDone={v => {
            (editing === 'reset' ? setResetTime : setReminderTime)(v);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </WizardStep>
  );
}
