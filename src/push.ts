import { PermissionsAndroid, Platform } from 'react-native';
import { getApps } from '@react-native-firebase/app';
import { getMessaging, getToken, onTokenRefresh, requestPermission } from '@react-native-firebase/messaging';
import { api } from './api';

// google-services.json / GoogleService-Info.plist 가 없으면 앱이 초기화되지 않는다, 그 경우 푸시는 통째로 건너뜀
export const isPushAvailable = () => getApps().length > 0;

const sendToken = (token: string) =>
  api<void>('POST', '/me/push-token', { token, platform: Platform.OS }).catch(() => {
    // 토큰 등록 실패는 화면을 막을 이유가 없음, 다음 실행이나 갱신 때 다시 보냄
  });

// 로그인 뒤 한 번 호출, 반환한 함수로 토큰 갱신 구독을 해제
export async function registerPushToken(): Promise<() => void> {
  if (!isPushAvailable()) {
    return () => {};
  }
  const messaging = getMessaging();
  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  } else {
    await requestPermission(messaging);
  }
  await sendToken(await getToken(messaging));
  return onTokenRefresh(messaging, sendToken);
}
