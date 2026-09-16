import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { login as kakaoLogin } from '@react-native-seoul/kakao-login';
import { api, setToken, type LoginResponse } from '../api';
import { KAKAO_APP_KEY } from '../config';
import Button from '../components/Button';
import StatusIcon from '../components/StatusIcon';
import { colors, radius, spacing } from '../theme';

// 키가 없으면 개발용 로그인, 닉네임은 고정 (PLAN.md)
const DEV_NICKNAME = '나';

// Figma Login 49:705
export default function LoginScreen({ onLogin }: { onLogin: (user: LoginResponse) => void }) {
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const kakaoReady = KAKAO_APP_KEY.length > 0;

  const login = async () => {
    setBusy(true);
    try {
      // 어느 쪽이든 응답은 LoginResponse 라 이후 흐름은 같음
      const user = kakaoReady
        ? await api<LoginResponse>('POST', '/auth/kakao', { accessToken: (await kakaoLogin()).accessToken })
        : await api<LoginResponse>('POST', '/auth/dev', { nickname: DEV_NICKNAME });
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
      <Button
        label={kakaoReady ? '카카오로 시작하기' : '개발용 로그인'}
        variant="kakao"
        onPress={login}
        disabled={busy}
        style={styles.cta}
      />
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
