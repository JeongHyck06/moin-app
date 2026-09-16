import Svg, { Path } from 'react-native-svg';

// 확정 아이콘이 오면 이 표의 path 만 갈아끼우면 됨, 전부 24px 뷰박스 기준 윤곽선
const PATHS: Record<string, string[]> = {
  home: ['M3 10.5 12 3l9 7.5', 'M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5', 'M9.5 21v-6h5v6'],
  person: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4.5 21a7.5 7.5 0 0 1 15 0'],
};

type Props = { name: keyof typeof PATHS | string; color: string; size?: number };

export default function TabIcon({ name, color, size = 24 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {(PATHS[name] ?? []).map(d => (
        <Path key={d} d={d} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </Svg>
  );
}
