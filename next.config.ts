import type { NextConfig } from "next";

// ── 보안 응답 헤더 (sentinel 점검: CSP·클릭재킹·MIME·Referrer·Permissions 등) ──
// CSP는 Mapbox GL(웹워커/blob), Supabase(REST/Realtime), 외부 포스터 이미지가 동작하도록 허용한다.
const ContentSecurityPolicy = [
  "default-src 'self'",
  // Next.js 런타임은 인라인/eval 스크립트를 사용하므로 허용(엄격 nonce 전환은 후속 과제)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // Supabase REST/Realtime + Mapbox 타일/스타일/이벤트
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://events.mapbox.com https://*.tiles.mapbox.com",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // 위치 기능(내 주변)은 자기 출처에서만 허용, 나머지는 차단
  { key: 'Permissions-Policy', value: 'geolocation=(self), camera=(), microphone=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Origin-Agent-Cluster', value: '?1' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
];

const nextConfig: NextConfig = {
  // 서버 지문(X-Powered-By) 제거
  poweredByHeader: false,
  images: {
    // 외부 포스터/스틸컷 어떤 https 호스트든 next/image 최적화 허용
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
