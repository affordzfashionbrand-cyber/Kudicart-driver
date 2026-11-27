export const APP_VERSION = '1.0.0';
export const APP_NAME = 'KudiCart Driver';

export function compareSemver(a: string, b: string): number {
  const parse = (v: string) =>
    String(v || '0.0.0')
      .replace(/^v/i, '')
      .split('.')
      .map((part) => parseInt(part.replace(/[^0-9]/g, ''), 10) || 0);
  const pa = parse(a);
  const pb = parse(b);
  const len = Math.max(pa.length, pb.length, 3);
  for (let i = 0; i < len; i++) {
    const va = pa[i] || 0;
    const vb = pb[i] || 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
}
