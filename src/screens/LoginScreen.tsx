import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, setToken, type LoginResponse } from '../api';
import Button from '../components/Button';
import StatusIcon from '../components/StatusIcon';
import { colors, radius, spacing } from '../theme';

// 카카오 앱 키 확보 전까지 POST /auth/dev 로 대체 (PLAN.md)
const DEV_NICKNAME = '나';

// Figma Login 49:705
export default function LoginScreen({ onLogin }: { onLogin: (user: LoginResponse) => void }) {
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);

  const login = async () => {
    setBusy(true);
    try {
      const user = await api<LoginResponse>('POST', '/auth/dev', { nickname: DEV_NICKNAME });
      setToken(user.token);
      onLogin(user);
    } catch (e) {
      Alert.alert('로그인 실패', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 34) }]}>
      <View style={styles.body}>
        <Text style={styles.logo}>모인</Text>
        <View style={styles.grid}>
          {['민수', '지연', '준호'].map(name => (
            <View key={name} style={styles.tile}>
              <View style={styles.tileIcon}>
                <StatusIcon status="PERFECT" size={20} />
              </View>
              <Text style={styles.tileName}>{name}</Text>
            </View>
          ))}
          <View style={[styles.tile, styles.tileMe]}>
            <Text style={styles.me}>나</Text>
          </View>
        </View>
        <Text style={styles.headline}>혼자 하면 삼일,{'\n'}같이 하면 삼백일</Text>
        <Text style={styles.sub}>3초 영상으로 인증하고, 같이 스트릭을 쌓아요</Text>
      </View>
      <Button label="카카오로 시작하기" variant="kakao" onPress={login} disabled={busy} style={styles.cta} />
    </View>
  );
}

const TILE = 130;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28, paddingHorizontal: spacing.lg },
  logo: { fontSize: 22, fontWeight: '900', color: colors.accent },
  grid: { width: TILE * 2 + 10, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: TILE, height: TILE, borderRadius: radius.lg, backgroundColor: colors.surface },
  tileIcon: { position: 'absolute', top: 10, right: 10 },
  tileName: { position: 'absolute', left: 12, bottom: 12, fontSize: 12, color: colors.textSecondary },
  tileMe: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.separator,
    alignItems: 'center',
    justifyContent: 'center',
  },
  me: { fontSize: 15, fontWeight: '500', color: colors.textSecondary },
  headline: { fontSize: 28, fontWeight: '900', color: colors.textPrimary, textAlign: 'center' },
  sub: { fontSize: 15, color: colors.textSecondary, textAlign: 'center' },
  cta: { marginHorizontal: spacing.lg },
});
