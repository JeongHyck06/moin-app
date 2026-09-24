import { Platform } from 'react-native';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import { logout as kakaoLogout } from '@react-native-seoul/kakao-login';
import { api, type LoginResponse } from './api';
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from './config';

export const googleLoginReady = GOOGLE_WEB_CLIENT_ID.length > 0
  && (Platform.OS !== 'ios' || GOOGLE_IOS_CLIENT_ID.length > 0);
export const appleLoginSupported = Platform.OS === 'ios' && appleAuth.isSupported;

// 연결 해제 없이 SDK 로그인 캐시만 정리, 다음 로그인에서 계정 선택 가능
export async function clearSocialLogin() {
  await Promise.allSettled([
    Promise.resolve().then(() => GoogleSignin.signOut()),
    Promise.resolve().then(() => kakaoLogout()),
  ]);
}

if (googleLoginReady) {
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, iosClientId: GOOGLE_IOS_CLIENT_ID || undefined });
}

// 클라이언트 프로필이 아닌 공급자 ID 토큰을 서버에 전달, 취소는 조용히 로그인 화면으로 복귀
export async function loginWithGoogle(): Promise<LoginResponse | null> {
  if (!googleLoginReady) throw new Error('Google 로그인을 준비 중이에요. 다른 로그인 방법을 이용해 주세요.');
  try {
    if (Platform.OS === 'android') await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const result = await GoogleSignin.signIn();
    if (!isSuccessResponse(result)) return null;
    if (!result.data.idToken) throw new Error('Google 인증 정보를 받지 못했어요. 다시 시도해 주세요.');
    return await api<LoginResponse>('POST', '/auth/google', { idToken: result.data.idToken });
  } catch (error) {
    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) return null;
      // Android OAuth의 패키지·서명 지문 불일치는 사용자 재인증으로 해결되지 않음
      if (error.code === '10' || error.code === 'DEVELOPER_ERROR') {
        throw new Error('앱의 Google 로그인 설정에 문제가 있어요. 다른 로그인 방법을 이용해 주세요.');
      }
    }
    throw error;
  }
}

// nonce는 서버에서 발급하고 SDK가 SHA-256 처리, 첫 로그인에서만 오는 이름은 선택 항목
export async function loginWithApple(): Promise<LoginResponse | null> {
  if (!appleLoginSupported) throw new Error('이 기기에서는 Apple 로그인을 사용할 수 없어요.');
  const { nonce } = await api<{ nonce: string }>('POST', '/auth/apple/challenge');
  try {
    const result = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      nonce,
    });
    if (!result.identityToken) throw new Error('Apple 인증 정보를 받지 못했어요. 다시 시도해 주세요.');
    const fullName = [result.fullName?.familyName, result.fullName?.givenName].filter(Boolean).join(' ').slice(0, 100);
    return await api<LoginResponse>('POST', '/auth/apple', { identityToken: result.identityToken, nonce, fullName: fullName || undefined });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === appleAuth.Error.CANCELED) return null;
      if (error.code === appleAuth.Error.UNKNOWN) {
        throw new Error('Apple 로그인을 완료하지 못했어요. 기기 설정에서 Apple 계정 로그인을 확인한 뒤 다시 시도해 주세요.');
      }
    }
    throw error;
  }
}
