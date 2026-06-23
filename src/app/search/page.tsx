'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { getSpotsWithScenes, getMovies } from '@/lib/data';
import { koMatch } from '@/lib/korean';
import {
  getRecentSearches,
  pushRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  subscribeRecentSearches,
} from '@/lib/recentSearches';
import { Search, ChevronLeft, MapPin, Film, Compass, X, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import EmptyState from '@/components/EmptyState';
import { ListRowSkeleton } from '@/components/Skeleton';
import type { Movie, Spot } from '@/lib/types';

type Tab = 'all' | 'spot' | 'movie';

export default function UnifiedSearchPage() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [cafeOnly, setCafeOnly] = useState(false);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState<string[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [s, m] = await Promise.all([getSpotsWithScenes(), getMovies()]);
      setSpots(s);
      setMovies(m);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    setRecent(getRecentSearches());
    return subscribeRecentSearches(() => setRecent(getRecentSearches()));
  }, []);

  // 홈/외부에서 ?q= 로 진입 시 초기 검색어 적용
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initial = new URLSearchParams(window.location.search).get('q');
    if (initial) {
      setQuery(initial);
      pushRecentSearch(initial);
    }
  }, []);

  const q = query.trim();

  const matchedSpots = useMemo(() => {
    let list = spots;
    if (cafeOnly) list = list.filter((s) => s.is_cafe);
    if (!q) return list;
    return list.filter(
      (s) =>
        koMatch(s.name, q) ||
        koMatch(s.address, q) ||
        (s.scenes?.some((sc) => koMatch(sc.movies?.title, q)) ?? false)
    );
  }, [spots, q, cafeOnly]);

  const matchedMovies = useMemo(() => {
    if (!q) return movies;
    return movies.filter((m) => koMatch(m.title, q));
  }, [movies, q]);

  // 인기 검색(데이터 기반 임시): 작품 제목 상위
  const popular = useMemo(() => movies.slice(0, 6).map((m) => m.title), [movies]);

  // 자동완성 추천(최대 6)
  const suggestions = useMemo(() => {
    if (!q) return [];
    const names = [
      ...matchedMovies.map((m) => ({ label: m.title, href: `/movie/${m.id}`, kind: 'movie' as const })),
      ...matchedSpots.map((s) => ({ label: s.name, href: `/spot/${s.id}`, kind: 'spot' as const })),
    ];
    return names.slice(0, 6);
  }, [q, matchedMovies, matchedSpots]);

  const commitSearch = (term: string) => {
    setQuery(term);
    pushRecentSearch(term);
    setShowSuggest(false);
    inputRef.current?.blur();
  };

  const totalResults = matchedSpots.length + matchedMovies.length;
  const showMovies = tab !== 'spot';
  const showSpots = tab !== 'movie';

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft size={28} className="text-antique-ivory" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-antique-ivory tracking-tight">통합 검색</h1>
        </header>

        {/* Search input + autocomplete */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-antique-ivory/40" size={24} />
          <input
            ref={inputRef}
            type="text"
            autoFocus
            placeholder="영화·드라마·촬영지·동네를 한 번에 검색"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-12 text-lg text-antique-ivory focus:outline-none focus:border-antique-ivory/50 transition-colors"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggest(true);
            }}
            onFocus={() => setShowSuggest(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && q) commitSearch(q);
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-antique-ivory/40 hover:text-white">
              <X size={20} />
            </button>
          )}

          {showSuggest && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 z-30 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {suggestions.map((s, i) => (
                <Link
                  key={i}
                  href={s.href}
                  onClick={() => pushRecentSearch(q)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-antique-ivory hover:bg-white/5 transition-colors"
                >
                  {s.kind === 'movie' ? <Film size={14} className="text-antique-ivory/40" /> : <MapPin size={14} className="text-antique-ivory/40" />}
                  <span className="truncate">{s.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent + popular (검색어 없을 때) */}
        {!q && (
          <div className="space-y-5">
            {recent.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-antique-ivory/50 flex items-center gap-1.5">
                    <Clock size={12} /> 최근 검색
                  </span>
                  <button onClick={clearRecentSearches} className="text-[10px] text-antique-ivory/30 hover:text-white">
                    전체 삭제
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((t) => (
                    <span
                      key={t}
                      className="group flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-antique-ivory/80"
                    >
                      <button onClick={() => commitSearch(t)} className="hover:text-white">
                        {t}
                      </button>
                      <button onClick={() => removeRecentSearch(t)} className="text-antique-ivory/30 hover:text-white">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {popular.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-antique-ivory/50 flex items-center gap-1.5">
                  <TrendingUp size={12} /> 인기 검색
                </span>
                <div className="flex flex-wrap gap-2">
                  {popular.map((t) => (
                    <button
                      key={t}
                      onClick={() => commitSearch(t)}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-antique-ivory/80 hover:bg-antique-ivory hover:text-black transition-all"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs + filter */}
        {q && (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-1.5">
              {([['all', '전체'], ['spot', '촬영지'], ['movie', '작품']] as [Tab, string][]).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    tab === id ? 'bg-antique-ivory text-black border-antique-ivory' : 'border-white/10 text-antique-ivory/60 hover:text-white'
                  }`}
                >
                  {label}
                  {id === 'spot' && ` ${matchedSpots.length}`}
                  {id === 'movie' && ` ${matchedMovies.length}`}
                </button>
              ))}
            </div>
            {showSpots && (
              <button
                onClick={() => setCafeOnly((v) => !v)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  cafeOnly ? 'bg-amber-400 text-black border-amber-400' : 'border-white/10 text-antique-ivory/60'
                }`}
              >
                카페만
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="space-y-4">
            <ListRowSkeleton />
            <ListRowSkeleton />
            <ListRowSkeleton />
          </div>
        ) : q && totalResults === 0 ? (
          <EmptyState
            icon={Search}
            title="검색 결과가 없습니다."
            description={`"${q}"에 대한 결과를 찾지 못했어요.`}
            suggestions={popular.slice(0, 5).map((t) => ({ label: t, onClick: () => commitSearch(t) }))}
          />
        ) : (
          <div className="space-y-10">
            {/* Movies */}
            {showMovies && matchedMovies.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-sm font-bold text-antique-ivory/60 uppercase tracking-wider">작품 {matchedMovies.length}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {matchedMovies.map((m) => (
                    <Link key={m.id} href={`/movie/${m.id}`} className="group flex flex-col space-y-2" onClick={() => q && pushRecentSearch(q)}>
                      <div className="aspect-[2/3] relative bg-white/5 rounded-xl overflow-hidden border border-white/5 group-hover:border-antique-ivory/30 transition-all">
                        {m.poster_url ? (
                          <Image src={m.poster_url} alt={m.title} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1 opacity-30">
                            <Film size={36} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-antique-ivory truncate group-hover:text-white">{m.title}</h3>
                        <p className="text-xs text-antique-ivory/40">{m.release_year}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Spots */}
            {showSpots && matchedSpots.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-sm font-bold text-antique-ivory/60 uppercase tracking-wider">촬영지 {matchedSpots.length}</h2>
                <div className="space-y-3">
                  {matchedSpots.map((spot) => {
                    const uniqueMovies = Array.from(new Set(spot.scenes?.map((s) => s.movies?.title))).filter(Boolean) as string[];
                    return (
                      <div
                        key={spot.id}
                        className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-antique-ivory/30 transition-all hover:bg-white/10 gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`p-3 rounded-full shrink-0 ${spot.is_cafe ? 'bg-amber-400/10 text-amber-400' : 'bg-antique-ivory/10 text-antique-ivory'}`}>
                            <MapPin size={22} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-medium text-antique-ivory truncate">{spot.name}</h3>
                              {uniqueMovies.length > 0 && (
                                <span className="text-[10px] px-2 py-0.5 bg-antique-ivory/10 text-antique-ivory/60 rounded-full border border-antique-ivory/20 shrink-0">
                                  {uniqueMovies[0]} {uniqueMovies.length > 1 && `외 ${uniqueMovies.length - 1}`}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-antique-ivory/40 truncate">{spot.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                          <Link href={`/spot/${spot.id}`} className="text-xs text-antique-ivory/50 hover:text-antique-ivory hover:underline">
                            상세 &rarr;
                          </Link>
                          <Link
                            href={`/map?spot_id=${spot.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-antique-ivory hover:text-black rounded-xl text-xs font-semibold text-antique-ivory/80 transition-all"
                          >
                            <Compass size={12} />
                            지도
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
