// 거리 계산 · 거리순 정렬 · 투어 동선(최근접 이웃) 최적화
import type { Coord } from './types';

const R = 6371; // 지구 반지름(km)
const toRad = (d: number) => (d * Math.PI) / 180;

export function haversineKm(a: Coord, b: Coord): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
}

// origin 기준 가까운 순으로 정렬(원본 배열 불변). distance(km)를 부여해 반환.
export function sortByDistance<T extends Coord>(
  items: T[],
  origin: Coord
): (T & { distanceKm: number })[] {
  return items
    .map((it) => ({ ...it, distanceKm: haversineKm(origin, it) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

// 최근접 이웃 휴리스틱으로 방문 동선 순서를 정한다(작은 코스용으로 충분).
export function nearestNeighborOrder<T extends Coord>(origin: Coord, points: T[]): T[] {
  const remaining = [...points];
  const ordered: T[] = [];
  let cur: Coord = origin;
  while (remaining.length) {
    let bestIdx = 0;
    let bestDist = Infinity;
    remaining.forEach((p, i) => {
      const d = haversineKm(cur, p);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push(next);
    cur = next;
  }
  return ordered;
}
