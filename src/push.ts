import { PermissionsAndroid, Platform } from 'react-native';
import { getApps } from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  isDeviceRegisteredForRemoteMessages,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  requestPermission,
} from '@react-native-firebase/messaging';
import { api } from './api';

// google-services.json / GoogleService-Info.plist 가 없으면 앱이 초기화되지 않는다, 그 경우 푸시는 통째로 건너뜀
export const isPushAvailable = () => getApps().length > 0;

const sendToken = (token: string) =>
  api<void>('POST', '/me/push-token', { token, platform: Platform.OS }).catch(() => {
    // 토큰 등록 실패는 화면을 막을 이유가 없음, 다음 실행이나 갱신 때 다시 보냄
  });

// 로그인 뒤 한 번 호출, 반환한 함수로 토큰 갱신 구독을 해제
// 푸시는 부가 기능이라 실패해도 화면을 막지 않는다, 여기서 전부 삼키지 않으면 호출부의 unhandled rejection 으로 LogBox 가 뜬다
export async function registerPushToken(): Promise<() => void> {
  if (!isPushAvailable()) {
    return () => {};
  }
  try {
    const messaging = getMessaging();
    if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    } else {
      await requestPermission(messaging);
    }
    // iOS 는 APNs 등록이 먼저다, 건너뛰면 getToken 이 messaging/unregistered 로 거부한다
    // 시뮬레이터는 APNs 토큰을 못 받아 여기서 실패하는 게 정상이고, 그대로 catch 로 빠진다
    if (Platform.OS === 'ios' && !isDeviceRegisteredForRemoteMessages(messaging)) {
      await registerDeviceForRemoteMessages(messaging);
    }
    await sendToken(await getToken(messaging));
    return onTokenRefresh(messaging, sendToken);
  } catch {
    return () => {};
  }
}
