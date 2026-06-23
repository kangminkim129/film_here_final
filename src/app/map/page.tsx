import MapComponent from '@/components/MapComponent';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Suspense } from 'react';

export default function MapPage() {
  return (
    <main className="relative flex flex-col h-screen overflow-hidden">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-[100]">
        <Link 
          href="/" 
          className="flex items-center gap-1 px-3 py-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg text-antique-ivory hover:bg-black/80 transition-colors shadow-2xl"
        >
          <ChevronLeft size={20} />
          <span>홈으로</span>
        </Link>
      </div>

      <Suspense fallback={
        <div className="w-full h-full bg-cinematic-dark flex items-center justify-center text-antique-ivory/50 animate-pulse">
          지도 로딩 중...
        </div>
      }>
        <MapComponent />
      </Suspense>
    </main>
  );
}

