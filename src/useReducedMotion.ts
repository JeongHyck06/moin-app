import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// 기기 설정 변경도 즉시 반영, 큰 화면 이동 대신 짧은 전환 사용
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (alive) setReduced(value); }).catch(() => {});
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { alive = false; listener.remove(); };
  }, []);
  return reduced;
}
