'use client';

import { useState, useEffect } from 'react';
import { getSpotsWithScenes } from '@/lib/data';
import { koMatch } from '@/lib/korean';
import { Search, ChevronLeft, MapPin, Compass } from 'lucide-react';
import Link from 'next/link';
import EmptyState from '@/components/EmptyState';
import { ListRowSkeleton } from '@/components/Skeleton';

interface Spot {
  id: string;
  name: string;
  address: string;
  is_cafe: boolean;
  scenes?: {
    movies: {
      title: string;
    }
  }[];
}

export default function LocationSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAllSpots() {
      setLoading(true);
      const data = await getSpotsWithScenes();
      setSpots([...data].sort((a, b) => a.name.localeCompare(b.name)) as unknown as Spot[]);
      setLoading(false);
    }
    fetchAllSpots();
  }, []);

  const filteredSpots = spots.filter(spot => {
    const movieTitles = spot.scenes?.map(s => s.movies?.title).filter(Boolean).join(' ') || '';
    return koMatch(spot.name, searchTerm) || koMatch(spot.address, searchTerm) || koMatch(movieTitles, searchTerm);
  });

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft size={28} className="text-antique-ivory" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-antique-ivory tracking-tight">
            장소로 찾기
          </h1>
        </header>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-antique-ivory/40" size={24} />
          <input
            type="text"
            placeholder="동네, 건물명, 작품 제목을 입력하세요..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-xl text-antique-ivory focus:outline-none focus:border-antique-ivory/50 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <ListRowSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSpots.map(spot => {
              // Extract unique movie titles
              const uniqueMovies = Array.from(new Set(spot.scenes?.map(s => s.movies?.title))).filter(Boolean);
              
              return (
                <div
                  key={spot.id}
                  className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-antique-ivory/30 transition-all hover:bg-white/10 gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${spot.is_cafe ? 'bg-amber-400/10 text-amber-400' : 'bg-antique-ivory/10 text-antique-ivory'}`}>
                      <MapPin size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-medium text-antique-ivory">{spot.name}</h3>
                        {uniqueMovies.length > 0 && (
                          <span className="text-[10px] px-2 py-0.5 bg-antique-ivory/10 text-antique-ivory/60 rounded-full border border-antique-ivory/20">
                            {uniqueMovies[0]} {uniqueMovies.length > 1 && `외 ${uniqueMovies.length - 1}`}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-antique-ivory/40">{spot.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 self-end md:self-center">
                    <Link
                      href={`/spot/${spot.id}`}
                      className="text-xs text-antique-ivory/50 hover:text-antique-ivory hover:underline transition-colors"
                    >
                      상세 정보 보기 &rarr;
                    </Link>
                    <Link
                      href={`/map?spot_id=${spot.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-antique-ivory hover:text-black rounded-xl text-xs font-semibold text-antique-ivory/80 transition-all"
                    >
                      <Compass size={12} />
                      지도로 보기
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredSpots.length === 0 && (
          <EmptyState
            icon={MapPin}
            title="검색 결과가 없습니다."
            description={searchTerm ? `"${searchTerm}"과(와) 일치하는 장소가 없어요.` : '등록된 촬영지가 없습니다.'}
            action={{ label: '통합 검색으로 찾아보기 →', href: '/search' }}
          />
        )}
      </div>
    </main>
  );
}
