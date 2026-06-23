// "가본 곳" 방문 기록 + 스탬프. (로그인 불필요, localStorage)
import { readJSON, writeJSON, subscribe } from './storage';

const KEY = 'filmhere:visited';

export function getVisitedIds(): string[] {
  const v = readJSON<string[]>(KEY, []);
  return Array.isArray(v) ? v : [];
}

export function isVisited(id: string): boolean {
  return getVisitedIds().includes(id);
}

export function toggleVisited(id: string): boolean {
  const set = new Set(getVisitedIds());
  let nowVisited: boolean;
  if (set.has(id)) {
    set.delete(id);
    nowVisited = false;
  } else {
    set.add(id);
    nowVisited = true;
  }
  writeJSON(KEY, [...set]);
  return nowVisited;
}

export function subscribeVisited(cb: () => void) {
  return subscribe(KEY, cb);
}
