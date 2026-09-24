import AsyncStorage from '@react-native-async-storage/async-storage';

type Snapshot = { ready: boolean; ids: ReadonlySet<number> };
const validId = (id: unknown): id is number => typeof id === 'number' && Number.isSafeInteger(id) && id > 0;

// 계정별 기기 저장소, 읽는 도중 본 인증도 합쳐 보존하고 쓰기는 순서대로 처리
export function createSeenCheckInsStore(userId: number | null) {
  const key = `moin.seen-check-ins.${userId}`;
  let snapshot: Snapshot = { ready: userId === null, ids: new Set() };
  let disposed = false;
  let loading: Promise<void> | undefined;
  let writes = Promise.resolve();
  const listeners = new Set<() => void>();
  const publish = (next: Snapshot) => { snapshot = next; listeners.forEach(fn => fn()); };
  const save = () => {
    const value = JSON.stringify([...snapshot.ids]);
    writes = writes.then(() => AsyncStorage.setItem(key, value)).catch(() => {});
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    load: () => {
      if (userId === null) return Promise.resolve();
      loading ??= AsyncStorage.getItem(key).then(raw => {
        try {
          const parsed: unknown = JSON.parse(raw ?? '[]');
          return Array.isArray(parsed) ? parsed.filter(validId) : [];
        } catch { return []; }
      }).catch(() => []).then(saved => {
        if (disposed) return;
        const changed = snapshot.ids.size > 0;
        publish({ ready: true, ids: new Set([...saved, ...snapshot.ids]) });
        if (changed) save();
      });
      return loading;
    },
    markSeen: (id: number | null) => {
      if (disposed || userId === null || !validId(id) || snapshot.ids.has(id)) return;
      publish({ ...snapshot, ids: new Set([...snapshot.ids, id]) });
      if (snapshot.ready) save();
    },
    clear: async () => {
      disposed = true;
      await writes;
      await AsyncStorage.removeItem(key);
      publish({ ready: true, ids: new Set() });
    },
    flush: () => writes,
  };
}
