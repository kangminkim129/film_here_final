// 최근 검색어 (localStorage, 최대 8개)
import { readJSON, writeJSON, subscribe } from './storage';

const KEY = 'filmhere:recentSearches';
const MAX = 8;

export function getRecentSearches(): string[] {
  const v = readJSON<string[]>(KEY, []);
  return Array.isArray(v) ? v : [];
}

export function pushRecentSearch(term: string): void {
  const t = term.trim();
  if (!t) return;
  const list = getRecentSearches().filter((x) => x !== t);
  list.unshift(t);
  writeJSON(KEY, list.slice(0, MAX));
}

export function removeRecentSearch(term: string): void {
  writeJSON(KEY, getRecentSearches().filter((x) => x !== term));
}

export function clearRecentSearches(): void {
  writeJSON(KEY, []);
}

export function subscribeRecentSearches(cb: () => void) {
  return subscribe(KEY, cb);
}
