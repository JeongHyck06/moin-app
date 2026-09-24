import { AppState, Platform } from 'react-native';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';

let pending: Promise<void> | undefined;

// 시스템 동의창이 겹치지 않도록 앱 활성 상태에서만 요청, 거절은 광고 보상 조건이 아님
export function requestTrackingConsent(): Promise<void> {
  if (Platform.OS !== 'ios') return Promise.resolve();
  pending ??= (async () => {
    if (AppState.currentState !== 'active') {
      await new Promise<void>((resolve, reject) => {
        const subscription = AppState.addEventListener('change', state => {
          if (state === 'active') { clearTimeout(timer); subscription.remove(); resolve(); }
        });
        const timer = setTimeout(() => { subscription.remove(); reject(new Error('앱으로 돌아온 뒤 다시 시도해주세요')); }, 30000);
      });
    }
    const permission = PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY;
    if (await check(permission) === RESULTS.DENIED) await request(permission);
  })().finally(() => { pending = undefined; });
  return pending;
}
