// localStorage JSON 헬퍼 + 변경 알림(같은 탭 내 구독). SSR 안전.

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // 같은 탭에서도 구독자가 반응하도록 커스텀 이벤트 발행
    window.dispatchEvent(new CustomEvent('filmhere:storage', { detail: { key } }));
  } catch {
    /* 용량 초과 등은 무시 */
  }
}

// key 변경 구독. 반환값으로 해제.
export function subscribe(key: string, cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (!detail || detail.key === key) cb();
  };
  const storageHandler = (e: StorageEvent) => {
    if (e.key === key) cb();
  };
  window.addEventListener('filmhere:storage', handler);
  window.addEventListener('storage', storageHandler);
  return () => {
    window.removeEventListener('filmhere:storage', handler);
    window.removeEventListener('storage', storageHandler);
  };
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}
