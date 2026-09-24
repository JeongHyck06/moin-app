import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { createSeenCheckInsStore } from './seenCheckIns';

const SeenContext = createContext(createSeenCheckInsStore(null));

// 로그아웃·계정 변경 시 별도 저장소로 교체, 다른 계정의 읽음 상태 공유 방지
export function SeenCheckInsProvider({ userId, children }: { userId: number | null; children: ReactNode }) {
  const store = useMemo(() => createSeenCheckInsStore(userId), [userId]);
  useEffect(() => { store.load(); }, [store]);
  return <SeenContext.Provider value={store}>{children}</SeenContext.Provider>;
}

export function useSeenCheckIns() {
  const store = useContext(SeenContext);
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  return { ...snapshot, markSeen: store.markSeen };
}
