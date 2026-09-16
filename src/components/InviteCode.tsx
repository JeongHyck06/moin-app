import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

const LENGTH = 6;

type Props = { code: string; editable?: boolean; onPress?: () => void };

// 초대코드 6칸 (Figma 58:1039), editable 이면 다음 입력 칸에 액센트 테두리
export default function InviteCode({ code, editable, onPress }: Props) {
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      {Array.from({ length: LENGTH }, (_, i) => (
        <View key={i} style={[styles.box, editable && i === code.length && styles.active]}>
          <Text style={styles.char}>{code[i] ?? ''}</Text>
        </View>
      ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  box: {
    width: 52,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.fillSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: { borderWidth: 2, borderColor: colors.accent },
  char: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
});
