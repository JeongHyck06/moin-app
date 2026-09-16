// Figma Moin 변수 (다크 우선, 오렌지 틴트)
export const colors = {
  canvas: '#000000',
  surface: '#1C1C1E',
  separator: '#38383A',
  fillSecondary: 'rgba(120,120,128,0.32)',
  fillTertiary: 'rgba(118,118,128,0.24)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(235,235,245,0.7)',
  textTertiary: 'rgba(235,235,245,0.3)',
  accent: '#FF9230',
  kakao: '#FEE500',
  kakaoText: '#1A1A1A',
} as const;

export const radius = { lg: 20, card: 26, full: 999 } as const;
export const spacing = { sm: 12, md: 16, lg: 20 } as const;

// 그룹형 리스트 카드 (옵션 목록, 요약, 홈 카드가 공유)
export const card = { backgroundColor: colors.surface, borderRadius: radius.card, overflow: 'hidden' as const };
