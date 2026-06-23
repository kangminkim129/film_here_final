// 최근 본 촬영지 히스토리 (localStorage, 최신순, 최대 20개)
import { readJSON, writeJSON, subscribe } from './storage';

const KEY = 'filmhere:recentSpots';
const MAX = 20;

export function getRecentSpotIds(): string[] {
  const v = readJSON<string[]>(KEY, []);
  return Array.isArray(v) ? v : [];
}

export function pushRecentSpot(id: string): void {
  const list = getRecentSpotIds().filter((x) => x !== id);
  list.unshift(id);
  writeJSON(KEY, list.slice(0, MAX));
}

export function subscribeRecent(cb: () => void) {
  return subscribe(KEY, cb);
}
