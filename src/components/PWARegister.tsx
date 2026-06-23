'use client';

import { useEffect } from 'react';

// 서비스워커 등록 (PWA). 운영 환경에서만 등록.
export default function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;
    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* 등록 실패는 무시 */
      });
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
  return null;
}
