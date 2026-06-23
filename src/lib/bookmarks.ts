// 로그인(인증) 없이 동작하는 찜 기능. (브라우저 localStorage 기반)
// Supabase bookmarks 테이블은 auth.uid()에 의존해 비로그인 환경에서 사용자별로 동작하지 않으므로 localStorage를 쓴다.
import { readJSON, writeJSON, subscribe } from './storage';

const STORAGE_KEY = 'filmhere:bookmarks';

export function getBookmarkIds(): string[] {
  const v = readJSON<string[]>(STORAGE_KEY, []);
  return Array.isArray(v) ? v : [];
}

export function isBookmarked(id: string): boolean {
  return getBookmarkIds().includes(id);
}

export function addBookmark(id: string) {
  writeJSON(STORAGE_KEY, [...new Set([...getBookmarkIds(), id])]);
}

export function removeBookmark(id: string) {
  writeJSON(STORAGE_KEY, getBookmarkIds().filter((x) => x !== id));
}

// 토글 후 새 상태(찜됨 여부)를 반환한다.
export function toggleBookmark(id: string): boolean {
  if (isBookmarked(id)) {
    removeBookmark(id);
    return false;
  }
  addBookmark(id);
  return true;
}

export function subscribeBookmarks(cb: () => void) {
  return subscribe(STORAGE_KEY, cb);
}
