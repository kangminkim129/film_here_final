// FilmHere PWA 서비스워커 — 정적 자원 캐시(앱 셸), 네비게이션은 네트워크 우선.
// 캐시 버전은 릴리스마다 올린다(구 캐시는 activate에서 정리).
const CACHE = 'filmhere-v2';
const APP_SHELL = ['/', '/map', '/search', '/bookmarks', '/manifest.webmanifest', '/icon.svg'];

// 성공한 동일 출처 200(basic) 응답만 캐시 — 404/500/리다이렉트/opaque 캐싱 방지(stale 오염 방지)
function cacheable(res) {
  return res && res.ok && res.status === 200 && res.type === 'basic';
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 외부(Supabase/Mapbox) 및 API 요청은 캐시하지 않음(항상 네트워크)
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api')) return;

  // 페이지 네비게이션: 네트워크 우선, 실패 시 캐시 폴백
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (cacheable(res)) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/')))
    );
    return;
  }

  // 정적 자원: 캐시 우선
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req)
          .then((res) => {
            if (cacheable(res)) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => cached)
    )
  );
});
