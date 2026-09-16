import { Image } from 'react-native';
import type { PeriodStatus } from '../api';

// 기간 상태 심볼 4종, 색만으로 구분하지 않기 위한 접근성 장치 (Figma StatusIcon 42:36)
const ICONS = {
  PERFECT: require('../assets/flame.png'),
  PASS: require('../assets/check-circle.png'),
  FROZEN: require('../assets/ice.png'),
  FAILED: require('../assets/circle.png'),
};
const LABELS = { PERFECT: '완벽', PASS: '통과', FROZEN: '프리즈', FAILED: '실패' };

export default function StatusIcon({ status, size = 24 }: { status: PeriodStatus; size?: number }) {
  return (
    <Image
      source={ICONS[status]}
      style={{ width: size, height: size }}
      accessibilityLabel={LABELS[status]}
    />
  );
}
