'use client';

import { useState, useEffect } from 'react';
import { getMovies } from '@/lib/data';
import { koMatch } from '@/lib/korean';
import { Search, ChevronLeft, Film } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import EmptyState from '@/components/EmptyState';
import { PosterSkeleton } from '@/components/Skeleton';

interface Movie {
  id: string;
  title: string;
  poster_url?: string | null;
  release_year?: number | null;
}

export default function MovieSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAllMovies() {
      setLoading(true);
      setMovies(await getMovies());
      setLoading(false);
    }
    fetchAllMovies();
  }, []);

  const filteredMovies = movies.filter(movie => koMatch(movie.title, searchTerm));

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft size={28} className="text-antique-ivory" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-antique-ivory tracking-tight">
            작품으로 찾기
          </h1>
        </header>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-antique-ivory/40" size={24} />
          <input
            type="text"
            placeholder="영화나 드라마 제목을 입력하세요..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-xl text-antique-ivory focus:outline-none focus:border-antique-ivory/50 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <PosterSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {filteredMovies.map(movie => (
              <Link
                key={movie.id}
                href={`/movie/${movie.id}`}
                className="group flex flex-col space-y-3"
              >
                <div className="aspect-[2/3] relative bg-white/5 rounded-xl overflow-hidden border border-white/5 group-hover:border-antique-ivory/30 transition-all">
                  {movie.poster_url ? (
                    <Image 
                      src={movie.poster_url} 
                      alt={movie.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-2 opacity-30">
                      <Film size={48} />
                      <span className="text-sm">포스터 없음</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-antique-ivory group-hover:text-white transition-colors">{movie.title}</h3>
                  <p className="text-sm text-antique-ivory/40">{movie.release_year}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredMovies.length === 0 && (
          <EmptyState
            icon={Film}
            title="검색 결과가 없습니다."
            description={searchTerm ? `"${searchTerm}"과(와) 일치하는 작품이 없어요.` : '등록된 작품이 없습니다.'}
            action={{ label: '통합 검색으로 찾아보기 →', href: '/search' }}
          />
        )}
      </div>
    </main>
  );
}
