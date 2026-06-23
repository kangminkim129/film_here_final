import { Film } from 'lucide-react';

export default function Loading() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Film size={36} className="text-antique-ivory/30 animate-pulse" />
      <div className="animate-spin w-6 h-6 border-2 border-antique-ivory/70 border-t-transparent rounded-full" />
      <span className="text-xs text-antique-ivory/40 font-light tracking-widest">불러오는 중...</span>
    </main>
  );
}
