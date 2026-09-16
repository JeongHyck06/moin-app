import { Switch } from 'react-native';
import ListRow from './ListRow';
import { colors } from '../theme';

type Props = { title: string; value: boolean; onChange: (v: boolean) => void; separator?: boolean };

// 설정 화면 토글 행, 라벨 탭으로도 바뀌게 onPress 연결 (Figma Toggle 34:396)
export default function ToggleRow({ title, value, onChange, separator }: Props) {
  return (
    <ListRow
      title={title}
      separator={separator}
      onPress={() => onChange(!value)}
      trailing={<Switch value={value} onValueChange={onChange} trackColor={{ true: colors.accent }} />}
    />
  );
}
