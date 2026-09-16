import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import WizardStep from '../components/WizardStep';
import { colors } from '../theme';

const MAX = 20; // 서버 @Size(max=20)

// Figma Create Group 1 (50:724)
export default function CreateGroup1Screen({ navigation }: NativeStackScreenProps<RootStackParamList, 'CreateGroup1'>) {
  const [name, setName] = useState('');
  const trimmed = name.trim();
  return (
    <WizardStep
      step={1}
      title="그룹 이름을 정해주세요"
      cta={{ label: '다음', disabled: trimmed.length === 0, onPress: () => navigation.navigate('CreateGroup2', { name: trimmed }) }}
    >
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="예: 모닝 러닝"
        placeholderTextColor={colors.textTertiary}
        maxLength={MAX}
        autoFocus
        returnKeyType="done"
        style={styles.input}
      />
      <Text style={styles.help}>최대 {MAX}자 · 나중에 바꿀 수 있어요</Text>
    </WizardStep>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 17,
    lineHeight: 20,
    color: colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  help: { fontSize: 13, color: colors.textTertiary },
});
