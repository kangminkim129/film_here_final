import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="p-5 bg-white/5 rounded-full border border-white/10">
        <Compass size={40} className="text-antique-ivory/40" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-antique-ivory">404</h1>
        <p className="text-sm text-antique-ivory/50">찾으시는 페이지가 없습니다.</p>
      </div>
      <Link
        href="/"
        className="flex items-center gap-2 px-5 py-2.5 bg-antique-ivory text-black rounded-xl text-sm font-bold hover:bg-white transition-all active:scale-95"
      >
        <Home size={16} />
        홈으로
      </Link>
    </main>
  );
}
