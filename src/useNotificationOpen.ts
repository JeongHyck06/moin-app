import { useEffect } from 'react';
import type { NavigationContainerRef } from '@react-navigation/native';
import { getInitialNotification, getMessaging, onNotificationOpenedApp } from '@react-native-firebase/messaging';
import type { RootStackParamList } from './navigation';
import { isPushAvailable } from './push';

type Nav = React.RefObject<NavigationContainerRef<RootStackParamList> | null>;

const groupIdOf = (data: Record<string, unknown> | undefined) => {
  const id = Number(data?.groupId);
  return Number.isFinite(id) && id > 0 ? id : null;
};

// 알림 탭으로 열린 그룹 상세 이동, 종료 상태에서 열린 경우(getInitialNotification)도 같이 처리
export function useNotificationOpen(nav: Nav, ready: boolean) {
  useEffect(() => {
    if (!ready || !isPushAvailable()) {
      return;
    }
    const messaging = getMessaging();
    const go = (groupId: number | null) => {
      if (groupId !== null) {
        nav.current?.navigate('GroupDetail', { id: groupId });
      }
    };
    getInitialNotification(messaging).then(m => go(groupIdOf(m?.data)));
    return onNotificationOpenedApp(messaging, m => go(groupIdOf(m.data)));
  }, [nav, ready]);
}
