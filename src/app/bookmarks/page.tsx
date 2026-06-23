'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Bookmark, MapPin, Film, Compass } from 'lucide-react';
import Link from 'next/link';

interface BookmarkedSpot {
  id: string;
  spots: {
    id: string;
    name: string;
    address: string;
    is_cafe: boolean;
  };
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchBookmarks() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }
      setUser(session.user);

      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          id,
          spots (
            id,
            name,
            address,
            is_cafe
          )
        `)
        .eq('user_id', session.user.id);
      
      if (!error) setBookmarks(data as unknown as BookmarkedSpot[] || []);
      setLoading(false);
    }
    fetchBookmarks();
  }, []);

  if (!loading && !user) {
    return (
      <main className="min-h-screen bg-background p-6 md:p-12 flex flex-col justify-center items-center text-center">
        <div className="max-w-md w-full space-y-6 bg-zinc-950/40 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          <div className="p-4 bg-antique-ivory/5 rounded-full inline-block border border-white/5">
            <Bookmark size={32} className="text-antique-ivory/50" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-antique-ivory">로그인이 필요합니다</h2>
            <p className="text-sm text-antique-ivory/50 font-light leading-relaxed">찜한 장소 목록을 확인하고 관리하시려면 로그인이 필요합니다.</p>
          </div>
          <div className="flex gap-4 pt-2">
            <Link 
              href="/" 
              className="flex-1 py-3 border border-white/10 text-antique-ivory/80 rounded-xl text-xs font-semibold hover:bg-white/5 transition-all text-center"
            >
              홈으로
            </Link>
            <Link 
              href="/login" 
              className="flex-1 py-3 bg-antique-ivory text-black rounded-xl text-xs font-bold hover:bg-white transition-all text-center shadow-lg"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft size={28} className="text-antique-ivory" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-antique-ivory tracking-tight">
            내 찜 목록
          </h1>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse text-antique-ivory/50">찜한 장소 불러오는 중...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="group p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-antique-ivory/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-full ${bookmark.spots.is_cafe ? 'bg-amber-400/10 text-amber-400' : 'bg-antique-ivory/10 text-antique-ivory'}`}>
                      <MapPin size={24} />
                    </div>
                    <Bookmark size={20} className="text-antique-ivory" fill="currentColor" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-antique-ivory">{bookmark.spots.name}</h3>
                    <p className="text-sm text-antique-ivory/40 line-clamp-1">{bookmark.spots.address}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                  <Link 
                    href={`/spot/${bookmark.spots.id}`}
                    className="text-xs text-antique-ivory/50 hover:text-antique-ivory hover:underline transition-colors"
                  >
                    상세 보기 &rarr;
                  </Link>
                  <Link 
                    href={`/map?spot_id=${bookmark.spots.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-antique-ivory hover:text-black rounded-xl text-xs font-semibold text-antique-ivory/80 transition-all"
                  >
                    <Compass size={12} />
                    지도로 보기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && bookmarks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 space-y-6 text-center">
            <div className="p-6 bg-white/5 rounded-full">
              <Film size={48} className="text-antique-ivory/20" />
            </div>
            <div className="space-y-2">
              <p className="text-xl text-antique-ivory/40 font-light">아직 찜한 장소가 없습니다.</p>
              <Link href="/map" className="text-antique-ivory hover:underline underline-offset-4">
                지도에서 새로운 장소를 찾아보세요
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
