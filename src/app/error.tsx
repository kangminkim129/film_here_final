'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[FilmHere] route error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="p-5 bg-white/5 rounded-full border border-white/10">
        <AlertTriangle size={40} className="text-amber-400/80" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-antique-ivory">문제가 발생했어요</h1>
        <p className="text-sm text-antique-ivory/50 max-w-sm">
          일시적인 오류일 수 있습니다. 다시 시도하거나 홈으로 이동해 주세요.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 bg-antique-ivory text-black rounded-xl text-sm font-bold hover:bg-white transition-all active:scale-95"
        >
          <RotateCcw size={16} />
          다시 시도
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-antique-ivory rounded-xl text-sm font-semibold hover:bg-white/10 transition-all"
        >
          <Home size={16} />
          홈으로
        </Link>
      </div>
    </main>
  );
}
