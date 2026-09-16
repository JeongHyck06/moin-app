// "1.2.3" 비교, 자리수가 달라도 없는 자리는 0 으로 취급
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) {
      return d < 0 ? -1 : 1;
    }
  }
  return 0;
}

export const isOutdated = (current: string, required: string) => compareVersions(current, required) < 0;
