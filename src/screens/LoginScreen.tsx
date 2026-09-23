import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppleButton } from '@invertase/react-native-apple-authentication';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { login as kakaoLogin } from '@react-native-seoul/kakao-login';
import { api, setToken, type LoginResponse } from '../api';
import { DEV_LOGIN_ENABLED, KAKAO_APP_KEY } from '../config';
import { appleLoginSupported, loginWithApple, loginWithGoogle } from '../socialLogin';
import Button from '../components/Button';
import StatusIcon from '../components/StatusIcon';
import { colors, radius, spacing } from '../theme';

// 키 없는 개발 빌드에서만 사용, 운영 서버는 /auth/dev 를 차단
const DEV_NICKNAME = '나';

// Figma Login 49:705
export default function LoginScreen({ onLogin }: { onLogin: (user: LoginResponse) => void }) {
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const kakaoReady = KAKAO_APP_KEY.length > 0;

  const socialLogin = async (provider: 'google' | 'apple') => {
    if (busy) return;
    setBusy(true);
    try {
      const user = await (provider === 'google' ? loginWithGoogle() : loginWithApple());
      if (user) {
        setToken(user.token);
        onLogin(user);
      }
    } catch (e) {
      Alert.alert('로그인 실패', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const login = async () => {
    if (!kakaoReady && !DEV_LOGIN_ENABLED) {
      Alert.alert('로그인 불가', '지금은 로그인할 수 없어요. 잠시 후 다시 시도해 주세요.');
      return;
    }
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
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.brand}>
          <Image source={require('../assets/moin-logo.png')} style={styles.logoImage} accessibilityLabel="모인 로고" />
          <Text style={styles.logo}>모인</Text>
        </View>
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
      </ScrollView>
      <View style={styles.actions}>
      <Button
        label={DEV_LOGIN_ENABLED ? '개발용 로그인' : '카카오로 시작하기'}
        variant="kakao"
        onPress={login}
        disabled={busy || (!kakaoReady && !DEV_LOGIN_ENABLED)}
      />
      <View style={styles.googleButton}>
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Light}
          style={styles.providerButton}
          disabled={busy}
          onPress={() => socialLogin('google')}
        />
      </View>
      {appleLoginSupported && (
        <AppleButton
          buttonStyle={AppleButton.Style.WHITE}
          buttonType={AppleButton.Type.SIGN_IN}
          cornerRadius={24}
          style={styles.providerButton}
          onPress={() => socialLogin('apple')}
        />
      )}
      </View>
    </View>
  );
}

const TILE = 130;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  body: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: spacing.lg, paddingVertical: 20 },
  logo: { fontSize: 22, fontWeight: '900', color: colors.accent },
  brand: { alignItems: 'center', gap: 8 },
  logoImage: { width: 72, height: 72, borderRadius: 16 },
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
  actions: { marginHorizontal: spacing.lg, gap: 10, paddingTop: 12 },
  // 네이티브 Google 버튼의 비활성 배경이 반투명 검정이라 흰색 바탕 유지
  googleButton: { backgroundColor: '#FFFFFF', borderRadius: 24, overflow: 'hidden' },
  providerButton: { width: '100%', height: 48 },
});
